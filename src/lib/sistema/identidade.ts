import 'server-only'
import { cookies } from 'next/headers'
import { PERFIL_PADRAO, type PerfilId } from '@/lib/features'

export { PERFIL_PADRAO }
export const NOME_COOKIE_PERFIL = 'prumo_perfil'

const PERFIS_VALIDOS: readonly PerfilId[] = [
  'seab',
  'administrador',
  'gerente_distrital',
  'gerente_unidade',
]

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
 * políticas de RLS (ainda no domínio anterior; pendência em docs/banco.md).
 * Ver docs/decisoes.md (ADR-011) e docs/seguranca.md.
 */
export interface Identidade {
  perfil: PerfilId
  nome: string
  /**
   * Vínculos da sessão. Hoje sempre `null`, e é de propósito: é a costura por
   * onde o login de verdade entra. Quando existir sessão, "meu resultado" abre
   * na própria unidade (ou no próprio distrito) em vez de na primeira da
   * lista, sem que a tela precise mudar.
   */
  gerenteId: string | null
  unidadeId: string | null
  distritoId: string | null
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
    gerenteId: null,
    unidadeId: null,
    distritoId: null,
    simulada: true,
  }
}
