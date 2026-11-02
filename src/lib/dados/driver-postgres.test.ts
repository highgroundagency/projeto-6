import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BASE } from '@/lib/seed'
import { estadoDo, novaSessao } from '@/lib/sistema/estado'
import { driverPostgres } from './driver-postgres'
import { bancoDoPool } from './postgres/conexao'
import { carregarBase } from './postgres/carga'
import { aplicarMigracoes } from './postgres/migrar'
import type { RepositorioDados } from './tipos'

/**
 * O driver PostgreSQL contra um banco de verdade.
 *
 * Três coisas são provadas aqui:
 *
 * 1. IDA E VOLTA. A base sintética entra pelo `carregarBase` e volta pelo
 *    driver idêntica, campo a campo. Coluna esquecida num mapeador quebra aqui.
 * 2. MESMO COMPORTAMENTO. As escritas dão as mesmas respostas que a camada em
 *    memória (`sistema/estado.ts`), e a nota calculada na homologação é a
 *    mesma que o motor dá sobre a cópia em memória.
 * 3. AS TRAVAS. Mesmo escrevendo SQL direto, sem passar pelo driver, o banco
 *    recusa o que as quatro travas proíbem.
 *
 * Roda quando `DATABASE_URL_TESTE` aponta para um Postgres DESCARTÁVEL: o
 * schema `public` é apagado e recriado. Sem a variável, a suíte é pulada.
 */

const URL_TESTE = process.env.DATABASE_URL_TESTE
const temBanco = Boolean(URL_TESTE)

let pool: Pool
let driver: RepositorioDados

const JULHO = 'ciclo-2026-07'
const MAIO = 'ciclo-2026-05'
const AGORA = '2026-07-15T13:00:00.000Z'

beforeAll(async () => {
  if (!temBanco) return
  pool = new Pool({ connectionString: URL_TESTE, max: 4 })
  const cliente = await pool.connect()
  try {
    await cliente.query('drop schema if exists public cascade')
    await cliente.query('drop schema if exists app cascade')
    await cliente.query('drop schema if exists auth cascade')
    await cliente.query('create schema public')
    await aplicarMigracoes(cliente)
    await cliente.query('begin')
    await carregarBase(cliente, BASE)
    await cliente.query('commit')
  } finally {
    cliente.release()
  }
  driver = driverPostgres(bancoDoPool(pool))
}, 120_000)

afterAll(async () => {
  await pool?.end()
})

describe.skipIf(!temBanco)('driver PostgreSQL: ida e volta da base', () => {
  it('o panorama volta igual ao que entrou', async () => {
    const panorama = await driver.panorama()
    expect(panorama.distritos).toEqual(BASE.distritos)
    expect(panorama.tiposUnidade).toEqual(BASE.tiposUnidade)
    expect(panorama.unidades).toEqual(BASE.unidades)
    expect(panorama.gerentes).toEqual(BASE.gerentes)
    expect(panorama.indicadores).toEqual(BASE.indicadores)
    expect(panorama.subindicadores).toEqual(BASE.subindicadores)
    expect(panorama.regras).toEqual(BASE.regras)
    expect(panorama.ciclos).toEqual(BASE.ciclos)
  })

  it('o movimento volta igual, na mesma ordem', async () => {
    expect(await driver.lancamentos()).toEqual(BASE.lancamentos)
    expect(await driver.avaliacoes()).toEqual(BASE.avaliacoes)
    expect(await driver.avaliacoesDistritais()).toEqual(BASE.avaliacoesDistritais)
    expect(await driver.eventos(10_000)).toEqual(BASE.eventos)
    expect(await driver.contestacoes()).toEqual(estadoDo(null).contestacoes())
  })

  it('os filtros dão o mesmo que a camada em memória', async () => {
    const memoria = estadoDo(null)
    expect(await driver.lancamentos(MAIO)).toEqual(
      memoria.lancamentos().filter((l) => l.cicloId === MAIO),
    )
    expect(await driver.avaliacoes({ unidadeId: 'usf-canario' })).toEqual(
      memoria.avaliacoes().filter((a) => a.unidadeId === 'usf-canario'),
    )
    expect(await driver.avaliacoesDistritais({ cicloId: MAIO })).toEqual(
      memoria.avaliacoesDistritais().filter((a) => a.cicloId === MAIO),
    )
    expect(await driver.eventos(5)).toEqual(BASE.eventos.slice(0, 5))
  })
})

