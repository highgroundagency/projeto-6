/**
 * Sessão do painel administrativo (§7.1).
 *
 * Cookie assinado com HMAC-SHA256 via Web Crypto — funciona igual no runtime
 * Node (route handlers) e no Edge (middleware), sem dependência externa.
 *
 * O que este módulo NÃO faz: comparar senha no cliente ou embutir segredo em
 * bundle. Tudo aqui roda no servidor.
 */

import type { Ambiente } from '@/lib/ambiente'

export const NOME_COOKIE_SESSAO = 'prumo_admin'
export const NOME_COOKIE_VISAO = 'prumo_visao'
export const DURACAO_SESSAO_DIAS = 30

const VERSAO_PAYLOAD = 1

export interface PayloadSessao {
  /** Versão do formato — permite invalidar sessões antigas no futuro. */
  v: number
  /** Emitido em (epoch em segundos). */
  iat: number
  /** Expira em (epoch em segundos). */
  exp: number
  /** Identificador único da sessão, para rastrear no log sem revelar a senha. */
  jti: string
}

const codificador = new TextEncoder()

function paraBase64Url(bytes: Uint8Array): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function deBase64Url(texto: string): Uint8Array {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/')
  const preenchido = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binario = atob(preenchido)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes
}

async function chaveHmac(segredo: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    codificador.encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function assinarBytes(dados: string, segredo: string): Promise<Uint8Array> {
  const assinatura = await crypto.subtle.sign(
    'HMAC',
    await chaveHmac(segredo),
    codificador.encode(dados),
  )
  return new Uint8Array(assinatura)
}

/** Comparação sem short-circuit: o tempo não depende de onde está a diferença. */
export function iguaisEmTempoConstante(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diferenca = 0
  for (let i = 0; i < a.length; i++) diferenca |= a[i] ^ b[i]
  return diferenca === 0
}

/** Assina um payload arbitrário no formato `base64url(payload).base64url(hmac)`. */
export async function assinarToken(payload: unknown, segredo: string): Promise<string> {
  const corpo = paraBase64Url(codificador.encode(JSON.stringify(payload)))
  const assinatura = paraBase64Url(await assinarBytes(corpo, segredo))
  return `${corpo}.${assinatura}`
}

/**
 * Verifica assinatura e devolve o payload, ou `null` se qualquer coisa estiver
 * errada. Nunca lança: entrada hostil é esperada aqui.
 */
export async function verificarToken<T>(
  token: string | undefined | null,
  segredo: string,
): Promise<T | null> {
  if (!token) return null
  const partes = token.split('.')
  if (partes.length !== 2) return null

  const [corpo, assinatura] = partes
  try {
    const esperada = await assinarBytes(corpo, segredo)
    const recebida = deBase64Url(assinatura)
    if (!iguaisEmTempoConstante(esperada, recebida)) return null
    return JSON.parse(new TextDecoder().decode(deBase64Url(corpo))) as T
  } catch {
    return null
  }
}

export async function criarTokenSessao(
  segredo: string,
  agora: Date = new Date(),
): Promise<string> {
  const emitidoEm = Math.floor(agora.getTime() / 1000)
  const payload: PayloadSessao = {
    v: VERSAO_PAYLOAD,
    iat: emitidoEm,
    exp: emitidoEm + DURACAO_SESSAO_DIAS * 24 * 60 * 60,
    jti: crypto.randomUUID(),
  }
  return assinarToken(payload, segredo)
}

/** true somente se a assinatura confere, a versão bate e a sessão não expirou. */
export async function sessaoValida(
  token: string | undefined | null,
  segredo: string,
  agora: Date = new Date(),
): Promise<boolean> {
  const payload = await verificarToken<PayloadSessao>(token, segredo)
  if (!payload) return false
  if (payload.v !== VERSAO_PAYLOAD) return false
  if (typeof payload.exp !== 'number') return false
  return payload.exp > Math.floor(agora.getTime() / 1000)
}

/**
 * Segredo de assinatura.
 *
 * Em produção, falha fechado: sem `ADMIN_COOKIE_SECRET` o painel fica
 * indisponível, em vez de assinar com um valor previsível.
 *
 * Em desenvolvimento cai num valor fixo conhecido — precisa ser determinístico
 * porque middleware (Edge) e route handler (Node) são runtimes separados: um
 * segredo aleatório por processo faria a verificação falhar entre eles.
 */
const SEGREDO_DEV = 'prumo-dev-inseguro-nao-use-em-producao'

let avisou = false

export function obterSegredo(env: Ambiente = process.env): string {
  const segredo = env.ADMIN_COOKIE_SECRET?.trim()
  if (segredo && segredo.length >= 16) return segredo

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'ADMIN_COOKIE_SECRET ausente ou curto demais (mínimo 16 caracteres). O painel administrativo fica indisponível até que a variável seja configurada.',
    )
  }

  if (!avisou) {
    avisou = true
    console.warn(
      '[prumo] ADMIN_COOKIE_SECRET não definido: usando segredo de desenvolvimento. NUNCA suba isso para produção.',
    )
  }
  return SEGREDO_DEV
}

/** Atributos do cookie de sessão. httpOnly + assinado + sameSite=lax. */
export function opcoesCookieSessao(producao = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACAO_SESSAO_DIAS * 24 * 60 * 60,
  }
}
