import type {
  EstadoCiclo,
  StatusContestacao,
  StatusLancamento,
} from '@/lib/calculo/tipos'

/**
 * FOTOGRAFIA do domínio v1, congelada para a semeadura do schema guardado.
 *
 * A reunião com o cliente (22/08, ADR-034) remodelou o domínio vivo:
 * subindicadores, tipos de unidade, distritos, aplicabilidade na regra. O
 * schema PostgreSQL de `supabase/migrations/` ainda modela a forma ANTERIOR
 * (áreas, indicador com meta e peso próprios, lançamento direto no indicador),
 * e continua valendo como prova de RLS e gatilhos — mas não como espelho do
 * domínio atual. A pendência está declarada em docs/banco.md e acompanha a
 * ligação de uma persistência real.
 *
 * Enquanto isso, a semeadura usa ESTA base: pequena, literal e na forma v1,
 * para que `npm run semear` e os testes contra Postgres continuem provando o
 * schema de ponta a ponta sem fingir que ele já entende o domínio novo.
 *
 * Tudo aqui é sintético (§2.4). Nenhum dado real de pessoa ou da SESAU.
 */

export interface AreaV1 {
  readonly id: string
  readonly nome: string
  readonly sigla: string
}

export interface GestorV1 {
  readonly id: string
  readonly nome: string
  readonly cargo: string
  readonly areaId: string
}

export interface IndicadorV1 {
  readonly id: string
  readonly areaId: string
  readonly nome: string
  readonly unidade: string
  readonly direcao: 'maior_melhor' | 'menor_melhor'
  readonly fonte: string
  readonly periodicidade: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'
  readonly meta: number
  readonly peso: number
}

export interface CicloV1 {
  readonly id: string
  readonly competencia: string
  readonly estado: EstadoCiclo
  readonly janelaLancamentoInicio: string
  readonly janelaLancamentoFim: string
  readonly regraId: string
}

export interface LancamentoV1 {
  readonly id: string
  readonly indicadorId: string
  readonly cicloId: string
  readonly valor: number
  readonly evidencia: string
  readonly autor: string
  readonly registradoEm: string
  readonly status: StatusLancamento
}

export interface RegraV1 {
  readonly id: string
  readonly versao: number
  readonly descricao: string
  readonly vigenteDe: string
  readonly vigenteAte: string | null
  readonly faixas: readonly { de: number; ate: number | null; pontos: number }[]
  readonly pontuacaoMaxima: number
  readonly faixasGratificacao: readonly {
    de: number
    ate: number | null
    rotulo: string
    percentual: number
  }[]
  readonly arredondamento: { casas: number; modo: string }
  readonly tetoAtingimento: number
  readonly semLancamento: string
}

export interface PassoMemoriaV1 {
  readonly indicadorId: string
  readonly indicador: string
  readonly unidade: string
  readonly direcao: 'maior_melhor' | 'menor_melhor'
  readonly valor: number | null
  readonly meta: number
  readonly atingimentoBruto: number | null
  readonly atingimento: number | null
  readonly aplicouTeto: boolean
  readonly faixa: string
  readonly pontos: number
  readonly peso: number
  readonly pesoNormalizado: number
  readonly contribuicao: number
}

export interface AvaliacaoV1 {
  readonly gestorId: string
  readonly cicloId: string
  readonly score: number
  readonly faixa: { de: number; ate: number | null; rotulo: string; percentual: number } | null
  readonly memoria: {
    readonly regraId: string
    readonly versaoRegra: number
    readonly passos: readonly PassoMemoriaV1[]
    readonly somaPesos: number
    readonly somaContribuicoes: number
    readonly pontuacaoMaxima: number
    readonly score: number
    readonly formula: string
  }
  readonly avisos: readonly string[]
}

export interface ContestacaoV1 {
  readonly id: string
  readonly gestorId: string
  readonly cicloId: string
  readonly indicadorId: string | null
  readonly motivo: string
  readonly abertaEm: string
  readonly status: StatusContestacao
  readonly resposta: string | null
}

