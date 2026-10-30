import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt as scryptComCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto'
import type { Ambiente } from '@/lib/ambiente'

/**
 * A criptografia do login, em dois papéis que NÃO se misturam.
 *
 * 1. SENHA: hash lento com sal (scrypt), NUNCA cifra. Cifra é reversível: quem
 *    tivesse a chave leria todas as senhas de uma vez. Hash só se confere, não
 *    se desfaz, e o custo de memória do scrypt torna a força bruta cara até em
 *    GPU. O sal é aleatório por senha, então duas pessoas com a mesma senha
 *    ficam com hashes diferentes.
 *
 * 2. SESSÃO: AES-256-GCM. O cookie de quem entrou vai CIFRADO (ninguém lê o
 *    conteúdo) e AUTENTICADO (qualquer bit alterado faz a abertura falhar). O
 *    vetor de inicialização é aleatório a cada token: repetir IV com a mesma
 *    chave quebra o GCM, então nunca é reaproveitado.
 *
 * Tudo aqui roda no servidor (runtime Node). Nada disso vai para o navegador.
 */

// --- Senha: scrypt ----------------------------------------------------------

/**
 * Custo do scrypt. N = 2^15 com r = 8 usa 32 MiB por conferência, a faixa que
 * a OWASP recomenda. Fica no próprio hash, então dá para subir o custo no
 * futuro sem invalidar as senhas antigas.
 */
export interface CustoScrypt {
  N: number
  r: number
  p: number
}

export const CUSTO_PADRAO: CustoScrypt = { N: 2 ** 15, r: 8, p: 1 }
const TAMANHO_SAL = 16
const TAMANHO_HASH = 64

function scrypt(senha: string, sal: Buffer, custo: CustoScrypt): Promise<Buffer> {
  const opcoes: ScryptOptions = {
    N: custo.N,
    r: custo.r,
    p: custo.p,
    // O Node recusa acima de 32 MiB por padrão; damos folga para o N padrão.
    maxmem: 256 * custo.N * custo.r,
  }
  return new Promise((resolver, rejeitar) =>
    scryptComCallback(senha.normalize('NFKC'), sal, TAMANHO_HASH, opcoes, (erro, chave) =>
      erro ? rejeitar(erro) : resolver(chave),
    ),
  )
}

/** Formato: `scrypt$N$r$p$sal$hash`, sal e hash em base64. */
export async function gerarHashDeSenha(
  senha: string,
  custo: CustoScrypt = CUSTO_PADRAO,
): Promise<string> {
  const sal = randomBytes(TAMANHO_SAL)
  const hash = await scrypt(senha, sal, custo)
  return ['scrypt', custo.N, custo.r, custo.p, sal.toString('base64'), hash.toString('base64')].join(
    '$',
  )
}

/**
 * Confere a senha contra o hash guardado, em tempo constante.
 * Nunca lança: hash malformado é só "não confere".
 */
export async function senhaConfereComHash(senha: string, guardado: string): Promise<boolean> {
  const partes = guardado.split('$')
  if (partes.length !== 6 || partes[0] !== 'scrypt') return false
  const [N, r, p] = partes.slice(1, 4).map(Number)
  if (![N, r, p].every((n) => Number.isInteger(n) && n > 0)) return false
  try {
    const sal = Buffer.from(partes[4], 'base64')
    const esperado = Buffer.from(partes[5], 'base64')
    const calculado = await scrypt(senha, sal, { N, r, p })
    return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
  } catch {
    return false
  }
}

/**
 * Hash de mentira, para conferir quando o usuário NÃO existe. Sem ele, "login
 * inexistente" responderia na hora e "senha errada" depois de 50 ms, e o tempo
 * de resposta contaria a um atacante quais logins existem.
 */
let hashFantasma: Promise<string> | null = null
export function hashParaUsuarioInexistente(): Promise<string> {
  hashFantasma ??= gerarHashDeSenha(randomBytes(24).toString('base64'))
  return hashFantasma
}

/** Regra mínima de senha: comprimento manda mais que complexidade (NIST 800-63B). */
export function problemaNaSenha(senha: string): string | null {
  if (senha.length < 10) return 'A senha precisa ter pelo menos 10 caracteres.'
  if (senha.length > 200) return 'A senha pode ter no máximo 200 caracteres.'
  return null
}

