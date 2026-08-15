import { NextResponse, type NextRequest } from 'next/server'
import { ehPerfilValido, NOME_COOKIE_PERFIL } from '@/lib/sistema'

/**
 * Troca o perfil ativo do seletor simulado (§8.1, fases 1–2).
 *
 * Não é autenticação: é uma preferência de navegação para demonstrar as quatro
 * visões do sistema. Por isso o cookie não é assinado nem httpOnly — e por isso
 * mesmo ele não protege nada. Na F3, quem manda é o Supabase Auth com RLS.
 */
export async function POST(requisicao: NextRequest) {
  const formulario = await requisicao.formData()
  const perfil = String(formulario.get('perfil') ?? '')
  const voltarPara = String(formulario.get('voltarPara') ?? '/sistema')

  const destino = requisicao.nextUrl.clone()
  destino.pathname = voltarPara.startsWith('/sistema') ? voltarPara : '/sistema'
  destino.search = ''

  const resposta = NextResponse.redirect(destino, 303)

  if (ehPerfilValido(perfil)) {
    resposta.cookies.set(NOME_COOKIE_PERFIL, perfil, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return resposta
}
