import 'server-only'
import { cookies } from 'next/headers'
import type { PerfilId } from '@/lib/features'
import { clienteDaSessao, supabaseConfigurado } from '@/lib/supabase/cliente'
import type { LinhaUsuario } from '@/lib/supabase/tipos'

export const NOME_COOKIE_PERFIL = 'prumo_perfil'
export const PERFIL_PADRAO: PerfilId = 'cam'

const PERFIS_VALIDOS: readonly PerfilId[] = ['cam', 'area_tecnica', 'gestor', 'auditoria']

export function ehPerfilValido(valor: string): valor is PerfilId {
  return PERFIS_VALIDOS.includes(valor as PerfilId)
}

/**
 * Quem está usando o sistema.
 *
 * Duas origens possíveis, e a diferença entre elas é de segurança, não de
 * conveniência:
 *
 * - `simulada`: o perfil vem de um cookie escolhido no seletor. Não é
 *   autenticação e não protege nada — existe para demonstrar as quatro visões
 *   sem exigir credencial. É o modo das fases 1–2.
 *
 * - `autenticada`: o perfil vem da tabela `usuarios`, vinculada ao usuário do
 *   Supabase Auth. Aqui o RBAC é real: as políticas de RLS filtram no banco, e
 *   nem a aplicação consegue passar por cima.
 */
export interface Identidade {
  perfil: PerfilId
  nome: string
  areaId: string | null
  gestorId: string | null
  /** true quando há sessão do Supabase Auth por trás. */
  autenticada: boolean
  /** true quando o perfil veio do seletor, sem autenticação. */
  simulada: boolean
  /** e-mail da sessão, quando autenticada. */
  email: string | null
}

function identidadeSimulada(perfil: PerfilId): Identidade {
  return {
    perfil,
    nome: 'Perfil simulado',
    areaId: null,
    gestorId: null,
    autenticada: false,
    simulada: true,
    email: null,
  }
}

async function perfilDoCookie(): Promise<PerfilId> {
  const armazem = await cookies()
  const bruto = armazem.get(NOME_COOKIE_PERFIL)?.value
  return bruto && ehPerfilValido(bruto) ? bruto : PERFIL_PADRAO
}

export async function identidadeAtual(): Promise<Identidade> {
  if (!supabaseConfigurado()) {
    return identidadeSimulada(await perfilDoCookie())
  }

  const supabase = await clienteDaSessao()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Supabase configurado e ninguém logado: identidade anônima. Quem decide o
    // que fazer com isso é o gate da tela, não esta função.
    return {
      perfil: PERFIL_PADRAO,
      nome: 'Visitante',
      areaId: null,
      gestorId: null,
      autenticada: false,
      simulada: false,
      email: null,
    }
  }

  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<LinhaUsuario>()

  if (!data) {
    // Autenticado no Supabase, mas sem vínculo no processo: sem perfil, sem
    // acesso. Falha fechado em vez de assumir um papel qualquer.
    return {
      perfil: PERFIL_PADRAO,
      nome: user.email ?? 'Sem vínculo',
      areaId: null,
      gestorId: null,
      autenticada: false,
      simulada: false,
      email: user.email ?? null,
    }
  }

  return {
    perfil: data.perfil,
    nome: data.nome,
    areaId: data.area_id,
    gestorId: data.gestor_id,
    autenticada: true,
    simulada: false,
    email: user.email ?? null,
  }
}

/** true quando o sistema exige login de verdade (Supabase configurado). */
export function exigeAutenticacao(): boolean {
  return supabaseConfigurado()
}
