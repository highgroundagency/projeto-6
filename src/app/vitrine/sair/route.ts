import { redirecionar } from '@/lib/http'
import { NOME_COOKIE_VITRINE, opcoesCookieVitrine } from '@/lib/vitrine-pessoal'

/**
 * Fecha a vitrine pessoal deste navegador.
 *
 * Rota estática vence a dinâmica `[chave]`, então "sair" nunca é tratado como
 * tentativa de chave. Sem cookie, é só um redirecionamento inofensivo.
 */
export async function GET() {
  const resposta = redirecionar('/')
  resposta.cookies.set(NOME_COOKIE_VITRINE, '', { ...opcoesCookieVitrine(), maxAge: 0 })
  return resposta
}
