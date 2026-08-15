import 'server-only'
import { notFound, redirect } from 'next/navigation'
import { FEATURES, featurePorId, type Feature, type FeatureId, type PerfilId } from './features'
import { exigeAutenticacao, identidadeAtual, type Identidade } from './sistema/identidade'
import { obterVisao, type Visao } from './visao'

export {
  NOME_COOKIE_PERFIL,
  PERFIL_PADRAO,
  ehPerfilValido,
  identidadeAtual,
  exigeAutenticacao,
} from './sistema/identidade'
export type { Identidade } from './sistema/identidade'

/** Perfil ativo, venha ele do seletor simulado ou do Supabase Auth. */
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
 * Duas checagens, nesta ordem:
 *
 * 1. RELEASE — funcionalidade não liberada devolve 404 DE VERDADE (§6.2). Nada
 *    de tela "em breve", que entregaria de graça o roteiro do que vem por aí.
 * 2. IDENTIDADE — com Supabase configurado, sem sessão não se entra. No modo
 *    seed, o seletor de perfil basta, e a tela deixa isso explícito.
 */
export async function exigirFeature(id: FeatureId): Promise<ContextoSistema> {
  const visao = await obterVisao()
  const feature = featurePorId(id)

  if (!visao.visiveis.includes(feature.ciclo)) notFound()

  const identidade = await identidadeAtual()

  if (exigeAutenticacao() && !identidade.autenticada) {
    redirect(`/sistema/entrar?destino=${encodeURIComponent(feature.rota)}`)
  }

  return { visao, identidade, perfil: identidade.perfil, feature }
}
