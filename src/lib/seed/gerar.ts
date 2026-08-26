import { calcularAvaliacao, calcularAvaliacaoDistrital, regraVigente } from '@/lib/calculo/motor'
import type {
  Avaliacao,
  AvaliacaoDistrital,
  CicloAvaliacao,
  Contestacao,
  Distrito,
  EstadoCiclo,
  EventoAuditoria,
  Gerente,
  Indicador,
  Lancamento,
  RegraDePontuacao,
  Subindicador,
  TipoUnidade,
  Unidade,
} from '@/lib/calculo/tipos'
import {
  APLICABILIDADES_V1,
  APLICABILIDADES_V2,
  COMPORTAMENTOS,
  DISTRITOS,
  INDICADORES,
  NOMES_GERENTES,
  NOMES_GERENTES_DISTRITAIS,
  SUBINDICADORES,
  TIPOS_UNIDADE,
  UNIDADES,
} from './catalogo'
import { prng } from './prng'

/**
 * Gerador de base sintética (§10.1), no domínio remodelado da reunião de
 * 22/08 (ADR-034): lançamentos POR SUBINDICADOR, por unidade; a aplicabilidade
 * decide o que cada tipo preenche; e a avaliação existe por unidade e por
 * distrito.
 *
 * Semente fixa: o mesmo seed produz sempre os mesmos números, o que torna a
 * demonstração reproduzível e os testes confiáveis.
 *
 * Nenhum dado real de pessoa ou da SESAU. Ver §2.4 e docs/privacidade.md.
 */

export const SEMENTE_PADRAO = 20262

export interface BaseSintetica {
  readonly distritos: readonly Distrito[]
  readonly tiposUnidade: readonly TipoUnidade[]
  readonly unidades: readonly Unidade[]
  readonly gerentes: readonly Gerente[]
  readonly indicadores: readonly Indicador[]
  readonly subindicadores: readonly Subindicador[]
  readonly ciclos: readonly CicloAvaliacao[]
  readonly regras: readonly RegraDePontuacao[]
  readonly lancamentos: readonly Lancamento[]
  readonly avaliacoes: readonly Avaliacao[]
  readonly avaliacoesDistritais: readonly AvaliacaoDistrital[]
  readonly eventos: readonly EventoAuditoria[]
  readonly contestacoes: readonly Contestacao[]
}

const COMPETENCIAS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'] as const

const ESTADOS: Record<string, EstadoCiclo> = {
  '2026-01': 'publicado',
  '2026-02': 'publicado',
  '2026-03': 'publicado',
  '2026-04': 'publicado',
  '2026-05': 'homologado',
  '2026-06': 'lancamento_aberto',
}

