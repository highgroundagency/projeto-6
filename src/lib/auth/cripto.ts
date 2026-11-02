import {
  randomBytes,
  randomUUID,
  scrypt as scryptComCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto'
import { EncryptJWT, jwtDecrypt } from 'jose'
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
 * 2. SESSÃO: JWE, um JWT cifrado com AES-256-GCM (ADR-052). O cookie de quem
 *    entrou vai CIFRADO (ninguém lê o conteúdo) e AUTENTICADO (qualquer bit
 *    alterado faz a abertura falhar), no formato padrão da RFC 7516.
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

// --- Sessão: JWE (JWT cifrado com AES-256-GCM) ----------------------------

/**
 * O token de sessão é um JWE: um JWT CIFRADO, no formato padrão da RFC 7516.
 *
 * - `alg: dir`: a chave de 32 bytes cifra direto, sem embrulhar outra chave.
 * - `enc: A256GCM`: AES-256 em modo GCM. Cifra (ninguém lê o conteúdo) e
 *   autentica (um bit alterado e o token não abre). O IV é aleatório a cada
 *   token, gerado pela biblioteca.
 *
 * Por ser padrão, qualquer serviço com a chave abre o token com uma
 * biblioteca de JWT comum. Por ser CIFRADO, e não só assinado como um JWT
 * comum, quem pega o cookie não lê nem o id da conta.
 *
 * A abertura aceita UM algoritmo e UMA cifra, escritos aqui, e recusa
 * qualquer outro que o token diga usar: é o que fecha a porta clássica das
 * bibliotecas de JWT (token com `alg: none`, ou JWT só assinado no lugar do
 * cifrado). Emissor, audiência e validade também são conferidos.
 */
const ALGORITMO = 'dir'
const CIFRA = 'A256GCM'
const EMISSOR = 'prumo'
const AUDIENCIA = 'prumo-sistema'

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

/** O que vai dentro do token. */
export interface ConteudoDaSessao {
  /** id da conta (`sub` no JWT) */
  usuarioId: string
  /** versão da sessão no momento do login (`sv`): sobe ao trocar a senha */
  versao: number
}

/** Emite o JWE. O tempo vem de fora, em segundos (o relógio é injetado). */
export async function emitirJwe(
  conteudo: ConteudoDaSessao,
  chave: Uint8Array,
  agoraSegundos: number,
  duracaoSegundos: number,
): Promise<string> {
  return new EncryptJWT({ sv: conteudo.versao })
    .setProtectedHeader({ alg: ALGORITMO, enc: CIFRA, typ: 'JWT' })
    .setSubject(conteudo.usuarioId)
    .setIssuer(EMISSOR)
    .setAudience(AUDIENCIA)
    .setIssuedAt(agoraSegundos)
    .setExpirationTime(agoraSegundos + duracaoSegundos)
    .setJti(randomUUID())
    .encrypt(chave)
}

/**
 * Abre o JWE, ou devolve `null` se QUALQUER coisa estiver errada: formato,
 * algoritmo, chave, um bit alterado, emissor, audiência, validade. Nunca
 * lança: entrada hostil é esperada aqui.
 */
export async function abrirJwe(
  token: string | null | undefined,
  chave: Uint8Array,
  agoraSegundos: number,
): Promise<ConteudoDaSessao | null> {
  if (!token) return null
  try {
    const { payload } = await jwtDecrypt(token, chave, {
      keyManagementAlgorithms: [ALGORITMO],
      contentEncryptionAlgorithms: [CIFRA],
      issuer: EMISSOR,
      audience: AUDIENCIA,
      requiredClaims: ['sub', 'iat', 'exp'],
      // A biblioteca só aceita o "agora" como Date; é o único lugar.
      currentDate: new Date(agoraSegundos * 1000),
      clockTolerance: 0,
    })
    if (typeof payload.sub !== 'string' || typeof payload.sv !== 'number') return null
    return { usuarioId: payload.sub, versao: payload.sv }
  } catch {
    return null
  }
}
