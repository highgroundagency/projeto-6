import 'server-only'
import { cookies } from 'next/headers'
import { usuarioAtual } from '@/lib/auth/sessao'
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
 * Quem está usando o sistema. Dois modos (ADR-051):
 *
 * - COM LOGIN: a conta vem do cookie de sessão cifrado, conferido no banco a
 *   cada requisição (`src/lib/auth/`). Perfil e vínculo vêm do banco; o seletor
 *   some. É o único modo que escreve.
 * - VISITANTE: sem login, o perfil vem do seletor, como sempre foi, e serve
 *   para navegar as quatro visões do §8.1. Não protege nada e por isso NÃO
 *   ESCREVE: as rotas de escrita exigem `autenticada`.
 */
export interface Identidade {
  perfil: PerfilId
  nome: string
  /**
   * Vínculos da conta. `null` para visitante e para SEAB e administrador. Com
   * login de gerente, "meu resultado", lançamento e contestação abrem na
   * própria unidade (ou no próprio distrito), e as rotas de escrita recusam
   * qualquer outra.
   */
  gerenteId: string | null
  unidadeId: string | null
  distritoId: string | null
  /** true no modo visitante: o perfil veio do seletor, não de uma conta. */
  simulada: boolean
  /** true quando há sessão válida. Só quem está autenticado escreve. */
  autenticada: boolean
  /** Login da conta, quando há sessão. */
  login: string | null
}

export async function identidadeAtual(): Promise<Identidade> {
  const usuario = await usuarioAtual()
  if (usuario) {
    return {
      perfil: usuario.perfil,
      nome: usuario.login,
      gerenteId: usuario.gerenteId,
      unidadeId: usuario.unidadeId,
      distritoId: usuario.distritoId,
      simulada: false,
      autenticada: true,
      login: usuario.login,
    }
  }

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
    autenticada: false,
    login: null,
  }
}
