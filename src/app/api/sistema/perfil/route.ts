import { type NextRequest } from 'next/server'
import { redirecionar } from '@/lib/http'
import { ehPerfilValido, NOME_COOKIE_PERFIL } from '@/lib/sistema'

/**
 * Troca o perfil ativo do seletor simulado (§8.1, fases 1–2).
 *
 * Não é autenticação: é uma preferência de navegação para demonstrar as quatro
 * visões do sistema. Por isso o cookie não é assinado nem httpOnly — e por isso
 * mesmo ele não protege nada. O RBAC de verdade está em
 * `supabase/migrations/` como políticas de RLS, escrito e testado, mas não
 * ligado ao app — ver docs/decisoes.md (ADR-015).
 */
export async function POST(requisicao: NextRequest) {
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
