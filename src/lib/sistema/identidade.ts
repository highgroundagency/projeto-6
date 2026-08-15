import 'server-only'
import { cookies } from 'next/headers'
import type { PerfilId } from '@/lib/features'

export const NOME_COOKIE_PERFIL = 'prumo_perfil'
export const PERFIL_PADRAO: PerfilId = 'cam'

const PERFIS_VALIDOS: readonly PerfilId[] = ['cam', 'area_tecnica', 'gestor', 'auditoria']

export function ehPerfilValido(valor: string): valor is PerfilId {
  return PERFIS_VALIDOS.includes(valor as PerfilId)
}

/**
 * Quem está usando o sistema.
 *
 * LOGIN SIMULADO, e isso é dito em voz alta na própria tela: o perfil vem de um
 * cookie escolhido no seletor, sem autenticação, e não protege nada. Existe
 * para demonstrar as quatro visões do §8.1 sem exigir credencial — que é o que
 * uma banca de cinco minutos precisa.
 *
 * O RBAC de verdade está escrito e testado em `supabase/migrations/`, como
 * políticas de RLS. Ele não está ligado ao app: ver docs/decisoes.md (ADR-015)
 * e docs/seguranca.md.
 */
export interface Identidade {
  perfil: PerfilId
  nome: string
  areaId: string | null
  gestorId: string | null
  /** Sempre true nesta versão: o perfil vem do seletor, não de uma sessão. */
  simulada: boolean
}

export async function identidadeAtual(): Promise<Identidade> {
  const armazem = await cookies()
  const bruto = armazem.get(NOME_COOKIE_PERFIL)?.value
  const perfil = bruto && ehPerfilValido(bruto) ? bruto : PERFIL_PADRAO

  return {
    perfil,
    nome: 'Perfil simulado',
    areaId: null,
    gestorId: null,
    simulada: true,
  }
}
