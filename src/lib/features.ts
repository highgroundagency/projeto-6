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

export const PERFIS: Record<PerfilId, { rotulo: string; descricao: string }> = {
  cam: {
    rotulo: 'CAM',
    descricao: 'Comissão de Avaliação de Metas: gere ciclos, regras e homologação.',
  },
  area_tecnica: {
    rotulo: 'Área técnica',
    descricao: 'Lança e edita os indicadores da própria área dentro do prazo.',
  },
  gestor: {
    rotulo: 'Gestor avaliado',
    descricao: 'Consulta o próprio resultado, a memória de cálculo e contesta.',
  },
  auditoria: {
    rotulo: 'Auditoria',
    descricao: 'Vê tudo, edita nada.',
  },
}
