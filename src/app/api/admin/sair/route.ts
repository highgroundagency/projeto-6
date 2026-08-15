import { NextResponse, type NextRequest } from 'next/server'
import { NOME_COOKIE_SESSAO, NOME_COOKIE_VISAO } from '@/lib/admin/sessao'

export async function POST(requisicao: NextRequest) {
  const destino = requisicao.nextUrl.clone()
  destino.pathname = '/'
  destino.search = ''

  const resposta = NextResponse.redirect(destino, 303)
  resposta.cookies.delete(NOME_COOKIE_SESSAO)
  resposta.cookies.delete(NOME_COOKIE_VISAO)
  return resposta
}
