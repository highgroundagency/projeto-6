import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { lerConfiguracao } from './cliente'

/**
 * Renovação da sessão do Supabase no middleware.
 *
 * O token de acesso expira em minutos. Server Components não podem gravar
 * cookie, então, sem esta passagem, a sessão morreria e o usuário seria
 * deslogado no meio do uso. O middleware pode gravar — é o único lugar do
 * fluxo onde a renovação cabe.
 *
 * `getUser()` (e não `getSession()`) é intencional: ele valida o token contra
 * o servidor do Supabase em vez de confiar no que veio no cookie.
 */
export async function atualizarSessao(requisicao: NextRequest): Promise<NextResponse> {
  const configuracao = lerConfiguracao()
  if (!configuracao) return NextResponse.next()

  let resposta = NextResponse.next({ request: requisicao })

  const supabase = createServerClient(configuracao.url, configuracao.chaveAnonima, {
    cookies: {
      getAll() {
        return requisicao.cookies.getAll()
      },
      setAll(paraGravar) {
        for (const { name, value } of paraGravar) {
          requisicao.cookies.set(name, value)
        }
        resposta = NextResponse.next({ request: requisicao })
        for (const { name, value, options } of paraGravar) {
          resposta.cookies.set(name, value, options)
        }
      },
    },
  })

  await supabase.auth.getUser()

  return resposta
}