describe.skipIf(!temBanco)('driver PostgreSQL: escrita', () => {
  const lancamento = {
    subindicadorId: 'acompanhamento-familias',
    unidadeId: 'usf-canario',
    cicloId: JULHO,
    valor: null,
    numerador: 170,
    denominador: 200,
    evidencia: 'relatório mensal do teste',
    autor: 'ger-usf-canario',
    perfil: 'gerente_unidade',
  }

  it('o lançamento entra, persiste e a trilha é escrita pelo banco', async () => {
    const antes = (await driver.lancamentos(JULHO)).length
    const resultado = await driver.registrarLancamento(lancamento, AGORA)
    expect(resultado).toEqual({ ok: true, mensagem: 'Lançamento registrado.' })

    const depois = await driver.lancamentos(JULHO)
    expect(depois).toHaveLength(antes + 1)
    const novo = depois.at(-1)!
    expect(novo).toMatchObject({ numerador: 170, denominador: 200, registradoEm: AGORA })

    const [evento] = await driver.eventos(1)
    expect(evento).toMatchObject({
      tipo: 'lancamento_registrado',
      entidade: novo.id,
      autor: 'ger-usf-canario',
      perfil: 'gerente_unidade',
      quando: AGORA,
      antes: null,
    })
  })

  it('a correção é linha nova, e o valor anterior fica no "antes" do evento', async () => {
    const resultado = await driver.registrarLancamento({ ...lancamento, numerador: 180 }, AGORA)
    expect(resultado.mensagem).toMatch(/corrigido/)
    const [evento] = await driver.eventos(1)
    expect(evento.tipo).toBe('lancamento_alterado')
    expect(evento.antes).toMatchObject({ numerador: 170 })
    expect(evento.depois).toMatchObject({ numerador: 180 })
  })

  it('fora do prazo, nada entra, mas a tentativa fica no histórico', async () => {
    const antes = (await driver.lancamentos(MAIO)).length
    const resultado = await driver.registrarLancamento({ ...lancamento, cicloId: MAIO }, AGORA)
    expect(resultado.ok).toBe(false)
    expect(resultado.mensagem).toMatch(/A tentativa ficou registrada/)
    expect(await driver.lancamentos(MAIO)).toHaveLength(antes)
    const [evento] = await driver.eventos(1)
    expect(evento.tipo).toBe('lancamento_recusado')
  })

  it('indicador que não vale para o tipo da unidade é recusado', async () => {
    const resultado = await driver.registrarLancamento(
      { ...lancamento, unidadeId: 'caps-colibri' },
      AGORA,
    )
    expect(resultado).toEqual({
      ok: false,
      mensagem: 'Este indicador não vale para o tipo desta unidade na regra deste ciclo.',
    })
  })

  it('homologar calcula as notas, iguais às da camada em memória', async () => {
    // A mesma história, refeita na camada em memória, para comparar a conta.
    const sessao = novaSessao()
    const memoria = estadoDo(sessao)
    memoria.registrarLancamento({ ...lancamento, registradoEm: AGORA, status: 'enviado' }, AGORA)
    memoria.registrarLancamento(
      { ...lancamento, numerador: 180, registradoEm: AGORA, status: 'enviado' },
      AGORA,
    )
    memoria.avancarCiclo(JULHO, 'seab', AGORA)
    memoria.avancarCiclo(JULHO, 'seab', AGORA)

    expect(await driver.avancarCiclo(JULHO, 'seab', AGORA)).toEqual({
      ok: true,
      mensagem: 'Ciclo avançado para Em validação.',
    })
    expect(await driver.avancarCiclo(JULHO, 'seab', AGORA)).toEqual({
      ok: true,
      mensagem: 'Ciclo avançado para Homologado.',
    })

    const notas = await driver.avaliacoes({ cicloId: JULHO })
    expect(notas).toHaveLength(BASE.unidades.length)
    expect(notas).toEqual(memoria.avaliacoes().filter((a) => a.cicloId === JULHO))
    expect(await driver.avaliacoesDistritais({ cicloId: JULHO })).toEqual(
      memoria.avaliacoesDistritais().filter((a) => a.cicloId === JULHO),
    )

    const [calculo, transicao] = await driver.eventos(2)
    expect(calculo.tipo).toBe('avaliacao_calculada')
    expect(transicao).toMatchObject({
      tipo: 'ciclo_estado_alterado',
      descricao: 'Ciclo 2026-07: Em validação → Homologado.',
      perfil: 'seab',
    })
  })

  it('o ciclo publicado não avança mais', async () => {
    const resultado = await driver.avancarCiclo('ciclo-2026-01', 'seab', AGORA)
    expect(resultado).toEqual({ ok: false, mensagem: 'O ciclo já está em Publicado.' })
  })

  it('a contestação entra e vai para a trilha', async () => {
    const resultado = await driver.abrirContestacao(
      {
        gerenteId: 'ger-usf-canario',
        cicloId: JULHO,
        indicadorId: null,
        motivo: 'A nota de julho não bate com o relatório da unidade.',
        perfil: 'gerente_unidade',
      },
      AGORA,
    )
    expect(resultado.ok).toBe(true)
    const [primeira] = await driver.contestacoes('ger-usf-canario')
    expect(primeira).toMatchObject({ cicloId: JULHO, status: 'aberta', abertaEm: AGORA })
    const [evento] = await driver.eventos(1)
    expect(evento).toMatchObject({ tipo: 'contestacao_aberta', entidade: primeira.id })
  })

  it('outra instância do driver enxerga o que foi escrito', async () => {
    const outro = driverPostgres(bancoDoPool(pool))
    const ciclo = (await outro.panorama()).ciclos.find((c) => c.id === JULHO)
    expect(ciclo?.estado).toBe('homologado')
  })
})

