import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { bancoDaAplicacao } from '@/lib/dados'
import { obterChaveDeSessao } from './cripto'
import {
  DURACAO_SESSAO_SEGUNDOS,
  NOME_COOKIE_SESSAO_SISTEMA,
  usuarioDaSessao,
  type Usuario,
} from './servico'

/**
 * A ponte entre o cookie da requisição e a conta no banco.
 *
 * Memorizado por requisição (`cache` do React): o layout, a página e as telas
 * perguntam "quem é?" várias vezes, e o banco responde uma só.
 *
 * Qualquer falha (sem banco, sem chave, cookie adulterado, banco fora do ar)
 * vira "ninguém entrou": o sistema cai para o modo visitante, só leitura,
 * e nunca para o contrário.
 */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const banco = bancoDaAplicacao()
  if (!banco) return null
  const token = (await cookies()).get(NOME_COOKIE_SESSAO_SISTEMA)?.value
  if (!token) return null
  try {
    return await usuarioDaSessao(
      banco,
      token,
      obterChaveDeSessao(),
      Math.floor(Date.now() / 1000),
    )
  } catch (erro) {
    console.error('[prumo] sessão não conferida:', erro instanceof Error ? erro.message : erro)
    return null
  }
})

/** Atributos do cookie: httpOnly (o JavaScript da página não lê), lax, seguro em produção. */
export function opcoesCookieSessaoSistema(producao = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  }
}
