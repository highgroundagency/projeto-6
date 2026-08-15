import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  ipDaRequisicao,
  limparTentativas,
  registrarTentativa,
  verificarLimite,
} from '@/lib/admin/rate-limit'
import { senhaConfere, senhaEsperada } from '@/lib/admin/senha'
import { criarTokenSessao, NOME_COOKIE_SESSAO, obterSegredo, opcoesCookieSessao } from '@/lib/admin/sessao'

/**
 * Login do painel (§7.1).
 *
 * A senha é conferida EXCLUSIVAMENTE aqui, no servidor. Nada de comparação no
 * cliente e nada de embutir o valor no bundle. O formulário é HTML puro: sem
 * JavaScript, sem estado de cliente e sem superfície extra.
 */

const corpoSchema = z.object({ senha: z.string().min(1).max(200) })

/** Erro genérico: não distingue senha errada de limite estourado. */
function comErro(requisicao: NextRequest) {
  const destino = requisicao.nextUrl.clone()
  destino.pathname = '/admin/entrar'
  destino.search = '?erro=1'
  return NextResponse.redirect(destino, 303)
}

export async function POST(requisicao: NextRequest) {
  let segredo: string
  try {
    segredo = obterSegredo()
  } catch {
    // Sem segredo configurado em produção, o painel não existe.
    return new NextResponse(null, { status: 404 })
  }

  const ip = ipDaRequisicao(requisicao.headers)
  if (!verificarLimite(ip).permitido) {
    return comErro(requisicao)
  }

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({ senha: formulario.get('senha') })
  if (!analisado.success) {
    registrarTentativa(ip)
    return comErro(requisicao)
  }

  if (!(await senhaConfere(analisado.data.senha, senhaEsperada()))) {
    registrarTentativa(ip)
    return comErro(requisicao)
  }

  limparTentativas(ip)

  const destino = requisicao.nextUrl.clone()
  destino.pathname = '/admin'
  destino.search = ''
  const resposta = NextResponse.redirect(destino, 303)
  resposta.cookies.set(NOME_COOKIE_SESSAO, await criarTokenSessao(segredo), opcoesCookieSessao())
  return resposta
}
