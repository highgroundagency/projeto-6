import type { PoolClient, QueryResult } from 'pg'
import { calcularAvaliacao, calcularAvaliacaoDistrital } from '@/lib/calculo/motor'
import { ORDEM_ESTADOS, ROTULO_ESTADO, type EstadoCiclo } from '@/lib/calculo/tipos'
import {
  deAplicabilidade,
  deAvaliacao,
  deAvaliacaoDistrital,
  deCiclo,
  deContestacao,
  deDistrito,
  deEvento,
  deGerente,
  deIndicador,
  deLancamento,
  deRegra,
  deSubindicador,
  deTipoUnidade,
  deUnidade,
  linhaAvaliacao,
  linhaAvaliacaoDistrital,
} from './postgres/linhas'
import { bancoDe, type Banco, type FonteDoBanco } from './postgres/conexao'
import type {
  EntradaContestacao,
  EntradaLancamento,
  FiltroAvaliacao,
  FiltroAvaliacaoDistrital,
  Panorama,
  RepositorioDados,
  Resultado,
} from './tipos'

/**
 * Driver PostgreSQL: a fonte de dados persistente do sistema.
 *
 * Implementa o mesmo `RepositorioDados` do seed, então nenhuma tela mudou.
 * A diferença é de natureza: aqui a escrita é de verdade e é UMA SÓ para todo
 * mundo. Um lançamento feito num navegador aparece em qualquer outro, e o
 * avanço de etapa da SEAB vale para todos, como no processo real.
 *
 * Divisão de trabalho com o banco (`db/migrations/`):
 *
 * - O DRIVER confere o que é regra de negócio e precisa de mensagem amigável
 *   (janela fechada, indicador que não vale para o tipo da unidade) e faz a
 *   conta das notas com o motor puro, na homologação.
 * - O BANCO segura as quatro travas e escreve a trilha de auditoria sozinho,
 *   por gatilho. O driver só conta a ele quem está escrevendo e que horas são
 *   (`app.autor`, `app.perfil`, `app.agora`), dentro da mesma transação.
 *
 * Cada escrita é uma transação. Se qualquer passo falha (inclusive uma trava
 * do banco), nada entra, e a mensagem do banco volta para a tela.
 */

/**
 * Um banco por fonte, por processo. Em dev, o hot reload recarrega este módulo
 * várias vezes; sem guardar no `globalThis`, cada recarga abriria um pool novo
 * e o Postgres esgotaria as conexões.
 */
const globalComBancos = globalThis as typeof globalThis & { __prumoBancos?: Map<string, Banco> }

export function bancoCompartilhado(fonte: FonteDoBanco): Banco {
  globalComBancos.__prumoBancos ??= new Map()
  let banco = globalComBancos.__prumoBancos.get(fonte.descricao)
  if (!banco) {
    banco = bancoDe(fonte)
    globalComBancos.__prumoBancos.set(fonte.descricao, banco)
  }
  return banco
}

const ESTADOS_COM_NOTA: readonly EstadoCiclo[] = ['homologado', 'publicado']

const CONSULTAS_DO_PANORAMA = [
  'select * from distritos order by ordem',
  'select * from tipos_unidade order by ordem',
  'select * from unidades order by ordem',
  'select * from gerentes order by ordem',
  'select * from indicadores order by ordem',
  'select * from subindicadores order by ordem',
  'select * from regras_pontuacao order by ordem',
  'select * from aplicabilidades order by ordem',
  'select * from ciclos order by competencia',
] as const

/** Quem consulta: o banco (pool, consultas em paralelo) ou um cliente numa transação. */
type Consultor = Banco | PoolClient

function ehCliente(db: Consultor): db is PoolClient {
  return typeof (db as PoolClient).release === 'function'
}

