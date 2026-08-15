import { NextResponse, type NextRequest } from 'next/server'
import { NOME_COOKIE_SESSAO, obterSegredo, sessaoValida } from '@/lib/admin/sessao'
import { redirecionarNoMiddleware } from '@/lib/http'

/**
 * Primeira camada de proteção do painel (§7.1).
 *
 * DEFESA EM PROFUNDIDADE: o middleware é uma barreira, não A barreira. Toda
 * page e route handler de `/admin` revalida a sessão no servidor por conta
 * própria (`exigirAdmin`), porque middleware sozinho já foi contornável em
 * versões do Next. Ver docs/seguranca.md.
 */

const ROTAS_LIVRES = ['/admin/entrar', '/api/admin/entrar', '/api/admin/sair']

export async function middleware(requisicao: NextRequest) {
  const { pathname } = requisicao.nextUrl

  if (ROTAS_LIVRES.some((rota) => pathname === rota)) {
    return NextResponse.next()
  }

  let segredo: string
  try {
    segredo = obterSegredo()
  } catch {
    // Produção sem ADMIN_COOKIE_SECRET: o painel simplesmente não existe.
    return new NextResponse(null, { status: 404 })
  }

  const token = requisicao.cookies.get(NOME_COOKIE_SESSAO)?.value
  if (await sessaoValida(token, segredo)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 })
  }

  return redirecionarNoMiddleware(requisicao, '/admin/entrar')
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
