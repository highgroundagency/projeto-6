import { calcularAvaliacao, regraVigente } from '@/lib/calculo/motor'
import type {
  Area,
  Avaliacao,
  CicloAvaliacao,
  Contestacao,
  EstadoCiclo,
  EventoAuditoria,
  Gestor,
  Indicador,
  Lancamento,
  RegraDePontuacao,
} from '@/lib/calculo/tipos'
import { AREAS, CARGOS, INDICADORES, NOMES_GESTORES } from './catalogo'
import { prng } from './prng'

/**
 * Gerador de base sintética (§10.1, versão em memória para as fases 1–2).
 *
 * Semente fixa: o mesmo seed produz sempre os mesmos números, o que torna a
 * demonstração reproduzível e os testes confiáveis. Na F4 o gerador em Python
 * assume este papel e exporta os dados; a forma dos dados é a mesma.
 *
 * Nenhum dado real de pessoa ou da SESAU. Ver §2.4 e docs/privacidade.md.
 */

export const SEMENTE_PADRAO = 20262

export interface BaseSintetica {
  readonly areas: readonly Area[]
  readonly gestores: readonly Gestor[]
  readonly indicadores: readonly Indicador[]
  readonly ciclos: readonly CicloAvaliacao[]
  readonly regras: readonly RegraDePontuacao[]
  readonly lancamentos: readonly Lancamento[]
  readonly avaliacoes: readonly Avaliacao[]
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
    arredondamento: { casas: 2, modo: 'meio_para_cima' },
    tetoAtingimento: 1.5,
    semLancamento: 'zera_com_aviso',
  },
  {
    id: 'regra-v2',
    versao: 2,
    descricao:
      'Revisão a partir de abril: patamar de entrada sobe de 70% para 75% e a faixa intermediária é desdobrada.',
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
    arredondamento: { casas: 2, modo: 'meio_para_cima' },
    tetoAtingimento: 1.5,
    semLancamento: 'zera_com_aviso',
  },
]

/** Fim do mês da competência, às 12h UTC — determinístico, sem relógio. */
function carimbo(competencia: string, diaDoMes: number, hora = 12): string {
  return `${competencia}-${String(diaDoMes).padStart(2, '0')}T${String(hora).padStart(2, '0')}:00:00.000Z`
}

function arredondarValor(valor: number, unidade: string): number {
  const inteiro = ['pacientes', 'atendimentos', 'visitas/mês'].includes(unidade)
  return inteiro ? Math.round(valor) : Math.round(valor * 10) / 10
}

