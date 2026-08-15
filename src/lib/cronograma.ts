/**
 * Cronograma do semestre — FONTE ÚNICA DE VERDADE.
 *
 * Header, releases, registro e checklist derivam apenas deste arquivo.
 * Mudança de data acontece SÓ aqui (§4 do briefing).
 *
 * Datas são datas civis em `YYYY-MM-DD`, nunca objetos `Date`: isso elimina
 * a classe inteira de bugs de fuso horário. A conversão para o fuso do
 * projeto (America/Recife) vive em `src/lib/datas.ts`.
 */

export type TipoCiclo = 'semana' | 'pausa' | 'marco'

export interface Ciclo {
  /** Identificador estável usado em rotas, conteúdo e travas. */
  readonly id: string
  /** Data civil do ciclo, `YYYY-MM-DD`, no fuso America/Recife. */
  readonly data: string
  readonly rotulo: string
  readonly tipo: TipoCiclo
  /** Peso da lente de Projeto, conforme a matriz da disciplina. */
  readonly peso: number
  /** Evidências esperadas no ciclo — alimentam o checklist da matriz no painel admin. */
  readonly evidencias: readonly string[]
}

export const CRONOGRAMA = [
  {
    id: 's1',
    data: '2026-08-08',
    rotulo: 'Semana 1 — Partida',
    tipo: 'semana',
    peso: 3,
    evidencias: [
      'Equipe formada',
      'Papéis definidos',
      'Case escolhido',
      'Registro do projeto criado',
    ],
  },
  {
    id: 's2',
    data: '2026-08-15',
    rotulo: 'Semana 2 — Imersão',
    tipo: 'semana',
    peso: 7,
    evidencias: [
      'Pesquisa estruturada',
      'Problema contextualizado',
      'Personas e stakeholders',
      'Mapa de empatia',
      'Benchmarking',
      'SWOT',
      'Objetivos',
      'Cronograma inicial',
    ],
  },
  {
    id: 's3',
    data: '2026-08-22',
    rotulo: 'Semana 3 — Ideação',
    tipo: 'semana',
    peso: 5,
    evidencias: [
      "Brainwriting, Brainstorming e Crazy 8's registrados",
      'Alternativas levantadas',
      'Critérios de decisão',
      'Ideia escolhida com justificativa',
    ],
  },
  {
    id: 's4',
    data: '2026-08-29',
    rotulo: 'Semana 4 — Proposta',
    tipo: 'semana',
    peso: 5,
    evidencias: [
      'Proposta de solução',
      'Escopo preliminar',
      'Backlog inicial',
      'Papéis',
      'Cronograma de execução',
    ],
  },
  {
    id: 'i1',
    data: '2026-09-05',
    rotulo: 'Imprensado',
    tipo: 'pausa',
    peso: 0,
    evidencias: ['Entregas acumuladas na semana seguinte'],
  },
  {
    id: 'ko',
    data: '2026-09-12',
    rotulo: 'Kick-off',
    tipo: 'marco',
    peso: 0,
    evidencias: [
      'Pitch de 5 min: problema, relevância, ideia priorizada, direcionamento',
      'Fala distribuída entre os 6 integrantes',
    ],
  },
  {
    id: 's5',
    data: '2026-09-19',
    rotulo: 'Semana 5 — Arquitetura',
    tipo: 'semana',
    peso: 10,
    evidencias: [
      'Diagrama de arquitetura',
      'Fluxo de dados',
      'Primeiras telas',
      'Pipeline',
      'Backlog técnico',
    ],
  },
  {
    id: 's6',
    data: '2026-09-26',
    rotulo: 'Semana 6 — Pré-SR1',
    tipo: 'semana',
    peso: 5,
    evidencias: [
      'Pacote SR1',
      'Protótipo atualizado',
      'Escopo revisado',
      'Cronograma e backlog',
      'Riscos',
    ],
  },
  {
    id: 'sr1',
    data: '2026-10-03',
    rotulo: 'SR1',
    tipo: 'marco',
    peso: 15,
    evidencias: [
      'Pesquisa consolidada',
      'Escopo maduro',
      'Protótipo de baixa/média fidelidade',
      'Desenvolvimento iniciado',
      'Evidências técnicas',
      'Plano de correção de rota',
    ],
  },
  {
    id: 'i2',
    data: '2026-10-10',
    rotulo: 'Imprensado',
    tipo: 'pausa',
    peso: 0,
    evidencias: [],
  },
  {
    id: 's7',
    data: '2026-10-17',
    rotulo: 'Semana 7 — Sprint 1',
    tipo: 'semana',
    peso: 8,
    evidencias: [
      'Feedbacks do SR1 aplicados',
      'Histórias priorizadas',
      'Primeiras funcionalidades',
      'Backlog',
    ],
  },
  {
    id: 's8',
    data: '2026-10-24',
    rotulo: 'Semana 8 — Sprint 2',
    tipo: 'semana',
    peso: 8,
    evidencias: [
      'Funcionalidades incrementadas',
      'Dados organizados',
      'Início do pré-processamento',
    ],
  },
  {
    id: 'i3',
    data: '2026-10-31',
    rotulo: 'Imprensado',
    tipo: 'pausa',
    peso: 0,
    evidencias: [],
  },
  {
    id: 's9',
    data: '2026-11-07',
    rotulo: 'Semana 9 — Sprint 3',
    tipo: 'semana',
    peso: 8,
    evidencias: [
      'Nova versão funcional',
      'Integração',
      'Registros de testes',
      'Backlog',
    ],
  },
  {
    id: 's10',
    data: '2026-11-14',
    rotulo: 'Semana 10 — Sprint 4',
    tipo: 'semana',
    peso: 8,
    evidencias: ['Versão revisada', 'Correções do SR1', 'Evidências de testes'],
  },
  {
    id: 's11',
    data: '2026-11-21',
    rotulo: 'Semana 11 — Validação',
    tipo: 'semana',
    peso: 10,
    evidencias: [
      'Roteiro de entrevista e questionário',
      'Feedback do cliente',
      'Resultados',
      'Ajustes no MVP',
    ],
  },
  {
    id: 's12',
    data: '2026-11-28',
    rotulo: 'Semana 12 — Pré-SR2',
    tipo: 'semana',
    peso: 5,
    evidencias: [
      'Material SR2',
      'Documentação técnica',
      'MVP demonstrável',
      'Evidências consolidadas',
    ],
  },
  {
    id: 'sr2',
    data: '2026-12-05',
    rotulo: 'SR2 — Final',
    tipo: 'marco',
    peso: 18,
    evidencias: [
      'Demonstração',
      'Documentação',
      'Validação',
      'Planejado × realizado',
      'Limitações',
      'Próximos passos',
    ],
  },
] as const satisfies readonly Ciclo[]