export interface BaseV1 {
  readonly areas: readonly AreaV1[]
  readonly gestores: readonly GestorV1[]
  readonly indicadores: readonly IndicadorV1[]
  readonly ciclos: readonly CicloV1[]
  readonly regras: readonly RegraV1[]
  readonly lancamentos: readonly LancamentoV1[]
  readonly avaliacoes: readonly AvaliacaoV1[]
  readonly contestacoes: readonly ContestacaoV1[]
}

const REGRA: RegraV1 = {
  id: 'regra-v1',
  versao: 1,
  descricao: 'Faixas do ciclo 2026 na forma v1, congeladas para o schema guardado.',
  vigenteDe: '2026-01',
  vigenteAte: null,
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
}

const FORMULA = 'score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100'

function passo(
  indicador: IndicadorV1,
  valor: number,
  atingimento: number,
  faixa: string,
  pontos: number,
  pesoNormalizado: number,
): PassoMemoriaV1 {
  return {
    indicadorId: indicador.id,
    indicador: indicador.nome,
    unidade: indicador.unidade,
    direcao: indicador.direcao,
    valor,
    meta: indicador.meta,
    atingimentoBruto: atingimento,
    atingimento,
    aplicouTeto: false,
    faixa,
    pontos,
    peso: indicador.peso,
    pesoNormalizado,
    contribuicao: pontos * indicador.peso,
  }
}

const AREAS: readonly AreaV1[] = [
  { id: 'aps', sigla: 'APS', nome: 'Atenção Primária à Saúde' },
  { id: 'vis', sigla: 'VIS', nome: 'Vigilância em Saúde' },
]

const GESTORES: readonly GestorV1[] = [
  { id: 'gestor-aps', nome: 'A. Moraes', cargo: 'Coordenação', areaId: 'aps' },
  { id: 'gestor-vis', nome: 'B. Siqueira', cargo: 'Gerência', areaId: 'vis' },
]

const INDICADORES: readonly IndicadorV1[] = [
  {
    id: 'aps-cobertura',
    areaId: 'aps',
    nome: 'Cobertura populacional por equipes de Saúde da Família',
    unidade: '%',
    direcao: 'maior_melhor',
    fonte: 'Cadastro de equipes',
    periodicidade: 'mensal',
    meta: 85,
    peso: 3,
  },
  {
    id: 'aps-pre-natal',
    areaId: 'aps',
    nome: 'Gestantes com sete ou mais consultas de pré-natal',
    unidade: '%',
    direcao: 'maior_melhor',
    fonte: 'Sistema de acompanhamento',
    periodicidade: 'mensal',
    meta: 75,
    peso: 2,
  },
  {
    id: 'vis-vacinacao',
    areaId: 'vis',
    nome: 'Crianças com esquema vacinal em dia',
    unidade: '%',
    direcao: 'maior_melhor',
    fonte: 'Sistema de imunização',
    periodicidade: 'mensal',
    meta: 95,
    peso: 3,
  },
]

const CICLOS: readonly CicloV1[] = [
  {
    id: 'ciclo-2026-01',
    competencia: '2026-01',
    estado: 'publicado',
    janelaLancamentoInicio: '2026-01-01T00:00:00.000Z',
    janelaLancamentoFim: '2026-01-20T23:00:00.000Z',
    regraId: 'regra-v1',
  },
  {
    id: 'ciclo-2026-02',
    competencia: '2026-02',
    estado: 'homologado',
    janelaLancamentoInicio: '2026-02-01T00:00:00.000Z',
    janelaLancamentoFim: '2026-02-20T23:00:00.000Z',
    regraId: 'regra-v1',
  },
  {
    id: 'ciclo-2026-03',
    competencia: '2026-03',
    estado: 'lancamento_aberto',
    janelaLancamentoInicio: '2026-03-01T00:00:00.000Z',
    janelaLancamentoFim: '2026-03-20T23:00:00.000Z',
    regraId: 'regra-v1',
  },
]

function lancamento(
  cicloId: string,
  competencia: string,
  indicadorId: string,
  valor: number,
  status: LancamentoV1['status'],
): LancamentoV1 {
  return {
    id: `lanc-${cicloId}-${indicadorId}`,
    indicadorId,
    cicloId,
    valor,
    evidencia: `Extração sintética da competência ${competencia}`,
    autor: indicadorId.startsWith('vis-') ? 'gestor-vis' : 'gestor-aps',
    registradoEm: `${competencia}-12T12:00:00.000Z`,
    status,
  }
}

