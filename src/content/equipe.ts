/**
 * Equipe 1 — CESAR School, Sistemas de Informação, 2026.2.
 *
 * Os papéis abaixo são uma PROPOSTA (selo `rascunho`): cobrem as três lentes
 * da disciplina (Projeto, Machine Learning e Direito Digital) e as frentes
 * reais do produto. A equipe ajusta este arquivo e troca o selo para
 * `validado` — é o único lugar que precisa mudar.
 */

export interface Integrante {
  readonly id: string
  readonly nome: string
  readonly iniciais: string
  readonly papel: string
  readonly frente: string
}

export const EQUIPE = [
  {
    id: 'gabriel',
    nome: 'Gabriel Tenório de Lima Teixeira',
    iniciais: 'GT',
    papel: 'Produto e PO',
    frente: 'Escopo, backlog, priorização e interlocução com a CAM.',
  },
  {
    id: 'matheus',
    nome: 'Matheus Lustosa',
    iniciais: 'ML',
    papel: 'Pesquisa e validação',
    frente: 'Personas, benchmarking, entrevistas e instrumentos de validação.',
  },
  {
    id: 'joao-henrique',
    nome: 'João Henrique Micucci',
    iniciais: 'JH',
    papel: 'Arquitetura e backend',
    frente: 'Modelo de dados, motor de cálculo e o schema com RLS.',
  },
  {
    id: 'joao-pedro',
    nome: 'João Pedro Mamede',
    iniciais: 'JP',
    papel: 'Front-end e design system',
    frente: 'Telas, tokens, acessibilidade e a memória de cálculo na interface.',
  },
  {
    id: 'rafael',
    nome: 'Rafael Serpa',
    iniciais: 'RS',
    papel: 'Dados e machine learning',
    frente: 'Gerador sintético, notebooks, modelos e a tela de analytics.',
  },
  {
    id: 'fernando',
    nome: 'Fernando Cavalcanti',
    iniciais: 'FC',
    papel: 'Qualidade, documentação e governança',
    frente: 'Testes, documentação técnica, LGPD e registro de uso de IA.',
  },
] as const satisfies readonly Integrante[]

export type IntegranteId = (typeof EQUIPE)[number]['id']

/** Selo dos papéis: vira 'validado' quando a equipe confirmar a distribuição. */
export const SELO_PAPEIS = 'rascunho' as const

export function integrantePorId(id: IntegranteId): Integrante {
  const integrante = EQUIPE.find((i) => i.id === id)
  if (!integrante) throw new Error(`Integrante desconhecido: ${id}`)
  return integrante
}