/** União literal dos 18 ciclos. Todo o sistema tipa contra ela. */
export type CicloId = (typeof CRONOGRAMA)[number]['id']

export const IDS_CICLOS = CRONOGRAMA.map((c) => c.id) as readonly CicloId[]

/**
 * Soma dos pesos da matriz da disciplina.
 *
 * ATENÇÃO: os pesos do briefing somam 115, não 100. Mantemos os valores fiéis
 * ao documento e normalizamos por esta soma na hora de exibir progresso —
 * corrigir o dado em silêncio esconderia a inconsistência da matriz.
 */
export const PESO_TOTAL = CRONOGRAMA.reduce((soma, c) => soma + c.peso, 0)

export function cicloPorId(id: CicloId): Ciclo {
  const ciclo = CRONOGRAMA.find((c) => c.id === id)
  if (!ciclo) throw new Error(`Ciclo desconhecido: ${id}`)
  return ciclo
}

export function indiceDoCiclo(id: CicloId): number {
  return CRONOGRAMA.findIndex((c) => c.id === id)
}

/** Kick-off, SR1 e SR2 — a "evolução visível" exigida pela diretriz de registro. */
export const MARCOS = CRONOGRAMA.filter((c) => c.tipo === 'marco')

export type TrilhaParalela = 'ml' | 'direito'

export interface MarcoParalelo {
  readonly trilha: TrilhaParalela
  readonly data: string
  readonly rotulo: string
  readonly oQueOProjetoAlimenta: string
}

/** Marcos das outras lentes — aparecem só no painel admin, nunca no registro público. */
export const MARCOS_PARALELOS: readonly MarcoParalelo[] = [
  {
    trilha: 'ml',
    data: '2026-09-23',
    rotulo: 'ML — entrega parcial',
    oQueOProjetoAlimenta: 'Gerador sintético e recorte inicial do dataset de indicadores',
  },
  {
    trilha: 'ml',
    data: '2026-09-30',
    rotulo: 'ML — AV1',
    oQueOProjetoAlimenta: 'EDA e pré-processamento sobre os dados do projeto',
  },
  {
    trilha: 'ml',
    data: '2026-11-18',
    rotulo: 'ML — entrega final',
    oQueOProjetoAlimenta: 'Classificação, regressão e clustering exportados para a tela de analytics',
  },
  {
    trilha: 'ml',
    data: '2026-12-02',
    rotulo: 'ML — AV2',
    oQueOProjetoAlimenta: 'Conclusões e comparação honesta entre modelos',
  },
  {
    trilha: 'direito',
    data: '2026-10-02',
    rotulo: 'Direito — AV1',
    oQueOProjetoAlimenta: 'Base legal do tratamento e mapeamento de dados pessoais (docs/privacidade.md)',
  },
  {
    trilha: 'direito',
    data: '2026-11-27',
    rotulo: 'Direito — AV2',
    oQueOProjetoAlimenta: 'Privacy by Design aplicado ao MVP e direitos dos titulares',
  },
]
