import type { CicloId } from './cronograma'

/**
 * Mapa de funcionalidades do sistema → ciclo em que cada uma é liberada (§6.2).
 *
 * Rota de funcionalidade não liberada retorna 404 de verdade — nunca uma tela
 * de "em breve", que entregaria de graça o roteiro do que vem por aí.
 */
export interface Feature {
  readonly id: string
  readonly ciclo: CicloId
  readonly rota: string
  readonly rotulo: string
  readonly descricao: string
  /** Perfis que enxergam a funcionalidade no menu do sistema. */
  readonly perfis: readonly PerfilId[]
}

export type PerfilId = 'cam' | 'area_tecnica' | 'gestor' | 'auditoria'

export const FEATURES = [
  {
    id: 'painel-cam',
    ciclo: 's5',
    rota: '/sistema/cam',
    rotulo: 'Dashboard da CAM',
    descricao: 'Quem já mandou os números do mês, quem falta, e o botão de avançar a etapa.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'indicadores',
    ciclo: 's5',
    rota: '/sistema/indicadores',
    rotulo: 'Indicadores e regras',
    descricao:
      'A lista do que é medido, com a meta e o peso de cada item, e a tabela de pontos.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'lancamento',
    ciclo: 's5',
    rota: '/sistema/lancamento',
    rotulo: 'Lançamento',
    descricao: 'Onde cada área digita os números do mês e diz de onde cada um veio.',
    perfis: ['area_tecnica', 'cam', 'auditoria'],
  },
  {
    id: 'meu-resultado',
    ciclo: 's6',
    rota: '/sistema/meu-resultado',
    rotulo: 'Meu resultado',
    descricao:
      'A nota do gestor, a conta inteira aberta e a comparação com os meses anteriores.',
    perfis: ['gestor', 'cam', 'auditoria'],
  },
  {
    id: 'auditoria',
    ciclo: 's7',
    rota: '/sistema/auditoria',
    rotulo: 'Auditoria',
    descricao: 'O histórico de tudo: quem fez o quê, quando, e como estava antes.',
    perfis: ['auditoria', 'cam'],
  },
  {
    id: 'painel-gestao',
    ciclo: 's9',
    rota: '/sistema/gestao',
    rotulo: 'Painel da gestão',
    descricao: 'O resumo geral: média, ranking das áreas e o botão de baixar a planilha.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'analytics',
    ciclo: 's10',
    rota: '/sistema/analytics',
    rotulo: 'Analytics',
    descricao: 'Sinais que ajudam a comissão a saber onde olhar. Nada aqui muda nota.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'contestacao',
    ciclo: 's11',
    rota: '/sistema/contestacao',
    rotulo: 'Contestação',
    descricao: 'Onde o gestor que discorda da nota pede revisão e acompanha a resposta.',
    perfis: ['gestor', 'cam', 'auditoria'],
  },
] as const satisfies readonly Feature[]

export type FeatureId = (typeof FEATURES)[number]['id']

export function featurePorId(id: FeatureId): Feature {
  const feature = FEATURES.find((f) => f.id === id)
  if (!feature) throw new Error(`Funcionalidade desconhecida: ${id}`)
  return feature
}

export function featurePorRota(rota: string): Feature | undefined {
  return FEATURES.find((f) => f.rota === rota)
}

/** Recorta uma lista de funcionalidades pelas atribuições de um perfil. */
export function featuresDoPerfil(
  features: readonly Feature[],
  perfil: PerfilId,
): readonly Feature[] {
  return features.filter((feature) => feature.perfis.includes(perfil))
}

/**
 * Os quatro papéis do processo (§8.1).
 *
 * `oQueVe` NÃO mora aqui de propósito: seria uma segunda lista para manter em
 * dia, e ela derivaria da mesma verdade que já está em `FEATURES.perfis`. A
 * interface calcula a lista na hora, e assim ela também respeita o gate de
 * release — descrever uma tela que ainda não saiu entregaria o roteiro do que
 * vem por aí, que é justamente o que o §6.2 proíbe.
 */