async function lerPanorama(db: Consultor): Promise<Panorama> {
  // No pool, as nove consultas vão em paralelo. Dentro de uma transação (um
  // cliente só), uma de cada vez: a conexão não atende duas ao mesmo tempo.
  let resultados: QueryResult[]
  if (!ehCliente(db)) {
    resultados = await Promise.all(CONSULTAS_DO_PANORAMA.map((sql) => consultar(db, sql)))
  } else {
    resultados = []
    for (const sql of CONSULTAS_DO_PANORAMA) resultados.push(await consultar(db, sql))
  }
  const [distritos, tipos, unidades, gerentes, indicadores, subs, regras, aplics, ciclos] =
    resultados

  return {
    distritos: distritos.rows.map(deDistrito),
    tiposUnidade: tipos.rows.map(deTipoUnidade),
    unidades: unidades.rows.map(deUnidade),
    gerentes: gerentes.rows.map(deGerente),
    indicadores: indicadores.rows.map(deIndicador),
    subindicadores: subs.rows.map(deSubindicador),
    regras: regras.rows.map((linha) =>
      deRegra(
        linha,
        aplics.rows.filter((a) => a.regra_id === linha.id).map(deAplicabilidade),
      ),
    ),
    ciclos: ciclos.rows.map(deCiclo),
  }
}

/** Uma consulta em qualquer dos dois: o TypeScript não junta as assinaturas sozinho. */
function consultar(db: Consultor, sql: string, valores?: unknown[]): Promise<QueryResult> {
  return ehCliente(db) ? db.query(sql, valores) : db.query(sql, valores)
}

async function lerLancamentos(db: Consultor, cicloId?: string) {
  const { rows } = cicloId
    ? await consultar(db, 'select * from lancamentos where ciclo_id = $1 order by ordem', [cicloId])
    : await consultar(db, 'select * from lancamentos order by ordem')
  return rows.map(deLancamento)
}

/** Mensagem legível de um erro do banco (as travas falam português). */
function mensagemDoErro(erro: unknown): string {
  const texto = erro instanceof Error ? erro.message : String(erro)
  return `O banco recusou a operação: ${texto}`
}

/**
 * O driver recebe o banco pronto: de onde vêm as credenciais (URL local ou
 * AWS Secrets Manager) é assunto de `postgres/conexao.ts`, não daqui.
 */