describe.skipIf(!temBanco)('as quatro travas, em SQL direto', () => {
  async function recusa(sql: string): Promise<string> {
    try {
      await pool.query(sql)
    } catch (erro) {
      return erro instanceof Error ? erro.message : String(erro)
    }
    throw new Error(`O banco aceitou o que devia recusar: ${sql}`)
  }

  it('1. a trilha não se edita, não se apaga, não se trunca', async () => {
    expect(await recusa(`update eventos_auditoria set descricao = 'x'`)).toMatch(/append-only/)
    expect(await recusa('delete from eventos_auditoria')).toMatch(/append-only/)
    expect(await recusa('truncate eventos_auditoria cascade')).toMatch(/append-only/)
  })

  it('2. o ciclo não volta e não pula etapa', async () => {
    expect(await recusa(`update ciclos set estado = 'rascunho' where id = '${MAIO}'`)).toMatch(
      /Transição de ciclo inválida/,
    )
    expect(
      await recusa(`update ciclos set estado = 'em_validacao' where id = '${MAIO}'`),
    ).toMatch(/Transição de ciclo inválida/)
    expect(
      await recusa(`update ciclos set regra_id = 'regra-v1' where id = '${JULHO}'`),
    ).toMatch(/só o estado muda/)
  })

  it('3. lançamento fora da janela é recusado pelo próprio banco', async () => {
    expect(
      await recusa(`
        insert into lancamentos (subindicador_id, unidade_id, ciclo_id, valor, evidencia, autor, registrado_em)
        values ('acompanhamento-familias', 'usf-canario', '${MAIO}', 1, 'por fora do app', 'psql', '2026-07-15T13:00:00.000Z')`),
    ).toMatch(/janela de lançamento não está aberta/)
    expect(await recusa(`delete from lancamentos where ciclo_id = '${MAIO}'`)).toMatch(
      /nada se apaga/,
    )
  })

  it('4. a regra publicada e a aplicabilidade dela não se editam', async () => {
    expect(
      await recusa(`update regras_pontuacao set pontuacao_maxima = 999 where id = 'regra-v1'`),
    ).toMatch(/imutável/)
    expect(await recusa(`update aplicabilidades set peso = 99 where regra_id = 'regra-v1'`)).toMatch(
      /imutável/,
    )
    expect(await recusa(`delete from regras_pontuacao where id = 'regra-v1'`)).toMatch(
      /nada se apaga/,
    )
  })
})
