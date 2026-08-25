import { NextResponse, type NextRequest } from 'next/server'
import {
  ipDaRequisicao,
  limparTentativas,
  registrarTentativa,
  verificarLimite,
} from '@/lib/admin/rate-limit'
import { obterSegredo } from '@/lib/admin/sessao'
import { redirecionar } from '@/lib/http'
import {
  chaveVitrineConfere,
  chaveVitrineEsperada,
  criarTokenVitrine,
  NOME_COOKIE_VITRINE,
  opcoesCookieVitrine,
} from '@/lib/vitrine-pessoal'

/**
 * A porta do link da vitrine pessoal.
 *
 * GET porque o link é para ser clicado de qualquer lugar: um favorito, uma
 * mensagem para si mesmo. Chave certa grava o cookie assinado e manda para a
 * página; qualquer outra coisa é 404 igual ao de rota inexistente, sem
 * distinguir "chave errada" de "não configurado" (§6.2).
 *
 * O mesmo limitador de tentativas do login vale aqui: chave é credencial, e
 * credencial adivinhável em loop não é credencial.
 */

function naoExiste() {
  return new NextResponse(null, { status: 404 })
}

export async function GET(
  requisicao: NextRequest,
  { params }: { params: Promise<{ chave: string }> },
) {
  const esperada = chaveVitrineEsperada()
  if (!esperada) return naoExiste()

  let segredo: string
  try {
    segredo = obterSegredo()
  } catch {
    // Produção sem ADMIN_COOKIE_SECRET: nada assinável, logo nada de link.
    return naoExiste()
  }

  const ip = ipDaRequisicao(requisicao.headers)
  if (!verificarLimite(ip).permitido) return naoExiste()

  const { chave } = await params
  let informada: string
  try {
    informada = decodeURIComponent(chave)
  } catch {
    informada = chave
  }

  if (!(await chaveVitrineConfere(informada, esperada))) {
    registrarTentativa(ip)
    return naoExiste()
  }

  limparTentativas(ip)
  const resposta = redirecionar('/')
  resposta.cookies.set(
    NOME_COOKIE_VITRINE,
    await criarTokenVitrine(segredo),
    opcoesCookieVitrine(),
  )
  return resposta
}
