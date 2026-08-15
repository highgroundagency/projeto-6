import { redirecionar } from '@/lib/http'
import { NOME_COOKIE_PERFIL } from '@/lib/sistema'
import { clienteDaSessao, supabaseConfigurado } from '@/lib/supabase/cliente'

export async function POST() {
  if (supabaseConfigurado()) {
    const supabase = await clienteDaSessao()
    await supabase.auth.signOut()
  }

  const resposta = redirecionar('/sistema')
  resposta.cookies.delete(NOME_COOKIE_PERFIL)
  return resposta
}
