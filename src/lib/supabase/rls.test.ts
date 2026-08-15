import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { Pool, type PoolClient } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Testes das políticas de RLS contra um PostgreSQL de verdade.
 *
 * Política escrita não é política funcionando: uma cláusula `using` errada
 * falha em silêncio e só aparece quando alguém lê o que não devia. Aqui as
 * migrações reais são aplicadas num banco limpo e cada perfil é exercitado
 * como o PostgREST faria — setando `request.jwt.claims` e assumindo o papel
 * `authenticated`.
 *
 * Roda quando `DATABASE_URL_TESTE` aponta para um Postgres descartável.
 * Sem ela, a suíte é pulada com aviso (ver README e o job do CI).
 */

const URL_TESTE = process.env.DATABASE_URL_TESTE
const temBanco = Boolean(URL_TESTE)

const USUARIOS = {
  cam: '11111111-1111-4111-8111-111111111111',
  areaAps: '22222222-2222-4222-8222-222222222222',
  gestorAps: '33333333-3333-4333-8333-333333333333',
  auditoria: '44444444-4444-4444-8444-444444444444',
  gestorVis: '55555555-5555-4555-8555-555555555555',
} as const

let pool: Pool

async function aplicarMigracoes(): Promise<void> {
  const raiz = process.cwd()
  const cliente = await pool.connect()
  try {
    await cliente.query('drop schema if exists public cascade')
    await cliente.query('drop schema if exists app cascade')
    await cliente.query('drop schema if exists auth cascade')
    await cliente.query('create schema public')

    await cliente.query(await readFile(join(raiz, 'supabase/testes/stubs-locais.sql'), 'utf8'))

    const pasta = join(raiz, 'supabase/migrations')
    const arquivos = (await readdir(pasta)).filter((a) => a.endsWith('.sql')).sort()
    for (const arquivo of arquivos) {
      await cliente.query(await readFile(join(pasta, arquivo), 'utf8'))
    }
  } finally {
    cliente.release()
  }
}

async function semear(): Promise<void> {
  const cliente = await pool.connect()
  try {
    await cliente.query(`
      insert into areas (id, sigla, nome) values
        ('aps', 'APS', 'Atenção Primária'),
        ('vis', 'VIS', 'Vigilância em Saúde');

      insert into gestores (id, nome, cargo, area_id) values
        ('g-aps', 'Gestor APS', 'Coordenação', 'aps'),
        ('g-vis', 'Gestor VIS', 'Gerência', 'vis');

      insert into usuarios (id, nome, perfil, area_id, gestor_id) values
        ('${USUARIOS.cam}', 'Comissão', 'cam', null, null),
        ('${USUARIOS.areaAps}', 'Técnica APS', 'area_tecnica', 'aps', null),
        ('${USUARIOS.gestorAps}', 'Gestor APS', 'gestor', null, 'g-aps'),
        ('${USUARIOS.gestorVis}', 'Gestor VIS', 'gestor', null, 'g-vis'),
        ('${USUARIOS.auditoria}', 'Auditoria', 'auditoria', null, null);

      insert into indicadores (id, area_id, nome, unidade, direcao, fonte, periodicidade, meta, peso) values
        ('ind-aps', 'aps', 'Cobertura de equipes', '%', 'maior_melhor', 'sintético', 'mensal', 85, 3),
        ('ind-vis', 'vis', 'Vacinação em dia', '%', 'maior_melhor', 'sintético', 'mensal', 95, 3);

      insert into regras_pontuacao
        (id, versao, descricao, vigente_de, vigente_ate, faixas, pontuacao_maxima,
         faixas_gratificacao, arredondamento, teto_atingimento, sem_lancamento)
      values
        ('regra-v1', 1, 'Faixas iniciais', '2026-01', null,
         '[{"de":0,"ate":0.7,"pontos":0},{"de":0.7,"ate":null,"pontos":10}]'::jsonb, 10,
         '[{"de":0,"ate":null,"rotulo":"integral","percentual":100}]'::jsonb,
         '{"casas":2,"modo":"meio_para_cima"}'::jsonb, 1.5, 'zera_com_aviso');

      insert into ciclos (id, competencia, estado, janela_lancamento_inicio, janela_lancamento_fim, regra_id)
      values ('c1', '2026-01', 'lancamento_aberto', now() - interval '1 day', now() + interval '10 days', 'regra-v1');

      insert into lancamentos (id, indicador_id, ciclo_id, valor, evidencia, autor) values
        ('aaaaaaaa-0000-4000-8000-000000000001', 'ind-aps', 'c1', 80, 'extração sintética aps', 'seed'),
        ('aaaaaaaa-0000-4000-8000-000000000002', 'ind-vis', 'c1', 90, 'extração sintética vis', 'seed');

      insert into avaliacoes (gestor_id, ciclo_id, score, faixa, memoria, regra_id, versao_regra) values
        ('g-aps', 'c1', 70, '{"rotulo":"integral"}'::jsonb, '{"passos":[]}'::jsonb, 'regra-v1', 1),
        ('g-vis', 'c1', 90, '{"rotulo":"integral"}'::jsonb, '{"passos":[]}'::jsonb, 'regra-v1', 1);
    `)
  } finally {
    cliente.release()
  }
}

