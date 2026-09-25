import 'server-only'
import { cookies } from 'next/headers'

/**
 * Quem está escrevendo no protótipo: um id aleatório por navegador.
 *
 * Existe para cada visitante lançar numa CÓPIA PRÓPRIA do estado (ver
 * `estado.ts`). Antes a escrita era uma só para todo mundo: um avaliador que
 * lançasse um número mudava a tela do outro, no meio da banca.
 *
 * O id não dá privilégio nenhum. Ele só diz em qual cópia a escrita cai, e
 * quem troca o cookie cai numa cópia vazia, não na de outra pessoa (o espaço de
 * ids é grande demais para adivinhar). Por isso ele não é assinado. É
 * `httpOnly` porque nenhum script precisa dele, e `secure` em produção, como o
 * cookie de sessão do admin.
 *
 * Sem `maxAge`: é cookie de sessão do navegador. A cópia a que ele aponta vive
 * na memória do servidor e some quando o processo reinicia, de qualquer jeito.
 */
export const NOME_COOKIE_VISITANTE = 'prumo_visitante'

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function ehIdDeVisitante(valor: string | null | undefined): valor is string {
  return typeof valor === 'string' && FORMATO_UUID.test(valor)
}

export function opcoesCookieVisitante(producao = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax' as const,
    path: '/',
  }
}

/** O visitante desta requisição, ou `null` se ele ainda não escreveu nada. */
export async function visitanteAtual(): Promise<string | null> {
  const armazem = await cookies()
  const bruto = armazem.get(NOME_COOKIE_VISITANTE)?.value
  return ehIdDeVisitante(bruto) ? bruto : null
}

/**
 * O visitante desta requisição, criado na hora se ainda não existe.
 *
 * SÓ EM ROUTE HANDLER (ou server action): é o único lugar em que o Next deixa
 * gravar cookie. Quem lê depois, na mesma requisição, já enxerga o id novo,
 * porque o Next devolve o valor recém-gravado em `cookies().get()`.
 */
export async function garantirVisitante(): Promise<string> {
  const armazem = await cookies()
  const atual = armazem.get(NOME_COOKIE_VISITANTE)?.value
  if (ehIdDeVisitante(atual)) return atual

  const novo = crypto.randomUUID()
  armazem.set(NOME_COOKIE_VISITANTE, novo, opcoesCookieVisitante())
  return novo
}