// --- Sessão: AES-256-GCM ----------------------------------------------------

const VERSAO_TOKEN = 'v1'
const TAMANHO_IV = 12
const TAMANHO_TAG = 16
/** Dado associado: amarra o token a este uso. Um cifrado de outro lugar não abre aqui. */
const DADO_ASSOCIADO = Buffer.from('prumo-sessao-sistema:v1')

/**
 * Chave da sessão, 32 bytes.
 *
 * Vem de `SESSAO_CHAVE`, em base64 (gere com `openssl rand -base64 32`). Em
 * produção é obrigatória e o login falha FECHADO sem ela: ninguém entra, em vez
 * de todo mundo entrar com uma chave previsível. Em desenvolvimento cai numa
 * chave fixa conhecida, com aviso, como o segredo do painel (ADR-015).
 */
const CHAVE_DEV = Buffer.alloc(32, 'prumo-dev-inseguro-nao-use-em-prod')

let avisou = false

export class ChaveDeSessaoAusente extends Error {
  constructor(motivo: string) {
    super(motivo)
    this.name = 'ChaveDeSessaoAusente'
  }
}

export function obterChaveDeSessao(env: Ambiente = process.env): Buffer {
  const bruta = env.SESSAO_CHAVE?.trim()
  if (bruta) {
    const chave = Buffer.from(bruta, 'base64')
    if (chave.length !== 32) {
      throw new ChaveDeSessaoAusente(
        'SESSAO_CHAVE precisa ter exatamente 32 bytes em base64. Gere com: openssl rand -base64 32',
      )
    }
    return chave
  }
  if (env.NODE_ENV === 'production') {
    throw new ChaveDeSessaoAusente(
      'SESSAO_CHAVE ausente: o login fica indisponível até que ela seja configurada.',
    )
  }
  if (!avisou) {
    avisou = true
    console.warn(
      '[prumo] SESSAO_CHAVE não definida: usando chave de desenvolvimento. NUNCA suba isso para produção.',
    )
  }
  return CHAVE_DEV
}

function paraBase64Url(bytes: Buffer): string {
  return bytes.toString('base64url')
}

/** Cifra um objeto em `v1.<base64url(iv | cifrado | tag)>`. */
export function cifrarSessao(conteudo: unknown, chave: Buffer): string {
  const iv = randomBytes(TAMANHO_IV)
  const cifra = createCipheriv('aes-256-gcm', chave, iv, { authTagLength: TAMANHO_TAG })
  cifra.setAAD(DADO_ASSOCIADO)
  const cifrado = Buffer.concat([cifra.update(JSON.stringify(conteudo), 'utf8'), cifra.final()])
  const tag = cifra.getAuthTag()
  return `${VERSAO_TOKEN}.${paraBase64Url(Buffer.concat([iv, cifrado, tag]))}`
}

/**
 * Abre o token, ou devolve `null` se QUALQUER coisa estiver errada: versão,
 * tamanho, chave, um bit alterado. Nunca lança: entrada hostil é esperada.
 */
export function decifrarSessao<T>(token: string | null | undefined, chave: Buffer): T | null {
  if (!token) return null
  const [versao, corpo, ...resto] = token.split('.')
  if (versao !== VERSAO_TOKEN || !corpo || resto.length > 0) return null
  try {
    const bytes = Buffer.from(corpo, 'base64url')
    if (bytes.length < TAMANHO_IV + TAMANHO_TAG + 1) return null
    const iv = bytes.subarray(0, TAMANHO_IV)
    const tag = bytes.subarray(bytes.length - TAMANHO_TAG)
    const cifrado = bytes.subarray(TAMANHO_IV, bytes.length - TAMANHO_TAG)
    const decifra = createDecipheriv('aes-256-gcm', chave, iv, { authTagLength: TAMANHO_TAG })
    decifra.setAAD(DADO_ASSOCIADO)
    decifra.setAuthTag(tag)
    const claro = Buffer.concat([decifra.update(cifrado), decifra.final()])
    return JSON.parse(claro.toString('utf8')) as T
  } catch {
    return null
  }
}