const REGRAS: readonly RegraDePontuacao[] = [
  {
    id: 'regra-v1',
    versao: 1,
    descricao: 'Faixas iniciais do ciclo 2026: cinco patamares de atingimento.',
    vigenteDe: '2026-01',
    vigenteAte: '2026-03',
    faixas: [
      { de: 0, ate: 0.7, pontos: 0 },
      { de: 0.7, ate: 0.85, pontos: 4 },
      { de: 0.85, ate: 0.95, pontos: 7 },
      { de: 0.95, ate: 1, pontos: 9 },
      { de: 1, ate: null, pontos: 10 },
    ],
    pontuacaoMaxima: 10,
    faixasGratificacao: [
      { de: 0, ate: 50, rotulo: 'sem gratificação', percentual: 0 },
      { de: 50, ate: 70, rotulo: 'parcial', percentual: 50 },
      { de: 70, ate: 90, rotulo: 'integral', percentual: 80 },
      { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
    ],
    aplicabilidades: APLICABILIDADES_V1,
    arredondamento: { casas: 2, modo: 'meio_para_cima' },
    tetoAtingimento: 1.5,
    semLancamento: 'zera_com_aviso',
  },
  {
    id: 'regra-v2',
    versao: 2,
    descricao:
      'Revisão a partir de abril: patamar de entrada sobe de 70% para 75%, a faixa intermediária é desdobrada e a régua de dois tipos muda.',
    vigenteDe: '2026-04',
    vigenteAte: null,
    faixas: [
      { de: 0, ate: 0.75, pontos: 0 },
      { de: 0.75, ate: 0.85, pontos: 3 },
      { de: 0.85, ate: 0.92, pontos: 6 },
      { de: 0.92, ate: 0.98, pontos: 8 },
      { de: 0.98, ate: null, pontos: 10 },
    ],
    pontuacaoMaxima: 10,
    faixasGratificacao: [
      { de: 0, ate: 50, rotulo: 'sem gratificação', percentual: 0 },
      { de: 50, ate: 70, rotulo: 'parcial', percentual: 50 },
      { de: 70, ate: 90, rotulo: 'integral', percentual: 80 },
      { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
    ],
    aplicabilidades: APLICABILIDADES_V2,
    arredondamento: { casas: 2, modo: 'meio_para_cima' },
    tetoAtingimento: 1.5,
    semLancamento: 'zera_com_aviso',
  },
]

/** Carimbo determinístico dentro da competência, sem relógio. */
function carimbo(competencia: string, diaDoMes: number, hora = 12): string {
  return `${competencia}-${String(diaDoMes).padStart(2, '0')}T${String(hora).padStart(2, '0')}:00:00.000Z`
}

export function gerarBase(semente: number = SEMENTE_PADRAO): BaseSintetica {
  const aleatorio = prng(semente)

  const gerentes: Gerente[] = [
    ...UNIDADES.map((unidade, i) => ({
      id: `ger-${unidade.id}`,
      nome: NOMES_GERENTES[i % NOMES_GERENTES.length],
      cargo: 'Gerência da unidade',
      escopo: 'unidade' as const,
      unidadeId: unidade.id,
      distritoId: null,
    })),
    ...DISTRITOS.map((distrito, i) => ({
      id: `ger-${distrito.id}`,
      nome: NOMES_GERENTES_DISTRITAIS[i % NOMES_GERENTES_DISTRITAIS.length],
      cargo: 'Gerência distrital',
      escopo: 'distrito' as const,
      unidadeId: null,
      distritoId: distrito.id,
    })),
  ]

  const ciclos: CicloAvaliacao[] = COMPETENCIAS.map((competencia) => ({
    id: `ciclo-${competencia}`,
    competencia,
    estado: ESTADOS[competencia],
    janelaLancamentoInicio: carimbo(competencia, 1, 0),
    janelaLancamentoFim: carimbo(competencia, 20, 23),
    // Os 5 dias finais da janela: é quando a unidade revisa o que lançou.
    revisaoInicio: `${competencia}-16`,
    regraId: regraVigente(competencia, REGRAS)?.id ?? REGRAS[0].id,
  }))

  const comportamentoDe = new Map(COMPORTAMENTOS.map((c) => [c.indicadorId, c]))
  const indicadorDe = new Map(INDICADORES.map((i) => [i.id, i]))

  // Cada unidade tem um viés estável: umas entregam melhor que outras, mês a mês.
  const vieses = new Map<string, number>(
    UNIDADES.map((unidade) => [unidade.id, (aleatorio() - 0.5) * 0.12]),
  )

  const lancamentos: Lancamento[] = []

  for (const [indiceCiclo, ciclo] of ciclos.entries()) {
    // No ciclo aberto, parte das unidades ainda não lançou — é o estado real de
    // uma janela em andamento, e é o que faz o funil da SEAB ter o que mostrar.
    const aberto = ciclo.estado === 'lancamento_aberto'
    const regra = REGRAS.find((r) => r.id === ciclo.regraId) ?? REGRAS[0]

    for (const unidade of UNIDADES) {
      const aplicaveis = regra.aplicabilidades.filter(
        (a) => a.tipoUnidadeId === unidade.tipoId,
      )

      for (const aplicabilidade of aplicaveis) {
        if (aberto && aleatorio() < 0.38) continue

        const indicador = indicadorDe.get(aplicabilidade.indicadorId)
        if (!indicador) continue
        const comportamento = comportamentoDe.get(indicador.id)

        const vies = vieses.get(unidade.id) ?? 0
        const tendencia = indiceCiclo * 0.008
        const sazonalidade = Math.sin((indiceCiclo / COMPETENCIAS.length) * Math.PI * 2) * 0.03
        const ruido = (aleatorio() - 0.5) * (comportamento?.volatilidade ?? 0.08) * 2

        const atingimento = Math.max(
          0.35,
          (comportamento?.desempenhoBase ?? 0.9) + vies + tendencia + sazonalidade + ruido,
        )

        // O valor-alvo do indicador; cada subindicador orbita em volta dele.
        const valorAlvo =
          indicador.direcao === 'maior_melhor'
            ? aplicabilidade.meta * atingimento
            : aplicabilidade.meta / atingimento

        const subs = SUBINDICADORES.filter((s) => s.indicadorId === indicador.id)
        for (const sub of subs) {
          const variacao = 1 + (aleatorio() - 0.5) * 0.06
          // ~3% de outliers plausíveis: vírgula deslocada no lançamento manual.
          // Servem para a tela de analytics ter o que sinalizar — e o sistema
          // SINALIZA, nunca bloqueia: a decisão continua humana.
          const outlier = aleatorio() < 0.03

          const comum = {
            id: `lanc-${ciclo.id}-${unidade.id}-${sub.id}`,
            subindicadorId: sub.id,
            unidadeId: unidade.id,
            cicloId: ciclo.id,
            evidencia: `Extração de ${indicador.fonte}: competência ${ciclo.competencia}`,
            autor: `ger-${unidade.id}`,
            registradoEm: carimbo(ciclo.competencia, 10 + Math.floor(aleatorio() * 8)),
            status: (aberto ? 'enviado' : 'validado') as Lancamento['status'],
          }

          if (sub.tipo === 'indice') {
            let valor = Math.max(0, valorAlvo * variacao)
            if (outlier) valor = valor * 10
            lancamentos.push({
              ...comum,
              valor: Math.round(valor * 10) / 10,
              numerador: null,
              denominador: null,
            })
          } else {
            const denominador = Math.round(60 + aleatorio() * 140)
            let numerador = Math.min(
              denominador,
              Math.max(0, Math.round(denominador * (valorAlvo / 100) * variacao)),
            )
            if (outlier) numerador = numerador * 10
            lancamentos.push({
              ...comum,
              valor: null,
              numerador,
              denominador,
            })
          }
        }
      }
    }
  }

  // Uma correção DENTRO da janela de revisão (dias 16 a 20) de um ciclo
  // fechado: o valor errado fica na base, a correção vence por ser mais
  // recente, e a trilha mostra o diff — é a regra dos "5 dias" da reunião.
  const indiceOriginal = lancamentos.findIndex(
    (l) => l.cicloId === 'ciclo-2026-03' && l.unidadeId === 'usf-sabia' && l.valor !== null,
  )
  let correcaoDaRevisao: { antes: Lancamento; depois: Lancamento } | null = null
  if (indiceOriginal >= 0) {
    const certo = lancamentos[indiceOriginal]
    const errado: Lancamento = {
      ...certo,
      valor: (certo.valor ?? 0) * 10,
      registradoEm: carimbo('2026-03', 12, 9),
    }
    const correcao: Lancamento = {
      ...certo,
      id: `${certo.id}-rev`,
      registradoEm: carimbo('2026-03', 17, 15),
    }
    lancamentos[indiceOriginal] = errado
    lancamentos.push(correcao)
    correcaoDaRevisao = { antes: errado, depois: correcao }
  }

  // Avaliações só existem para ciclos fechados: um ciclo em lançamento aberto
  // ainda não tem resultado, e inventar um seria mentir para o gerente.
  const avaliacoes: Avaliacao[] = []
  const avaliacoesDistritais: AvaliacaoDistrital[] = []
  for (const ciclo of ciclos) {
    if (ciclo.estado === 'rascunho' || ciclo.estado === 'lancamento_aberto') continue
    const regra = REGRAS.find((r) => r.id === ciclo.regraId) ?? REGRAS[0]

    const doCiclo = UNIDADES.map((unidade) =>
      calcularAvaliacao({
        unidade,
        cicloId: ciclo.id,
        indicadores: INDICADORES,
        subindicadores: SUBINDICADORES,
        lancamentos,
        regra,
      }),
    )
    avaliacoes.push(...doCiclo)

    for (const distrito of DISTRITOS) {
      const unidadesDoDistrito = new Set(
        UNIDADES.filter((u) => u.distritoId === distrito.id).map((u) => u.id),
      )
      avaliacoesDistritais.push(
        calcularAvaliacaoDistrital({
          distritoId: distrito.id,
          cicloId: ciclo.id,
          avaliacoesDasUnidades: doCiclo.filter((a) => unidadesDoDistrito.has(a.unidadeId)),
          regra,
        }),
      )
    }
  }

  const eventos = gerarEventos(ciclos, lancamentos, correcaoDaRevisao)

  const contestacoes: Contestacao[] = [
    {
      id: 'cont-1',
      gerenteId: 'ger-usf-canario',
      cicloId: 'ciclo-2026-04',
      indicadorId: 'vacinacao',
      motivo:
        'O denominador de crianças cadastradas inclui famílias transferidas para outra unidade no meio do mês. Pedimos revisão da base extraída.',
      abertaEm: carimbo('2026-05', 3),
      status: 'em_analise',
      resposta: null,
    },
    {
      id: 'cont-2',
      gerenteId: 'ger-poli-garca',
      cicloId: 'ciclo-2026-03',
      indicadorId: 'tempo-espera',
      motivo:
        'Houve mutirão de especialidades no período e a agenda regulada registrou a fila do mutirão como espera comum, fora da governabilidade da unidade.',
      abertaEm: carimbo('2026-04', 2),
      status: 'acatada',
      resposta:
        'Contestação acatada: os agendamentos do mutirão foram excluídos do cálculo do mês, conforme registro em ata da SEAB.',
    },
    {
      id: 'cont-3',
      gerenteId: 'ger-caps-colibri',
      cicloId: 'ciclo-2026-02',
      indicadorId: null,
      motivo:
        'Solicito revisão do peso atribuído ao acolhimento no recorte dos CAPS neste ciclo.',
      abertaEm: carimbo('2026-03', 5),
      status: 'recusada',
      resposta:
        'Peso definido em portaria vigente no período. Alteração só é possível por nova versão da regra, com vigência futura.',
    },
  ]

  return {
    distritos: DISTRITOS,
    tiposUnidade: TIPOS_UNIDADE,
    unidades: UNIDADES,
    gerentes,
    indicadores: INDICADORES,
    subindicadores: SUBINDICADORES,
    ciclos,
    regras: REGRAS,
    lancamentos,
    avaliacoes,
    avaliacoesDistritais,
    eventos,
    contestacoes,
  }
}

/**
 * Trilha de auditoria append-only, derivada dos próprios dados.
 * Cada evento carrega o antes e o depois — sem isso, a trilha não serve de prova.
 */
function gerarEventos(
  ciclos: readonly CicloAvaliacao[],
  lancamentos: readonly Lancamento[],
  correcaoDaRevisao: { antes: Lancamento; depois: Lancamento } | null,
): EventoAuditoria[] {
  const eventos: EventoAuditoria[] = []
  let sequencia = 0
  const proximoId = () => `ev-${String(++sequencia).padStart(5, '0')}`

  for (const regra of REGRAS) {
    eventos.push({
      id: proximoId(),
      quando: `${regra.vigenteDe}-02T09:00:00.000Z`,
      autor: 'seab',
      perfil: 'seab',
      tipo: 'regra_versionada',
      entidade: regra.id,
      descricao: `Regra de pontuação v${regra.versao} publicada com vigência a partir de ${regra.vigenteDe}.`,
      antes: null,
      depois: { versao: regra.versao, vigenteDe: regra.vigenteDe },
    })
  }

  for (const ciclo of ciclos) {
    eventos.push({
      id: proximoId(),
      quando: ciclo.janelaLancamentoInicio,
      autor: 'seab',
      perfil: 'seab',
      tipo: 'ciclo_criado',
      entidade: ciclo.id,
      descricao: `Ciclo da competência ${ciclo.competencia} criado com a regra ${ciclo.regraId}.`,
      antes: null,
      depois: { competencia: ciclo.competencia, estado: 'rascunho', regraId: ciclo.regraId },
    })

    const transicoes: EstadoCiclo[] = [
      'lancamento_aberto',
      'em_validacao',
      'homologado',
      'publicado',
    ]
    // A cronologia respeita a janela: lançamentos acontecem até o dia 20,
    // então validação, homologação e publicação vêm DEPOIS. Uma trilha com
    // em_validacao antes do último lançamento seria prova contra si mesma.
    const diaDaTransicao = [1, 21, 24, 27]
    let anterior: EstadoCiclo = 'rascunho'
    for (const [i, estado] of transicoes.entries()) {
      const alcancado =
        transicoes.indexOf(ciclo.estado as EstadoCiclo) >= i ||
        ciclo.estado === 'publicado' ||
        (ciclo.estado === 'homologado' && estado !== 'publicado')
      if (!alcancado) break

      eventos.push({
        id: proximoId(),
        quando: carimbo(ciclo.competencia, diaDaTransicao[i], 10),
        autor: 'seab',
        perfil: 'seab',
        tipo: 'ciclo_estado_alterado',
        entidade: ciclo.id,
        descricao: `Ciclo ${ciclo.competencia}: ${anterior} → ${estado}.`,
        antes: { estado: anterior },
        depois: { estado },
      })
      anterior = estado
    }
  }

  const idDaCorrecao = correcaoDaRevisao?.depois.id
  eventos.push(
    ...lancamentos
      .filter((lancamento) => lancamento.id !== idDaCorrecao)
      .map((lancamento) => ({
        id: proximoId(),
        quando: lancamento.registradoEm,
        autor: lancamento.autor,
        perfil: 'gerente_unidade',
        tipo: 'lancamento_registrado' as const,
        entidade: lancamento.id,
        descricao: `Lançamento de ${lancamento.subindicadorId} pela ${lancamento.unidadeId} no ciclo ${lancamento.cicloId}.`,
        antes: null,
        depois: {
          valor: lancamento.valor,
          numerador: lancamento.numerador,
          denominador: lancamento.denominador,
          status: lancamento.status,
        },
      })),
  )

  if (correcaoDaRevisao) {
    const { antes, depois } = correcaoDaRevisao
    eventos.push({
      id: proximoId(),
      quando: depois.registradoEm,
      autor: depois.autor,
      perfil: 'gerente_unidade',
      tipo: 'lancamento_alterado',
      entidade: depois.id,
      descricao: `Correção de ${depois.subindicadorId} pela ${depois.unidadeId} dentro da janela de revisão.`,
      antes: { valor: antes.valor },
      depois: { valor: depois.valor },
    })
  }

  return eventos.sort((a, b) => (a.quando < b.quando ? 1 : a.quando > b.quando ? -1 : 0))
}
