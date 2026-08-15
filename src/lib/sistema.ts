import 'server-only'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { FEATURES, featurePorId, type Feature, type FeatureId, type PerfilId } from './features'
import { obterVisao, type Visao } from './visao'

export const NOME_COOKIE_PERFIL = 'prumo_perfil'
export const PERFIL_PADRAO: PerfilId = 'cam'

const PERFIS_VALIDOS: readonly PerfilId[] = ['cam', 'area_tecnica', 'gestor', 'auditoria']

/**
 * Perfil ativo no seletor (§8.1).
 *
 * Nas fases 1–2 o login é SIMULADO: o perfil é uma preferência de navegação em
 * cookie, sem autenticação e sem valor de segurança. Na F3 o Supabase Auth com
 * RLS assume, e o perfil passa a vir da sessão do usuário — o RBAC do §8.1 vira
 * política no banco. Está documentado assim em docs/seguranca.md para que
 * ninguém confunda demonstração com controle de acesso.
 */
export async function perfilAtual(): Promise<PerfilId> {
  const cookieStore = await cookies()
  const bruto = cookieStore.get(NOME_COOKIE_PERFIL)?.value as PerfilId | undefined
  return bruto && PERFIS_VALIDOS.includes(bruto) ? bruto : PERFIL_PADRAO
}

export function ehPerfilValido(valor: string): valor is PerfilId {
  return PERFIS_VALIDOS.includes(valor as PerfilId)
}

/** Funcionalidades que o release atual liberou para esta visão. */
export function featuresLiberadas(visao: Visao): Feature[] {
  return FEATURES.filter((feature) => visao.visiveis.includes(feature.ciclo))
}

export interface ContextoSistema {
  visao: Visao
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

  return { visao, perfil: await perfilAtual(), feature }
}
