import 'server-only'
import { notFound } from 'next/navigation'
import {
  FEATURES,
  featurePorId,
  featuresDoPerfil,
  type Feature,
  type FeatureId,
  type PerfilId,
} from './features'
import { identidadeAtual, type Identidade } from './sistema/identidade'
import { obterVisao, type Visao } from './visao'

export {
  NOME_COOKIE_PERFIL,
  PERFIL_PADRAO,
  ehPerfilValido,
  identidadeAtual,
} from './sistema/identidade'
export type { Identidade } from './sistema/identidade'

/** Perfil ativo no seletor simulado. */
export async function perfilAtual(): Promise<PerfilId> {
  return (await identidadeAtual()).perfil
}

/** Funcionalidades que o release atual liberou para esta visão. */
export function featuresLiberadas(visao: Visao): Feature[] {
  return FEATURES.filter((feature) => visao.visiveis.includes(feature.ciclo))
}

/** Liberadas pelo release E dentro das atribuições do perfil: o que a pessoa usa. */
export function featuresDoPerfilAtual(visao: Visao, perfil: PerfilId): readonly Feature[] {
  return featuresDoPerfil(featuresLiberadas(visao), perfil)
}

export interface ContextoSistema {
  visao: Visao
  identidade: Identidade
  perfil: PerfilId
  feature: Feature
  /**
   * Pode operar controle que muda estado compartilhado (ADR-015).
   *
   * É a sessão de admin — a única credencial real do projeto; o perfil do
   * seletor é preferência de navegação e não serve para isso. Fica `false`
   * também no "ver como visitante", para que a prévia mostre exatamente o que o
   * visitante veria, controles inclusive.
   *
   * Não fecha tela nenhuma: o único gate que devolve 404 continua sendo o de
   * release, logo abaixo.
   */
  admin: boolean
}

/**
 * Portão de entrada de toda tela do sistema.
 *
 * Funcionalidade não liberada devolve 404 DE VERDADE (§6.2) — nada de tela de
 * "em breve", que entregaria de graça o roteiro do que vem por aí. A checagem
 * acontece antes de qualquer renderização.
 */
export async function exigirFeature(id: FeatureId): Promise<ContextoSistema> {
  const visao = await obterVisao()
  const feature = featurePorId(id)

  if (!visao.visiveis.includes(feature.ciclo)) notFound()

  const identidade = await identidadeAtual()
  return {
    visao,
    identidade,
    perfil: identidade.perfil,
    feature,
    admin: visao.admin && !visao.verComoVisitante,
  }
}

/**
 * O gate de release MAIS o gate de perfil.
 *
 * Até aqui o perfil era enfeite: ele sumia do menu e a tela continuava
 * respondendo 200 para quem digitasse a rota. O briefing pede perfis de acesso,
 * e acesso que a URL contorna não é acesso — é ordenação de menu.
 *
 * Também devolve 404, pela mesma razão do gate de release: um 403 confirmaria a
 * existência da tela para quem não deveria conhecê-la. Da porta, "não liberado
 * ainda" e "não é seu" são indistinguíveis, e é assim que deve ser.
 *
 * O seletor de perfil continua simulado (ADR-011): isto organiza a demonstração
 * de forma coerente, não substitui autenticação. O controle real está nas
 * políticas de RLS de `supabase/migrations/`.
 */
export async function exigirPerfil(id: FeatureId): Promise<ContextoSistema> {
  const contexto = await exigirFeature(id)
  if (!contexto.feature.perfis.includes(contexto.perfil)) notFound()
  return contexto
}
