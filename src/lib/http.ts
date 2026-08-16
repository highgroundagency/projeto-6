import { NextResponse } from 'next/server'

/**
 * Redireciona com `Location` RELATIVO.
 *
 * `NextResponse.redirect()` exige URL absoluta, e o host dela vem da
 * configuração do servidor — não do host que o navegador usou. Resultado: quem
 * acessa por `127.0.0.1` é jogado para `localhost` no meio de um POST, o que
 * troca a origem, descarta cookie de sessão e quebra o fluxo.
 *
 * `Location` relativo é válido em HTTP (RFC 7231, §7.1.2) e mantém o cliente
 * exatamente na origem em que ele já estava.
 */
export function redirecionar(caminho: string, status: 303 | 307 | 308 = 303): NextResponse {
  return new NextResponse(null, { status, headers: { Location: caminho } })
}

/**
 * Monta `?chave=valor` já com escape, ignorando valores vazios.
 *
 * A âncora vem separada porque ela é obrigatoriamente o ÚLTIMO pedaço da URL:
 * colada no caminho, `?` entraria dentro do fragmento e a query sumiria.
 */
export function comParametros(
  caminho: string,
  parametros: Record<string, string | undefined>,
  ancora?: string,
): string {
  const busca = new URLSearchParams()
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor) busca.set(chave, valor)
  }
  const consulta = busca.toString()
  return `${caminho}${consulta ? `?${consulta}` : ''}${ancora ?? ''}`
}

/**
 * Redireciona a partir do MIDDLEWARE.
 *
 * O runtime de middleware exige URL absoluta no `Location` — um caminho
 * relativo estoura `TypeError: Invalid URL`. Para não jogar o visitante em
 * outra origem, a URL é montada com o `Host` que ele mesmo enviou, e não com o
 * host de configuração do servidor.
 */
export function redirecionarNoMiddleware(
  requisicao: Request,
  caminho: string,
  status: 303 | 307 | 308 = 307,
): NextResponse {
  const destino = new URL(caminho, requisicao.url)
  const host = requisicao.headers.get('host')
  if (host) {
    destino.host = host
    const protocolo = requisicao.headers.get('x-forwarded-proto')
    if (protocolo) destino.protocol = `${protocolo}:`
  }
  return NextResponse.redirect(destino, status)
}
