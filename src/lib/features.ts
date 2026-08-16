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
    descricao: 'Funil por área, pendências e avanço de estado do ciclo.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'indicadores',
    ciclo: 's5',
    rota: '/sistema/indicadores',
    rotulo: 'Indicadores e regras',
    descricao: 'Cadastro de indicadores e regras de pontuação versionadas.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'lancamento',
    ciclo: 's5',
    rota: '/sistema/lancamento',
    rotulo: 'Lançamento',
    descricao: 'Área técnica informa os valores dos indicadores no prazo.',
    perfis: ['area_tecnica', 'cam', 'auditoria'],
  },
  {
    id: 'meu-resultado',
    ciclo: 's6',
    rota: '/sistema/meu-resultado',
    rotulo: 'Meu resultado',
    descricao: 'Score, faixa, evolução e memória de cálculo do gestor avaliado.',
    perfis: ['gestor', 'cam', 'auditoria'],
  },
  {
    id: 'auditoria',
    ciclo: 's7',
    rota: '/sistema/auditoria',
    rotulo: 'Auditoria',
    descricao: 'Linha do tempo imutável de tudo que aconteceu no ciclo.',
    perfis: ['auditoria', 'cam'],
  },
  {
    id: 'painel-gestao',
    ciclo: 's9',
    rota: '/sistema/gestao',
    rotulo: 'Painel da gestão',
    descricao: 'Agregados por área, ranking anonimizável e exportação em CSV.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'analytics',
    ciclo: 's10',
    rota: '/sistema/analytics',
    rotulo: 'Analytics',
    descricao: 'Resultados dos modelos de ML com o método declarado ao lado.',
    perfis: ['cam', 'auditoria'],
  },
  {
    id: 'contestacao',
    ciclo: 's11',
    rota: '/sistema/contestacao',
    rotulo: 'Contestação',
    descricao: 'Gestor avaliado abre e acompanha contestação do resultado.',
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
    descricao: 'Comissão de Avaliação de Metas: gere ciclos, regras e homologação.',
    quemE:
      'Comissão de Avaliação de Metas: o colegiado que conduz o ciclo do começo ao fim, do cadastro da regra à publicação do resultado.',
    oQueFaz: [
      'Cadastra indicadores com meta, peso, unidade e fonte, e publica a regra que transforma atingimento em pontos.',
      'Abre e fecha a janela de lançamento, e acompanha o funil de quais áreas já informaram.',
      'Apura o ciclo, homologa e publica o resultado.',
      'Recebe as contestações e responde por escrito.',
    ],
    oQueNaoPode: [
      'Editar uma regra já usada num ciclo homologado. Alterar cria versão nova, senão o ciclo antigo deixaria de reproduzir o próprio número.',
      'Pular estado do ciclo. A máquina anda um passo por vez, e cada passagem entra na trilha.',
      'Apagar evento da auditoria. A trilha só recebe, nunca perde.',
    ],
  },
  area_tecnica: {
    rotulo: 'Área técnica',
    descricao: 'Lança e edita os indicadores da própria área dentro do prazo.',
    quemE:
      'A unidade que produz o dado: a diretoria ou coordenação dona daquele indicador, quem tem o número na mão.',
    oQueFaz: [
      'Informa o valor de cada indicador da própria área dentro da janela do ciclo.',
      'Declara a evidência que sustenta o número, de onde ele veio.',
      'Corrige um valor errado antes do fechamento, e a correção entra como versão nova.',
    ],
    oQueNaoPode: [
      'Lançar fora da janela. Passado o prazo, o campo fecha e a tentativa fica registrada.',
      'Alterar meta ou peso. Quem informa o resultado não define a régua.',
      'Ver o score de gestor nenhum. A área entrega insumo, não recebe avaliação.',
    ],
  },
  gestor: {
    rotulo: 'Gestor avaliado',
    descricao: 'Consulta o próprio resultado, a memória de cálculo e contesta.',
    quemE:
      'O servidor cuja gratificação depende do desempenho apurado. É por ele que este sistema existe.',
    oQueFaz: [
      'Consulta o próprio score, a faixa alcançada e a evolução entre ciclos.',
      'Abre a memória de cálculo e segue cada número até o lançamento que o gerou.',
      'Contesta o resultado no prazo, e recebe resposta escrita da comissão.',
    ],
    oQueNaoPode: [
      'Alterar lançamento. Discordar é um caminho formal, não uma edição.',
      'Ver o ranking nominal dos colegas. O painel da gestão é da gestão.',
      'Ter o resultado decidido por modelo. O cálculo é determinístico e a conta fica aberta (art. 20 da LGPD).',
    ],
  },
  auditoria: {
    rotulo: 'Auditoria',
    descricao: 'Vê tudo, edita nada.',
    quemE:
      'Controle interno, ou qualquer pessoa que precise conferir o processo sem participar dele.',
    oQueFaz: [
      'Percorre a trilha append-only e vê quem informou o quê, quando, e qual era o valor anterior.',
      'Refaz o cálculo de um ciclo homologado e confere se dá o mesmo número.',
      'Cruza o resultado publicado com a regra vigente na competência.',
    ],
    oQueNaoPode: [
      'Escrever coisa alguma. Nenhuma tela oferece ação a este perfil, por desenho.',
      'Ser impedida de ver. É o único papel que enxerga as oito telas.',
    ],
  },
}
