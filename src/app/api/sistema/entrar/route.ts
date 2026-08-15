import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { comParametros, redirecionar } from '@/lib/http'
import { clienteDaSessao, supabaseConfigurado } from '@/lib/supabase/cliente'

/**
 * Login do sistema via Supabase Auth (F3).
 *
 * A senha nunca é comparada aqui: quem valida é o Supabase, e o que volta é uma
 * sessão gravada em cookie httpOnly pelo `@supabase/ssr`. A partir daí, toda
 * consulta carrega o JWT e cai nas políticas de RLS.
 */
const corpoSchema = z.object({
  email: z.email().max(320),
  senha: z.string().min(1).max(200),
  destino: z.string().max(200).optional(),
})

export async function POST(requisicao: NextRequest) {
  if (!supabaseConfigurado()) {
    return new Response(null, { status: 404 })
  }

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({
    email: formulario.get('email'),
    senha: formulario.get('senha'),
    destino: formulario.get('destino') ?? undefined,
  })

  // Mensagem genérica: não distinguir "e-mail não existe" de "senha errada"
  // evita transformar o login num verificador de contas.
  const recusa = comParametros('/sistema/entrar', {
    erro: 'Não foi possível entrar. Confira o e-mail e a senha.',
    destino: String(formulario.get('destino') ?? ''),
  })

  if (!analisado.success) return redirecionar(recusa)

  const supabase = await clienteDaSessao()
  const { error } = await supabase.auth.signInWithPassword({
    email: analisado.data.email,
    password: analisado.data.senha,
  })

  if (error) return redirecionar(recusa)

  const destino = analisado.data.destino?.startsWith('/sistema')
    ? analisado.data.destino
    : '/sistema'

  return redirecionar(destino)
}
