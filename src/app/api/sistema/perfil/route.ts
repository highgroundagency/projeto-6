import { NextResponse, type NextRequest } from 'next/server'
import { redirecionar } from '@/lib/http'
import { ehPerfilValido, exigeAutenticacao, NOME_COOKIE_PERFIL } from '@/lib/sistema'

/**
 * Troca o perfil ativo do seletor simulado (§8.1, fases 1–2).
 *
 * Não é autenticação: é uma preferência de navegação para demonstrar as quatro
 * visões do sistema. Por isso o cookie não é assinado nem httpOnly — e por isso
 * mesmo ele não protege nada.
 *
 * Com o Supabase configurado, esta rota deixa de existir: trocar de papel passa
 * a exigir trocar de conta, e o RBAC vira política de RLS no banco.
 */
export async function POST(requisicao: NextRequest) {
  if (exigeAutenticacao()) {
    return new NextResponse(null, { status: 404 })
  }

  const formulario = await requisicao.formData()
  const perfil = String(formulario.get('perfil') ?? '')
  const voltarPara = String(formulario.get('voltarPara') ?? '/sistema')

  const resposta = redirecionar(voltarPara.startsWith('/sistema') ? voltarPara : '/sistema')

  if (ehPerfilValido(perfil)) {
    resposta.cookies.set(NOME_COOKIE_PERFIL, perfil, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return resposta
}