export function gerarBase(semente: number = SEMENTE_PADRAO): BaseSintetica {
  const aleatorio = prng(semente)

  const indicadores: Indicador[] = INDICADORES.map((definicao) => ({
    id: definicao.id,
    areaId: definicao.areaId,
    nome: definicao.nome,
    unidade: definicao.unidade,
    direcao: definicao.direcao,
    fonte: definicao.fonte,
    periodicidade: definicao.periodicidade,
    meta: definicao.meta,
    peso: definicao.peso,
  }))

  const gestores: Gestor[] = AREAS.map((area, i) => ({
    id: `gestor-${area.id}`,
    nome: NOMES_GESTORES[i % NOMES_GESTORES.length],
    cargo: CARGOS[i % CARGOS.length],
    areaId: area.id,
  }))

  const ciclos: CicloAvaliacao[] = COMPETENCIAS.map((competencia) => ({
    id: `ciclo-${competencia}`,
    competencia,
    estado: ESTADOS[competencia],
    janelaLancamentoInicio: carimbo(competencia, 1, 0),
    janelaLancamentoFim: carimbo(competencia, 20, 23),
    regraId: regraVigente(competencia, REGRAS)?.id ?? REGRAS[0].id,
  }))

  // Cada área tem um viés estável: umas entregam melhor que outras, ciclo a ciclo.
  const vieses = new Map<string, number>(
    AREAS.map((area) => [area.id, (aleatorio() - 0.5) * 0.12]),
  )

  const lancamentos: Lancamento[] = []

  for (const [indiceCiclo, ciclo] of ciclos.entries()) {
    // No ciclo aberto, parte das áreas ainda não lançou — é o estado real de
    // uma janela em andamento, e é o que faz o funil da CAM ter o que mostrar.
    const aberto = ciclo.estado === 'lancamento_aberto'

    for (const definicao of INDICADORES) {
      if (aberto && aleatorio() < 0.38) continue

      const vies = vieses.get(definicao.areaId) ?? 0
      const tendencia = indiceCiclo * 0.008
      const sazonalidade = Math.sin((indiceCiclo / COMPETENCIAS.length) * Math.PI * 2) * 0.03
      const ruido = (aleatorio() - 0.5) * definicao.volatilidade * 2

      const atingimento = Math.max(
        0.35,
        definicao.desempenhoBase + vies + tendencia + sazonalidade + ruido,
      )

      let valor =
        definicao.direcao === 'maior_melhor'
          ? definicao.meta * atingimento
          : definicao.meta / atingimento

      // ~3% de outliers plausíveis: vírgula deslocada no lançamento manual.
      // Servem para a tela de analytics ter o que sinalizar — e o sistema
      // SINALIZA, nunca bloqueia: a decisão continua humana.
      const outlier = aleatorio() < 0.03
      if (outlier) valor = valor * 10

      lancamentos.push({
        id: `lanc-${ciclo.id}-${definicao.id}`,
        indicadorId: definicao.id,
        cicloId: ciclo.id,
        valor: arredondarValor(valor, definicao.unidade),
        evidencia: `Extração de ${definicao.fonte}: competência ${ciclo.competencia}`,
        autor: `gestor-${definicao.areaId}`,
        registradoEm: carimbo(ciclo.competencia, 10 + Math.floor(aleatorio() * 8)),
        status: aberto ? 'enviado' : 'validado',
      })
    }
  }

  // Avaliações só existem para ciclos fechados: um ciclo em lançamento aberto
  // ainda não tem resultado, e inventar um seria mentir para o gestor.
  const avaliacoes: Avaliacao[] = []
  for (const ciclo of ciclos) {
    if (ciclo.estado === 'rascunho' || ciclo.estado === 'lancamento_aberto') continue
    const regra = REGRAS.find((r) => r.id === ciclo.regraId) ?? REGRAS[0]
    for (const gestor of gestores) {
      avaliacoes.push(
        calcularAvaliacao({ gestor, cicloId: ciclo.id, indicadores, lancamentos, regra }),
      )
    }
  }

  const eventos = gerarEventos(ciclos, lancamentos, gestores)

  const contestacoes: Contestacao[] = [
    {
      id: 'cont-1',
      gestorId: 'gestor-reg',
      cicloId: 'ciclo-2026-04',
      indicadorId: 'reg-fila-espera',
      motivo:
        'A fila informada inclui pacientes que já haviam sido regulados por outra central. Pedimos revisão da base extraída.',
      abertaEm: carimbo('2026-05', 3),
      status: 'em_analise',
      resposta: null,
    },
    {
      id: 'cont-2',
      gestorId: 'gestor-af',
      cicloId: 'ciclo-2026-03',
      indicadorId: 'af-disponibilidade',
      motivo:
        'Houve desabastecimento nacional de dois itens da relação básica no período, fora da governabilidade da área.',
      abertaEm: carimbo('2026-04', 2),
      status: 'acatada',
      resposta:
        'Contestação acatada: os dois itens foram excluídos do denominador do mês, conforme registro em ata da comissão.',
    },
    {
      id: 'cont-3',
      gestorId: 'gestor-sm',
      cicloId: 'ciclo-2026-02',
      indicadorId: null,
      motivo: 'Solicito revisão do peso atribuído aos indicadores de matriciamento no ciclo.',
      abertaEm: carimbo('2026-03', 5),
      status: 'recusada',
      resposta:
        'Peso definido em portaria vigente no período. Alteração só é possível por nova versão da regra, com vigência futura.',
    },
  ]

  return {
    areas: AREAS,
    gestores,
    indicadores,
    ciclos,
    regras: REGRAS,
    lancamentos,
    avaliacoes,
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
  gestores: readonly Gestor[],
): EventoAuditoria[] {
  const eventos: EventoAuditoria[] = []
  let sequencia = 0
  const proximoId = () => `ev-${String(++sequencia).padStart(5, '0')}`

  eventos.push({
    id: proximoId(),
    quando: '2026-01-02T09:00:00.000Z',
    autor: 'comissao',
    perfil: 'cam',
    tipo: 'regra_versionada',
    entidade: 'regra-v1',
    descricao: 'Regra de pontuação v1 publicada com vigência a partir de 2026-01.',
    antes: null,
    depois: { versao: 1, vigenteDe: '2026-01' },
  })

  for (const ciclo of ciclos) {
    eventos.push({
      id: proximoId(),
      quando: ciclo.janelaLancamentoInicio,
      autor: 'comissao',
      perfil: 'cam',
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
    let anterior: EstadoCiclo = 'rascunho'
    for (const [i, estado] of transicoes.entries()) {
      const alcancado =
        transicoes.indexOf(ciclo.estado as EstadoCiclo) >= i ||
        ciclo.estado === 'publicado' ||
        (ciclo.estado === 'homologado' && estado !== 'publicado')
      if (!alcancado) break

      eventos.push({
        id: proximoId(),
        quando: carimbo(ciclo.competencia, Math.min(1 + i * 8, 28), 10),
        autor: 'comissao',
        perfil: 'cam',
        tipo: 'ciclo_estado_alterado',
        entidade: ciclo.id,
        descricao: `Ciclo ${ciclo.competencia}: ${anterior} → ${estado}.`,
        antes: { estado: anterior },
        depois: { estado },
      })
      anterior = estado
    }
  }

  eventos.push(
    ...lancamentos.map((lancamento) => ({
      id: proximoId(),
      quando: lancamento.registradoEm,
      autor: lancamento.autor,
      perfil: 'area_tecnica',
      tipo: 'lancamento_registrado' as const,
      entidade: lancamento.id,
      descricao: `Lançamento de ${lancamento.indicadorId} no ciclo ${lancamento.cicloId}.`,
      antes: null,
      depois: { valor: lancamento.valor, status: lancamento.status },
    })),
  )

  // Uma correção real, para a trilha mostrar diff de verdade.
  const corrigido = lancamentos.find((l) => l.cicloId === 'ciclo-2026-03')
  if (corrigido) {
    eventos.push({
      id: proximoId(),
      quando: carimbo('2026-03', 19, 16),
      autor: gestores[0].id,
      perfil: 'area_tecnica',
      tipo: 'lancamento_alterado',
      entidade: corrigido.id,
      descricao: `Correção de valor em ${corrigido.indicadorId} dentro da janela de lançamento.`,
      antes: { valor: corrigido.valor * 10 },
      depois: { valor: corrigido.valor },
    })
  }

  return eventos.sort((a, b) => (a.quando < b.quando ? 1 : a.quando > b.quando ? -1 : 0))
}
