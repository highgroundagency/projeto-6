import { type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  ipDaRequisicao,
  limparTentativas,
  registrarTentativa,
  verificarLimite,
} from '@/lib/admin/rate-limit'
import { ChaveDeSessaoAusente, obterChaveDeSessao } from '@/lib/auth/cripto'
import { opcoesCookieSessaoSistema } from '@/lib/auth/sessao'
import { autenticar, emitirSessao, NOME_COOKIE_SESSAO_SISTEMA } from '@/lib/auth/servico'
import { bancoDaAplicacao } from '@/lib/dados'
import { redirecionar } from '@/lib/http'

/**
 * Login do /sistema (ADR-051).
 *
 * Duas barreiras contra quem tenta adivinhar senha, uma em cima da outra:
 * - por IP, na memória do processo (`rate-limit.ts`, 5 tentativas em 10 min);
 * - por CONTA, no banco: 5 erros seguidos travam a conta por 15 minutos, em
 *   qualquer instância do servidor (`servico.ts`).
 *
 * A resposta de falha é UMA SÓ, seja login inexistente, senha errada, conta
 * bloqueada ou limite estourado: "não foi possível entrar".
 */

const corpoSchema = z.object({
  login: z.string().trim().min(1).max(60),
  senha: z.string().min(1).max(200),
})

const comErro = (codigo = '1') => redirecionar(`/sistema/entrar?erro=${codigo}`)

export async function POST(requisicao: NextRequest) {
  const banco = bancoDaAplicacao()
  let chave: Buffer
  try {
    if (!banco) throw new ChaveDeSessaoAusente('sem banco')
    chave = obterChaveDeSessao()
  } catch {
    return comErro('indisponivel')
  }

  const chaveDoLimite = `sistema:${ipDaRequisicao(requisicao.headers)}`
  if (!verificarLimite(chaveDoLimite).permitido) return comErro()

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({
    login: formulario.get('login'),
    senha: formulario.get('senha'),
  })
  if (!analisado.success) {
    registrarTentativa(chaveDoLimite)
    return comErro()
  }

  let resultado
  try {
    resultado = await autenticar(banco, analisado.data.login, analisado.data.senha)
  } catch (erro) {
    console.error('[prumo] login falhou no banco:', erro instanceof Error ? erro.message : erro)
    return comErro('indisponivel')
  }

  if (!resultado.ok) {
    registrarTentativa(chaveDoLimite)
    return comErro()
  }

  limparTentativas(chaveDoLimite)
  const resposta = redirecionar('/sistema')
  resposta.cookies.set(
    NOME_COOKIE_SESSAO_SISTEMA,
    emitirSessao(resultado.usuario, chave, Math.floor(Date.now() / 1000)),
    opcoesCookieSessaoSistema(),
  )
  return resposta
}
