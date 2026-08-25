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
 * O limitador de tentativas usa o mesmo mecanismo do login, mas num BALDE
 * PRÓPRIO por IP. Compartilhar o balde parecia reuso e era furo duplo: o
 * acerto da chave zerava o contador de senhas erradas do painel (força bruta
 * de senha intercalada com visitas ao link nunca atingiria o limite), e cinco
 * chutes de chave por terceiros bloqueariam o login do admin naquele IP.
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

  const balde = `vitrine:${ipDaRequisicao(requisicao.headers)}`
  if (!verificarLimite(balde).permitido) return naoExiste()

  // O Next já entrega o segmento percent-decodificado; decodificar de novo
  // quebraria chave que contenha `%` seguido de dois dígitos hex.
  const { chave } = await params

  if (!(await chaveVitrineConfere(chave, esperada))) {
    registrarTentativa(balde)
    return naoExiste()
  }

  limparTentativas(balde)
  const resposta = redirecionar('/')
  resposta.cookies.set(
    NOME_COOKIE_VITRINE,
    await criarTokenVitrine(segredo),
    opcoesCookieVitrine(),
  )
  return resposta
}