export interface Perfil {
  readonly rotulo: string
  /** Uma linha, para caber ao lado do seletor. */
  readonly descricao: string
  /** Quem é essa pessoa na SESAU, fora do software. */
  readonly quemE: string
  readonly oQueFaz: readonly string[]
  /** O que o processo impede, e por quê. É aqui que a regra do domínio aparece. */
  readonly oQueNaoPode: readonly string[]
}

export const ORDEM_PERFIS = [
  'cam',
  'area_tecnica',
  'gestor',
  'auditoria',
] as const satisfies readonly PerfilId[]

export const PERFIS: Record<PerfilId, Perfil> = {
  cam: {
    rotulo: 'CAM',
    descricao: 'A comissão que cuida do processo do começo ao fim.',
    quemE:
      'CAM quer dizer Comissão de Avaliação de Metas. É o grupo que cuida de todo o processo: define o que será medido, cobra os números, faz a conta e divulga o resultado.',
    oQueFaz: [
      'Cadastra o que vai ser medido: cada indicador, com a meta e o peso.',
      'Abre e fecha o prazo para as áreas informarem os números do mês.',
      'Faz a conta, aprova e divulga o resultado.',
      'Responde por escrito quem discordar da nota.',
    ],
    oQueNaoPode: [
      'Mudar uma regra que já foi usada num mês fechado. Mudança vira regra nova, e a antiga fica guardada.',
      'Pular etapa. O mês anda uma etapa por vez, e cada avanço fica anotado.',
      'Apagar o histórico. O que aconteceu fica registrado para sempre.',
    ],
  },
  area_tecnica: {
    rotulo: 'Área técnica',
    descricao: 'Quem informa os números da própria área, dentro do prazo.',
    quemE:
      'É o setor que produz o dado: a equipe que tem o número na mão, como a da vacinação ou a das consultas.',
    oQueFaz: [
      'Digita o valor de cada indicador da sua área, dentro do prazo.',
      'Diz de onde cada número veio: qual relatório, qual sistema.',
      'Corrige um valor errado antes do fechamento. O valor antigo fica guardado.',
    ],
    oQueNaoPode: [
      'Informar fora do prazo. Depois que o mês fecha, o campo trava.',
      'Mudar meta ou peso. Quem informa o resultado não escolhe a régua.',
      'Ver a nota dos gestores. A área entrega o número, não recebe nota.',
    ],
  },
  gestor: {
    rotulo: 'Gestor avaliado',
    descricao: 'Quem recebe a nota. Vê a própria conta e pode discordar.',
    quemE:
      'É a pessoa avaliada: o gestor cujo pagamento extra depende da nota. O sistema existe para que ela entenda e confie na própria nota.',
    oQueFaz: [
      'Vê a própria nota e a faixa de pagamento que ela dá.',
      'Abre a conta inteira e confere de onde veio cada número.',
      'Se discordar, pede revisão no prazo e recebe resposta por escrito.',
    ],
    oQueNaoPode: [
      'Mudar número. Discordar tem um caminho formal, não uma tela de edição.',
      'Ver a nota dos colegas pelo nome. O ranking com nomes é da gestão.',
      'Ter a nota decidida por robô. A conta segue sempre a mesma regra, aberta para conferir.',
    ],
  },
  auditoria: {
    rotulo: 'Auditoria',
    descricao: 'Vê tudo, não mexe em nada.',
    quemE:
      'É quem confere o processo de fora, como um fiscal: pode olhar tudo, e não muda nada.',
    oQueFaz: [
      'Lê o histórico completo: quem informou o quê, quando, e como estava antes.',
      'Refaz a conta de um mês fechado e confere se dá o mesmo resultado.',
      'Compara o resultado divulgado com a regra que valia naquele mês.',
    ],
    oQueNaoPode: [
      'Escrever qualquer coisa. Nenhuma tela dá botão de ação a este perfil, de propósito.',
      'Ficar sem ver algo. É o único papel que enxerga todas as telas.',
    ],
  },
}
