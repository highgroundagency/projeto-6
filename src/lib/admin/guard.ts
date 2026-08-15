import 'server-only'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { NOME_COOKIE_SESSAO, obterSegredo, sessaoValida } from './sessao'

/**
 * Segunda camada: revalidação da sessão dentro da própria page/route handler.
 *
 * Não confie apenas no middleware. Se ele for contornado, esta função ainda
 * derruba a requisição — e derruba com 404, não 401, para não confirmar a
 * existência do painel a quem não deveria saber dele.
 */
export async function ehAdmin(): Promise<boolean> {
  let segredo: string
  try {
    segredo = obterSegredo()
  } catch {
    return false
  }
  const cookieStore = await cookies()
  return sessaoValida(cookieStore.get(NOME_COOKIE_SESSAO)?.value, segredo)
}

export async function exigirAdmin(): Promise<void> {
  if (!(await ehAdmin())) notFound()
}
