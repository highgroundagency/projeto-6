import { type NextRequest } from 'next/server'
import { redirecionar } from '@/lib/http'
import { ehTemaValido, NOME_COOKIE_TEMA, TEMA_PADRAO } from '@/lib/tema'

/**
 * Troca o tema e devolve a pessoa para onde ela estava.
 *
 * `voltarPara` é conferido antes de virar destino: só caminho que começa com
 * uma barra e não com duas. Sem isso, `//sitemalicioso.com` num campo oculto
 * viraria um redirecionamento aberto para fora do domínio.
 */
export async function POST(requisicao: NextRequest) {
  const formulario = await requisicao.formData()
  const tema = String(formulario.get('tema') ?? '')
  const pedido = String(formulario.get('voltarPara') ?? '/')
  const destino = pedido.startsWith('/') && !pedido.startsWith('//') ? pedido : '/'

  const resposta = redirecionar(destino)
  resposta.cookies.set(NOME_COOKIE_TEMA, ehTemaValido(tema) ? tema : TEMA_PADRAO, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
  return resposta
}
