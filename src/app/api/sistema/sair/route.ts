import { opcoesCookieSessaoSistema } from '@/lib/auth/sessao'
import { NOME_COOKIE_SESSAO_SISTEMA } from '@/lib/auth/servico'
import { redirecionar } from '@/lib/http'

/**
 * Sair: apaga o cookie. POST, e não GET, para que uma imagem ou link de outro
 * site não derrube a sessão de ninguém.
 */
export async function POST() {
  const resposta = redirecionar('/sistema')
  resposta.cookies.set(NOME_COOKIE_SESSAO_SISTEMA, '', { ...opcoesCookieSessaoSistema(), maxAge: 0 })
  return resposta
}