const LANCAMENTOS: readonly LancamentoV1[] = [
  lancamento('ciclo-2026-01', '2026-01', 'aps-cobertura', 82.5, 'validado'),
  lancamento('ciclo-2026-01', '2026-01', 'aps-pre-natal', 71.3, 'validado'),
  lancamento('ciclo-2026-01', '2026-01', 'vis-vacinacao', 93.1, 'validado'),
  lancamento('ciclo-2026-02', '2026-02', 'aps-cobertura', 84.9, 'validado'),
  lancamento('ciclo-2026-02', '2026-02', 'aps-pre-natal', 76.2, 'validado'),
  lancamento('ciclo-2026-02', '2026-02', 'vis-vacinacao', 95.8, 'validado'),
  // O ciclo aberto fica com lançamento faltando, como numa janela real.
  lancamento('ciclo-2026-03', '2026-03', 'aps-cobertura', 86.1, 'enviado'),
  lancamento('ciclo-2026-03', '2026-03', 'vis-vacinacao', 94.4, 'enviado'),
]

const AVALIACOES: readonly AvaliacaoV1[] = [
  {
    gestorId: 'gestor-aps',
    cicloId: 'ciclo-2026-01',
    score: 90,
    faixa: { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
    memoria: {
      regraId: 'regra-v1',
      versaoRegra: 1,
      passos: [
        passo(INDICADORES[0], 82.5, 0.9706, '95% a <100%', 9, 0.6),
        passo(INDICADORES[1], 71.3, 0.9507, '95% a <100%', 9, 0.4),
      ],
      somaPesos: 5,
      somaContribuicoes: 45,
      pontuacaoMaxima: 10,
      score: 90,
      formula: FORMULA,
    },
    avisos: [],
  },
  {
    gestorId: 'gestor-vis',
    cicloId: 'ciclo-2026-01',
    score: 90,
    faixa: { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
    memoria: {
      regraId: 'regra-v1',
      versaoRegra: 1,
      passos: [passo(INDICADORES[2], 93.1, 0.98, '95% a <100%', 9, 1)],
      somaPesos: 3,
      somaContribuicoes: 27,
      pontuacaoMaxima: 10,
      score: 90,
      formula: FORMULA,
    },
    avisos: [],
  },
  {
    gestorId: 'gestor-aps',
    cicloId: 'ciclo-2026-02',
    score: 94,
    faixa: { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
    memoria: {
      regraId: 'regra-v1',
      versaoRegra: 1,
      passos: [
        passo(INDICADORES[0], 84.9, 0.9988, '95% a <100%', 9, 0.6),
        passo(INDICADORES[1], 76.2, 1.016, '≥ 100%', 10, 0.4),
      ],
      somaPesos: 5,
      somaContribuicoes: 47,
      pontuacaoMaxima: 10,
      score: 94,
      formula: FORMULA,
    },
    avisos: [],
  },
  {
    gestorId: 'gestor-vis',
    cicloId: 'ciclo-2026-02',
    score: 100,
    faixa: { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
    memoria: {
      regraId: 'regra-v1',
      versaoRegra: 1,
      passos: [passo(INDICADORES[2], 95.8, 1.0084, '≥ 100%', 10, 1)],
      somaPesos: 3,
      somaContribuicoes: 30,
      pontuacaoMaxima: 10,
      score: 100,
      formula: FORMULA,
    },
    avisos: [],
  },
]

const CONTESTACOES: readonly ContestacaoV1[] = [
  {
    id: 'cont-v1-1',
    gestorId: 'gestor-vis',
    cicloId: 'ciclo-2026-01',
    indicadorId: 'vis-vacinacao',
    motivo:
      'O denominador do mês inclui crianças transferidas de outra área no fim do período. Pedimos revisão da base extraída.',
    abertaEm: '2026-02-03T12:00:00.000Z',
    status: 'em_analise',
    resposta: null,
  },
]

export const BASE_V1: BaseV1 = {
  areas: AREAS,
  gestores: GESTORES,
  indicadores: INDICADORES,
  ciclos: CICLOS,
  regras: [REGRA],
  lancamentos: LANCAMENTOS,
  avaliacoes: AVALIACOES,
  contestacoes: CONTESTACOES,
}