export function driverPostgres(banco: Banco): RepositorioDados {

  /**
   * Abre uma transação, diz ao banco quem escreve e quando, e roda `fazer`.
   * `Resultado` com ok=false ainda faz COMMIT: a tentativa recusada também é
   * história (é o que grava `lancamento_recusado`). Exceção faz ROLLBACK.
   */
  async function escrever(
    contexto: { autor: string; perfil: string; agora: string },
    fazer: (cliente: PoolClient) => Promise<Resultado>,
  ): Promise<Resultado> {
    const cliente = await banco.connect()
    try {
      await cliente.query('begin')
      await cliente.query(
        `select set_config('app.autor', $1, true),
                set_config('app.perfil', $2, true),
                set_config('app.agora', $3, true)`,
        [contexto.autor, contexto.perfil, contexto.agora],
      )
      const resultado = await fazer(cliente)
      await cliente.query('commit')
      return resultado
    } catch (erro) {
      await cliente.query('rollback').catch(() => {})
      return { ok: false, mensagem: mensagemDoErro(erro) }
    } finally {
      cliente.release()
    }
  }

  /**
   * Homologar é fazer a conta: ao chegar em 'homologado', o ciclo ganha as
   * notas de todas as unidades e as distritais, sobre os lançamentos daquele
   * momento. Mesma lógica de `sistema/estado.ts`, mas gravada.
   */
  async function calcularNotasDoCiclo(cliente: PoolClient, cicloId: string): Promise<void> {
    const { rows } = await cliente.query(
      'select 1 from avaliacoes where ciclo_id = $1 limit 1',
      [cicloId],
    )
    if (rows.length > 0) return

    const panorama = await lerPanorama(cliente)
    const ciclo = panorama.ciclos.find((c) => c.id === cicloId)
    const regra = panorama.regras.find((r) => r.id === ciclo?.regraId)
    if (!ciclo || !regra) return

    const lancamentos = await lerLancamentos(cliente, cicloId)
    const doCiclo = panorama.unidades.map((unidade) =>
      calcularAvaliacao({
        unidade,
        cicloId,
        indicadores: panorama.indicadores,
        subindicadores: panorama.subindicadores,
        lancamentos,
        regra,
      }),
    )

    const distritais = panorama.distritos.map((distrito) => {
      const ids = new Set(
        panorama.unidades.filter((u) => u.distritoId === distrito.id).map((u) => u.id),
      )
      return calcularAvaliacaoDistrital({
        distritoId: distrito.id,
        cicloId,
        avaliacoesDasUnidades: doCiclo.filter((a) => ids.has(a.unidadeId)),
        regra,
      })
    })

    for (const avaliacao of doCiclo) {
      const l = linhaAvaliacao(avaliacao)
      await cliente.query(
        `insert into avaliacoes (unidade_id, ciclo_id, score, faixa, memoria, avisos, regra_id, versao_regra)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          l.unidade_id,
          l.ciclo_id,
          l.score,
          JSON.stringify(l.faixa),
          JSON.stringify(l.memoria),
          JSON.stringify(l.avisos),
          l.regra_id,
          l.versao_regra,
        ],
      )
    }
    for (const distrital of distritais) {
      const l = linhaAvaliacaoDistrital(distrital)
      await cliente.query(
        `insert into avaliacoes_distritais (distrito_id, ciclo_id, score, faixa, por_unidade, avisos)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          l.distrito_id,
          l.ciclo_id,
          l.score,
          JSON.stringify(l.faixa),
          JSON.stringify(l.por_unidade),
          JSON.stringify(l.avisos),
        ],
      )
    }

    await cliente.query(`select app.registrar_evento('avaliacao_calculada', $1, $2, null, $3)`, [
      cicloId,
      `Avaliações do ciclo ${ciclo.competencia} calculadas: ${doCiclo.length} unidades e ${panorama.distritos.length} distritos.`,
      JSON.stringify({ unidades: doCiclo.length, distritos: panorama.distritos.length }),
    ])
  }

  return {
    nome: 'PostgreSQL',
    persistente: true,

    panorama: () => lerPanorama(banco),

    lancamentos: (cicloId?: string) => lerLancamentos(banco, cicloId),

    async avaliacoes(filtro: FiltroAvaliacao = {}) {
      const { rows } = await banco.query(
        `select * from avaliacoes
         where ($1::text is null or unidade_id = $1)
           and ($2::text is null or ciclo_id = $2)
         order by ordem`,
        [filtro.unidadeId ?? null, filtro.cicloId ?? null],
      )
      return rows.map(deAvaliacao)
    },

    async avaliacoesDistritais(filtro: FiltroAvaliacaoDistrital = {}) {
      const { rows } = await banco.query(
        `select * from avaliacoes_distritais
         where ($1::text is null or distrito_id = $1)
           and ($2::text is null or ciclo_id = $2)
         order by ordem`,
        [filtro.distritoId ?? null, filtro.cicloId ?? null],
      )
      return rows.map(deAvaliacaoDistrital)
    },

    async contestacoes(gerenteId?: string) {
      const { rows } = await banco.query(
        `select * from contestacoes
         where ($1::text is null or gerente_id = $1)
         order by aberta_em desc, ordem desc`,
        [gerenteId ?? null],
      )
      return rows.map(deContestacao)
    },

    async eventos(limite = 200) {
      const { rows } = await banco.query(
        'select * from eventos_auditoria order by seq desc limit $1',
        [limite],
      )
      return rows.map(deEvento)
    },

    registrarLancamento(entrada: EntradaLancamento, agora: string) {
      return escrever({ autor: entrada.autor, perfil: entrada.perfil, agora }, async (cliente) => {
        // `for share` segura o estado do ciclo até o fim da transação: um
        // avanço de etapa concorrente espera este lançamento terminar.
        const { rows: ciclos } = await cliente.query(
          'select id, estado, regra_id from ciclos where id = $1 for share',
          [entrada.cicloId],
        )
        const ciclo = ciclos[0]
        if (!ciclo) return { ok: false, mensagem: 'Ciclo não encontrado.' }

        // Fora do prazo, a escrita não entra, mas a TENTATIVA entra no
        // histórico. Recusa sem rastro é o que a planilha faz hoje.
        if (ciclo.estado !== 'lancamento_aberto') {
          const situacao = ROTULO_ESTADO[ciclo.estado as EstadoCiclo].toLowerCase()
          await cliente.query(
            `select app.registrar_evento('lancamento_recusado', $1, $2, null, $3)`,
            [
              ciclo.id,
              `Tentativa de lançamento de ${entrada.subindicadorId} pela ${entrada.unidadeId} no ciclo ${ciclo.id}, recusada: o mês está ${situacao}.`,
              JSON.stringify({
                estadoDoCiclo: ciclo.estado,
                valor: entrada.valor,
                numerador: entrada.numerador,
                denominador: entrada.denominador,
              }),
            ],
          )
          return {
            ok: false,
            mensagem: `A janela de lançamento deste ciclo está ${situacao}. A tentativa ficou registrada no histórico.`,
          }
        }

        // O que não vale para o tipo da unidade não entra: a régua da regra
        // do ciclo decide, também no caminho de escrita.
        const { rows: aplicavel } = await cliente.query(
          `select 1
           from subindicadores s
           join unidades u on u.id = $2
           join aplicabilidades a
             on a.regra_id = $3 and a.tipo_unidade_id = u.tipo_id and a.indicador_id = s.indicador_id
           where s.id = $1`,
          [entrada.subindicadorId, entrada.unidadeId, ciclo.regra_id],
        )
        if (aplicavel.length === 0) {
          return {
            ok: false,
            mensagem: 'Este indicador não vale para o tipo desta unidade na regra deste ciclo.',
          }
        }

        const { rows: anterior } = await cliente.query(
          `select 1 from lancamentos
           where ciclo_id = $1 and subindicador_id = $2 and unidade_id = $3 limit 1`,
          [entrada.cicloId, entrada.subindicadorId, entrada.unidadeId],
        )

        // O gatilho `lancamento_auditado` grava o evento, com o antes e o depois.
        await cliente.query(
          `insert into lancamentos
             (subindicador_id, unidade_id, ciclo_id, valor, numerador, denominador,
              evidencia, autor, registrado_em, status)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'enviado')`,
          [
            entrada.subindicadorId,
            entrada.unidadeId,
            entrada.cicloId,
            entrada.valor,
            entrada.numerador,
            entrada.denominador,
            entrada.evidencia,
            entrada.autor,
            agora,
          ],
        )

        return {
          ok: true,
          mensagem:
            anterior.length > 0
              ? 'Lançamento corrigido. O valor anterior continua na trilha de auditoria.'
              : 'Lançamento registrado.',
        }
      })
    },

    avancarCiclo(cicloId: string, autor: string, agora: string) {
      return escrever({ autor, perfil: 'seab', agora }, async (cliente) => {
        // `for update`: dois cliques simultâneos não avançam duas etapas.
        const { rows } = await cliente.query(
          'select id, estado from ciclos where id = $1 for update',
          [cicloId],
        )
        const ciclo = rows[0]
        if (!ciclo) return { ok: false, mensagem: 'Ciclo não encontrado.' }

        const atual = ciclo.estado as EstadoCiclo
        const posicao = ORDEM_ESTADOS.indexOf(atual)
        const seguinte =
          posicao >= 0 && posicao < ORDEM_ESTADOS.length - 1 ? ORDEM_ESTADOS[posicao + 1] : null
        if (!seguinte) {
          return { ok: false, mensagem: `O ciclo já está em ${ROTULO_ESTADO[atual]}.` }
        }

        // O gatilho `ciclo_transicao_valida` confere a ordem; o
        // `ciclo_transicao_auditada` grava o evento.
        await cliente.query('update ciclos set estado = $1 where id = $2', [seguinte, cicloId])

        if (ESTADOS_COM_NOTA.includes(seguinte)) await calcularNotasDoCiclo(cliente, cicloId)

        return { ok: true, mensagem: `Ciclo avançado para ${ROTULO_ESTADO[seguinte]}.` }
      })
    },

    abrirContestacao(entrada: EntradaContestacao, agora: string) {
      return escrever(
        { autor: entrada.gerenteId, perfil: entrada.perfil, agora },
        async (cliente) => {
          // O gatilho `contestacao_auditada` grava o evento.
          await cliente.query(
            `insert into contestacoes (gerente_id, ciclo_id, indicador_id, motivo, aberta_em)
             values ($1, $2, $3, $4, $5)`,
            [entrada.gerenteId, entrada.cicloId, entrada.indicadorId, entrada.motivo, agora],
          )
          return {
            ok: true,
            mensagem:
              'Contestação registrada. Ela está na lista abaixo e no histórico. Neste protótipo, ninguém responde ainda.',
          }
        },
      )
    },
  }
}
