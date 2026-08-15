import type { Ambiente } from '@/lib/ambiente'
import { iguaisEmTempoConstante } from './sessao'

/**
 * Conferência da senha do painel.
 *
 * Compara o HMAC das duas senhas em vez das strings: além de tempo constante,
 * o comprimento da senha correta não vaza pelo tempo de resposta.
 *
 * A senha padrão `0321` está no briefing e, portanto, é pública. Isso é aceitável
 * para um trabalho acadêmico com dados sintéticos e está declarado em
 * docs/seguranca.md como risco assumido — em produção real, `ADMIN_SENHA` deve
 * ser trocada.
 */
export const SENHA_PADRAO = '0321'

const codificador = new TextEncoder()

async function resumo(valor: string, sal: string): Promise<Uint8Array> {
  const chave = await crypto.subtle.importKey(
    'raw',
    codificador.encode(sal),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', chave, codificador.encode(valor)))
}

export function senhaEsperada(env: Ambiente = process.env): string {
  return env.ADMIN_SENHA?.trim() || SENHA_PADRAO
}

export async function senhaConfere(
  informada: string,
  esperada: string,
  sal = 'prumo-conferencia-de-senha',
): Promise<boolean> {
  const [a, b] = await Promise.all([resumo(informada, sal), resumo(esperada, sal)])
  return iguaisEmTempoConstante(a, b)
}
