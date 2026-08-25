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

/**
 * Os quatro atores que o CLIENTE nomeou na reunião de 22/08 (ADR-034):
 * coordenação da SEAB, administrador da plataforma, gerente distrital e
 * gerente de unidade. O perfil "auditoria" saiu; a TELA de trilha ficou, com
 * o administrador e a SEAB.
 */
export type PerfilId = 'seab' | 'administrador' | 'gerente_distrital' | 'gerente_unidade'

export const FEATURES = [
  {
    id: 'painel-seab',
    ciclo: 's5',
    // A rota histórica continua: links antigos redirecionam (ADR-023).
    rota: '/sistema/cam',
    rotulo: 'Painel da SEAB',
    descricao:
      'Quem já mandou os números do mês, quem falta, e o botão de avançar a etapa.',
    perfis: ['seab', 'administrador'],
  },
  {
    id: 'indicadores',
    ciclo: 's5',
    rota: '/sistema/indicadores',
    rotulo: 'Indicadores e regras',
    descricao:
      'O catálogo do que é medido, os subindicadores que compõem cada item e a régua por tipo de unidade.',
    perfis: ['administrador', 'seab'],
  },
  {
    id: 'lancamento',
    ciclo: 's5',
    rota: '/sistema/lancamento',
    rotulo: 'Lançamento da unidade',
    descricao:
      'Onde a unidade preenche os subindicadores do mês e diz de onde cada número veio.',
    perfis: ['gerente_unidade', 'gerente_distrital', 'seab'],
  },
  {
    id: 'meu-resultado',
    ciclo: 's6',
    rota: '/sistema/meu-resultado',
    rotulo: 'Meu resultado',
    descricao:
      'A nota da unidade ou do distrito, a conta inteira aberta e a comparação com os meses anteriores.',
    perfis: ['gerente_unidade', 'gerente_distrital', 'seab'],
  },
  {
    id: 'auditoria',
    ciclo: 's7',
    rota: '/sistema/auditoria',
    rotulo: 'Trilha de auditoria',
    descricao: 'O histórico de tudo: quem fez o quê, quando, e como estava antes.',
    perfis: ['administrador', 'seab'],
  },
  {
    id: 'painel-gestao',
    ciclo: 's9',
    rota: '/sistema/gestao',
    rotulo: 'Painel da gestão',
    descricao:
      'O resumo geral: média, ranking das unidades por distrito e o botão de baixar a planilha.',
    perfis: ['seab', 'administrador', 'gerente_distrital'],
  },
  {
    id: 'analytics',
    ciclo: 's10',
    rota: '/sistema/analytics',
    rotulo: 'Analytics',
    descricao: 'Sinais que ajudam a SEAB a saber onde olhar. Nada aqui muda nota.',
    perfis: ['seab', 'administrador'],
  },
  {
    id: 'contestacao',
    ciclo: 's11',
    rota: '/sistema/contestacao',
    rotulo: 'Contestação',
    descricao: 'Onde o gerente que discorda da nota pede revisão e acompanha a resposta.',
    perfis: ['gerente_unidade', 'gerente_distrital', 'seab'],
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
 * Os quatro papéis do processo (§8.1), com os nomes que o cliente usa.
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
  'seab',
  'administrador',
  'gerente_distrital',
  'gerente_unidade',
] as const satisfies readonly PerfilId[]

export const PERFIS: Record<PerfilId, Perfil> = {
  seab: {
    rotulo: 'Coordenação da SEAB',
    descricao: 'Quem coordena o processo do começo ao fim.',
    quemE:
      'A SEAB é a secretaria executiva que coordena a avaliação. É quem define o que será medido em cada tipo de unidade, cobra os números, faz a conta e divulga o resultado.',
    oQueFaz: [
      'Cadastra a régua: indicadores, subindicadores, e a meta e o peso de cada tipo de unidade.',
      'Abre e fecha o prazo para as unidades informarem os números do mês.',
      'Faz a conta, homologa e divulga o resultado das unidades e dos distritos.',
      'Responde por escrito quem discordar da nota.',
    ],
    oQueNaoPode: [
      'Mudar uma regra que já foi usada num mês fechado. Mudança vira regra nova, e a antiga fica guardada.',
      'Pular etapa. O mês anda uma etapa por vez, e cada avanço fica anotado.',
      'Apagar o histórico. O que aconteceu fica registrado para sempre.',
    ],
  },
  administrador: {
    rotulo: 'Administrador',
    descricao: 'Cuida da plataforma: cadastros, acessos e a trilha.',
    quemE:
      'É quem opera a plataforma por dentro: mantém cadastros e acessos em ordem e confere a trilha de auditoria. Administra a ferramenta, não as notas.',
    oQueFaz: [
      'Mantém os cadastros da rede: distritos, tipos de unidade, unidades e gerentes.',
      'Acompanha a trilha de auditoria completa, com o antes e o depois de cada mudança.',
      'Confere os painéis para dar suporte a quem usa o sistema.',
    ],
    oQueNaoPode: [
      'Informar número por uma unidade. Quem lança é quem tem o dado na mão.',
      'Mudar nota, meta ou peso. A régua é da SEAB, e versão antiga fica guardada.',
      'Apagar ou editar o histórico. A trilha só cresce, nunca encolhe.',
    ],
  },
  gerente_distrital: {
    rotulo: 'Gerente distrital',
    descricao: 'Responde pelo distrito: acompanha as unidades e revisa números.',
    quemE:
      'Cada distrito sanitário tem uma gerência que acompanha as unidades dele. Ela também é avaliada: a nota do distrito é a média das notas das suas unidades.',
    oQueFaz: [
      'Acompanha o painel do próprio distrito, unidade por unidade.',
      'Revisa e corrige lançamentos das unidades na janela de revisão, os dias finais do prazo.',
      'Vê a própria nota, que é a média do distrito, e abre contestação se discordar.',
    ],
    oQueNaoPode: [
      'Ver o recorte de outro distrito. Cada gerência enxerga o seu.',
      'Mudar meta ou peso. Quem informa o resultado não escolhe a régua.',
      'Alterar número fora da janela. Depois que o mês fecha, o campo trava.',
    ],
  },
  gerente_unidade: {
    rotulo: 'Gerente de unidade',
    descricao: 'Preenche os subindicadores da unidade e recebe a nota dela.',
    quemE:
      'É quem dirige uma unidade de saúde: USF, CAPS, UPA ou policlínica. Preenche os subindicadores do mês e responde pela nota da unidade, que depende do tipo dela.',
    oQueFaz: [
      'Preenche cada subindicador da unidade, no prazo: valor direto, ou numerador e denominador.',
      'Diz de onde cada número veio: qual relatório, qual sistema.',
      'Corrige um valor na janela de revisão. O valor antigo fica guardado.',
      'Vê a nota da unidade com a conta aberta, e pede revisão se discordar.',
    ],
    oQueNaoPode: [
      'Lançar por outra unidade. Cada uma responde pelos próprios números.',
      'Mudar meta ou peso. A régua do tipo da unidade vem da regra vigente.',
      'Ter a nota decidida por robô. A conta segue sempre a mesma regra, aberta para conferir.',
    ],
  },
}
