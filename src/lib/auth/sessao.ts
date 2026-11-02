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

/**
 * Atributos do cookie de sessão:
 *
 * - `httpOnly`: o JavaScript da página não lê o token, nem um script injetado.
 * - `sameSite: 'strict'`: o navegador só manda o cookie em requisição que
 *   nasceu no próprio site. Formulário, imagem ou link vindos de outro site
 *   chegam sem sessão (ADR-052). Site e API moram no mesmo domínio, então
 *   nada do sistema depende de chegar logado vindo de fora.
 * - `secure` em produção: só viaja por HTTPS.
 */
export function opcoesCookieSessaoSistema(producao = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  }
}
