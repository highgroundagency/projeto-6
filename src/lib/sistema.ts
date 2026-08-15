import 'server-only'
import { notFound } from 'next/navigation'
import { FEATURES, featurePorId, type Feature, type FeatureId, type PerfilId } from './features'
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

export interface ContextoSistema {
  visao: Visao
  identidade: Identidade
  perfil: PerfilId
  feature: Feature
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
  return { visao, identidade, perfil: identidade.perfil, feature }
}