/**
 * Executa um comando que DEVE ser recusado e devolve a mensagem do banco.
 *
 * O savepoint é necessário porque, no PostgreSQL, o primeiro erro aborta a
 * transação inteira — sem ele, a segunda asserção de um mesmo teste falharia
 * por "current transaction is aborted" e esconderia o resultado real.
 */
async function recusa(cliente: PoolClient, sql: string): Promise<string> {
  await cliente.query('savepoint tentativa')
  let mensagem: string | null = null
  try {
    await cliente.query(sql)
  } catch (erro) {
    mensagem = (erro as Error).message
  }
  await cliente.query('rollback to savepoint tentativa')

  if (mensagem === null) {
    throw new Error(`Esperava recusa, mas o banco aceitou o comando:\n${sql}`)
  }
  return mensagem
}

/** Executa como um usuário autenticado, exatamente como o PostgREST faria. */
async function como<T>(
  usuarioId: string | null,
  acao: (cliente: PoolClient) => Promise<T>,
): Promise<T> {
  const cliente = await pool.connect()
  try {
    await cliente.query('begin')
    if (usuarioId) {
      await cliente.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub: usuarioId, role: 'authenticated' }),
      ])
      await cliente.query('set local role authenticated')
    } else {
      await cliente.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true)`)
      await cliente.query('set local role anon')
    }
    return await acao(cliente)
  } finally {
    await cliente.query('rollback').catch(() => {})
    cliente.release()
  }
}

beforeAll(async () => {
  if (!temBanco) return
  pool = new Pool({ connectionString: URL_TESTE, max: 4 })
  await aplicarMigracoes()
  await semear()
}, 120_000)

afterAll(async () => {
  await pool?.end()
})

describe.skipIf(!temBanco)('RLS — o que cada perfil enxerga', () => {
  it('CAM lê tudo', async () => {
    await como(USUARIOS.cam, async (c) => {
      expect((await c.query('select id from lancamentos')).rowCount).toBe(2)
      expect((await c.query('select id from avaliacoes')).rowCount).toBe(2)
      expect((await c.query('select id from contestacoes')).rowCount).toBe(0)
      expect((await c.query('select id from eventos_auditoria')).rowCount).toBeGreaterThan(0)
    })
  })

  it('auditoria lê tudo', async () => {
    await como(USUARIOS.auditoria, async (c) => {
      expect((await c.query('select id from lancamentos')).rowCount).toBe(2)
      expect((await c.query('select id from avaliacoes')).rowCount).toBe(2)
      expect((await c.query('select id from eventos_auditoria')).rowCount).toBeGreaterThan(0)
    })
  })

  it('área técnica só enxerga lançamentos da própria área', async () => {
    await como(USUARIOS.areaAps, async (c) => {
      const { rows } = await c.query('select indicador_id from lancamentos')
      expect(rows.map((r) => r.indicador_id)).toEqual(['ind-aps'])
    })
  })

  it('área técnica não enxerga avaliação nenhuma', async () => {
    await como(USUARIOS.areaAps, async (c) => {
      expect((await c.query('select id from avaliacoes')).rowCount).toBe(0)
    })
  })

  it('gestor enxerga apenas a própria avaliação', async () => {
    await como(USUARIOS.gestorAps, async (c) => {
      const { rows } = await c.query('select gestor_id, score from avaliacoes')
      expect(rows).toEqual([{ gestor_id: 'g-aps', score: '70' }])
    })

    await como(USUARIOS.gestorVis, async (c) => {
      const { rows } = await c.query('select gestor_id from avaliacoes')
      expect(rows.map((r) => r.gestor_id)).toEqual(['g-vis'])
    })
  })

  it('gestor não lê a trilha de auditoria', async () => {
    await como(USUARIOS.gestorAps, async (c) => {
      expect((await c.query('select id from eventos_auditoria')).rowCount).toBe(0)
    })
  })

  it('anônimo não lê nada do sistema', async () => {
    await como(null, async (c) => {
      await expect(c.query('select id from lancamentos')).rejects.toThrow()
      await expect(c.query('select id from avaliacoes')).rejects.toThrow()
    })
  })

  it('anônimo lê a configuração do site — é ela que decide o release público', async () => {
    await como(null, async (c) => {
      const { rows } = await c.query('select adiantamento_dias from configuracao_site')
      expect(rows[0].adiantamento_dias).toBe(7)
    })
  })
})

describe.skipIf(!temBanco)('RLS — o que cada perfil pode escrever', () => {
  it('área técnica lança na própria área', async () => {
    await como(USUARIOS.areaAps, async (c) => {
      await expect(
        c.query(
          `insert into lancamentos (indicador_id, ciclo_id, valor, evidencia, autor)
           values ('ind-aps', 'c1', 82, 'nova extração da aps', 'tecnica')`,
        ),
      ).resolves.toBeTruthy()
    })
  })

  it('área técnica NÃO lança em área alheia', async () => {
    await como(USUARIOS.areaAps, async (c) => {
      const erro = await recusa(
        c,
        `insert into lancamentos (indicador_id, ciclo_id, valor, evidencia, autor)
         values ('ind-vis', 'c1', 99, 'tentativa indevida', 'tecnica')`,
      )
      expect(erro).toMatch(/row-level security/i)
    })
  })

  it('auditoria não escreve nada', async () => {
    await como(USUARIOS.auditoria, async (c) => {
      expect(
        await recusa(
          c,
          `insert into lancamentos (indicador_id, ciclo_id, valor, evidencia, autor)
           values ('ind-aps', 'c1', 1, 'auditoria não lança', 'auditoria')`,
        ),
      ).toMatch(/row-level security/i)

      // Sem política de update para auditoria, o comando não alcança linha alguma.
      const resultado = await c.query(`update ciclos set estado = 'em_validacao' where id = 'c1'`)
      expect(resultado.rowCount).toBe(0)
    })
  })

  it('gestor abre contestação para si, mas não em nome de outro', async () => {
    await como(USUARIOS.gestorAps, async (c) => {
      await expect(
        c.query(
          `insert into contestacoes (gestor_id, ciclo_id, motivo)
           values ('g-aps', 'c1', 'A base extraída incluiu registros de outra central.')`,
        ),
      ).resolves.toBeTruthy()

      expect(
        await recusa(
          c,
          `insert into contestacoes (gestor_id, ciclo_id, motivo)
           values ('g-vis', 'c1', 'Contestação aberta em nome de terceiro, indevida.')`,
        ),
      ).toMatch(/row-level security/i)
    })
  })

  it('gestor não responde a própria contestação', async () => {
    await como(USUARIOS.cam, async (c) => {
      await c.query(
        `insert into contestacoes (id, gestor_id, ciclo_id, motivo)
         values ('bbbbbbbb-0000-4000-8000-000000000001', 'g-aps', 'c1', 'Motivo suficientemente longo para o check.')`,
      )
      // A resposta da comissão passa; a do gestor, não.
      await expect(
        c.query(
          `update contestacoes set status = 'acatada', resposta = 'Revisado.' where gestor_id = 'g-aps'`,
        ),
      ).resolves.toBeTruthy()
    })

    await como(USUARIOS.gestorAps, async (c) => {
      const resultado = await c.query(
        `update contestacoes set status = 'acatada' where gestor_id = 'g-aps'`,
      )
      // Sem política de update para o gestor, a linha simplesmente não é alcançada.
      expect(resultado.rowCount).toBe(0)
    })
  })

  it('CAM avança o ciclo; a área técnica não', async () => {
    await como(USUARIOS.areaAps, async (c) => {
      // A política de escrita de ciclos exige CAM: para a área técnica, a
      // linha simplesmente não existe para efeito de UPDATE.
      const bloqueado = await c.query(`update ciclos set estado = 'em_validacao' where id = 'c1'`)
      expect(bloqueado.rowCount).toBe(0)
    })

    await como(USUARIOS.cam, async (c) => {
      const resultado = await c.query(
        `update ciclos set estado = 'em_validacao' where id = 'c1'`,
      )
      expect(resultado.rowCount).toBe(1)
    })
  })
})

describe.skipIf(!temBanco)('invariantes que valem até para a service role', () => {
  it('a trilha de auditoria não pode ser alterada nem apagada', async () => {
    const cliente = await pool.connect()
    try {
      // Sem `set role`: esta é a conexão privilegiada, equivalente à service role.
      await expect(
        cliente.query(`update eventos_auditoria set descricao = 'reescrito' where id = 1`),
      ).rejects.toThrow(/append-only/i)

      await expect(
        cliente.query('delete from eventos_auditoria where id = 1'),
      ).rejects.toThrow(/append-only/i)
    } finally {
      cliente.release()
    }
  })

  it('o ciclo não pula estado nem volta atrás', async () => {
    await como(USUARIOS.cam, async (c) => {
      expect(
        await recusa(c, `update ciclos set estado = 'publicado' where id = 'c1'`),
      ).toMatch(/avança um estado por vez/i)

      await c.query(`update ciclos set estado = 'em_validacao' where id = 'c1'`)

      expect(
        await recusa(c, `update ciclos set estado = 'lancamento_aberto' where id = 'c1'`),
      ).toMatch(/avança um estado por vez/i)
    })
  })

  it('cada transição de estado deixa registro na trilha', async () => {
    await como(USUARIOS.cam, async (c) => {
      const antes = await c.query(
        `select count(*)::int as total from eventos_auditoria where tipo = 'ciclo_estado_alterado'`,
      )
      await c.query(`update ciclos set estado = 'em_validacao' where id = 'c1'`)
      const depois = await c.query(
        `select count(*)::int as total from eventos_auditoria where tipo = 'ciclo_estado_alterado'`,
      )
      expect(depois.rows[0].total).toBe(antes.rows[0].total + 1)

      const { rows } = await c.query(
        `select antes, depois from eventos_auditoria
         where tipo = 'ciclo_estado_alterado' order by id desc limit 1`,
      )
      expect(rows[0].antes).toEqual({ estado: 'lancamento_aberto' })
      expect(rows[0].depois).toEqual({ estado: 'em_validacao' })
    })
  })

  it('lançamento fora da janela é recusado', async () => {
    await como(USUARIOS.cam, async (c) => {
      await c.query(`update ciclos set estado = 'em_validacao' where id = 'c1'`)
      expect(
        await recusa(
          c,
          `insert into lancamentos (indicador_id, ciclo_id, valor, evidencia, autor)
           values ('ind-aps', 'c1', 50, 'fora do prazo, deve falhar', 'cam')`,
        ),
      ).toMatch(/janela de lançamento não está aberta/i)
    })
  })

  it('a regra vigente é imutável: muda-se de versão, não de conteúdo', async () => {
    const cliente = await pool.connect()
    try {
      await expect(
        cliente.query(
          `update regras_pontuacao set faixas = '[]'::jsonb where id = 'regra-v1'`,
        ),
      ).rejects.toThrow(/imutável/i)

      // Trocar a vigência (encerrar a regra antiga) continua permitido.
      await cliente.query(
        `update regras_pontuacao set vigente_ate = '2026-06' where id = 'regra-v1'`,
      )
    } finally {
      cliente.release()
    }
  })

  it('o log de liberações também é append-only', async () => {
    const cliente = await pool.connect()
    try {
      await cliente.query(
        `insert into log_releases (autor, campo, de, para) values ('painel', 'adiantamentoDias', '7', '14')`,
      )
      await expect(
        cliente.query(`update log_releases set para = '21'`),
      ).rejects.toThrow(/append-only/i)
    } finally {
      cliente.release()
    }
  })

  it('usuário de área técnica sem área é recusado pelo próprio banco', async () => {
    const cliente = await pool.connect()
    try {
      await expect(
        cliente.query(
          `insert into usuarios (id, nome, perfil) values ('66666666-6666-4666-8666-666666666666', 'Sem área', 'area_tecnica')`,
        ),
      ).rejects.toThrow(/usuario_area_tecnica_tem_area/i)
    } finally {
      cliente.release()
    }
  })
})
