import type { CicloId } from '@/lib/cronograma'

/**
 * Equipe 2 — CESAR School, Sistemas de Informação, 2026.2.
 *
 * Os papéis abaixo cobrem as disciplinas-alvo que a matriz nomeia (Segurança da
 * Informação, Aprendizado de Máquina e Arquitetura Nativa na Nuvem), mais a
 * lente de Direito, que a equipe acrescentou porque um sistema que decide
 * remuneração cai no art. 20 da LGPD. A equipe confirmou
 * a distribuição, então `SELO_PAPEIS` é `validado` — este é o único lugar que
 * precisa mudar se ela for revista.
 */

export interface Integrante {
  readonly id: string
  readonly nome: string
  readonly iniciais: string
  readonly papel: string
  readonly frente: string
  /**
   * Ciclo em que a pessoa entrou na equipe. Ausente quer dizer desde a
   * Semana 1.
   *
   * Existe para o site não precisar fingir que o time sempre foi o mesmo.
   * Quem entra no meio não tem histórico nas semanas anteriores, não aparece
   * como responsável por elas e não recebe fala num pitch que já estava
   * ensaiado. O campo é o que permite dizer isso em vez de escondê-lo.
   */
  readonly desde?: CicloId
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
  {
    id: 'kerry',
    nome: 'Kerry Muniz',
    iniciais: 'KM',
    // NÃO é a frente dele: é onde ele apoia enquanto a frente não é definida.
    // Ele chegou no dia do Kick-off, e inventar um papel fechado para quem
    // acabou de entrar seria escrever no registro uma coisa que não aconteceu.
    papel: 'Apoio em pesquisa e validação',
    frente:
      'Entrou na equipe no Kick-off. Apoia o benchmarking e os instrumentos de validação, e a frente própria será combinada com a equipe.',
    desde: 'ko',
  },
] as const satisfies readonly Integrante[]

export type IntegranteId = (typeof EQUIPE)[number]['id']

/** Selo dos papéis: vira 'validado' quando a equipe confirmar a distribuição. */
export const SELO_PAPEIS = 'validado' as const

/**
 * Quem já estava na equipe antes do Kick-off.
 *
 * É a lista que responde por tudo que aconteceu até aqui: o registro das
 * semanas 1 a 4, os papéis validados e a fala do pitch. Quem entrou depois
 * aparece na equipe e no que vem pela frente, nunca no passado.
 */
export const INTEGRANTES_FUNDADORES: readonly Integrante[] = (
  EQUIPE as readonly Integrante[]
).filter((integrante) => !integrante.desde)

/**
 * O nome curto, sem ambiguidade.
 *
 * Primeiro nome, que é como a equipe se chama. Mas a equipe tem DOIS Joões, e
 * "João" numa tabela de responsáveis não diz qual: vira crédito errado, que é
 * pior que crédito nenhum. Quando o primeiro nome se repete, entra o segundo.
 */
export function nomeCurto(id: IntegranteId): string {
  const partes = integrantePorId(id).nome.split(' ')
  const repetido = EQUIPE.filter((i) => i.nome.split(' ')[0] === partes[0]).length > 1
  return repetido ? partes.slice(0, 2).join(' ') : partes[0]
}

export function integrantePorId(id: IntegranteId): Integrante {
  const integrante = EQUIPE.find((i) => i.id === id)
  if (!integrante) throw new Error(`Integrante desconhecido: ${id}`)
  return integrante
}
