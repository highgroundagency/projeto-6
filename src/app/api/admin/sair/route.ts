import { NOME_COOKIE_SESSAO, NOME_COOKIE_VISAO } from '@/lib/admin/sessao'
import { redirecionar } from '@/lib/http'

export async function POST() {
  const resposta = redirecionar('/')
  resposta.cookies.delete(NOME_COOKIE_SESSAO)
  resposta.cookies.delete(NOME_COOKIE_VISAO)
  return resposta
}
