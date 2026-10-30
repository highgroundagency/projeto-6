import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  cifrarSessao,
  decifrarSessao,
  gerarHashDeSenha,
  obterChaveDeSessao,
  problemaNaSenha,
  senhaConfereComHash,
  type CustoScrypt,
} from './cripto'

// Custo baixo só para a suíte andar rápido; o formato é o mesmo do padrão.
const BARATO: CustoScrypt = { N: 2 ** 10, r: 8, p: 1 }

describe('senha com scrypt', () => {
  it('confere a senha certa e recusa a errada', async () => {
    const hash = await gerarHashDeSenha('cavalo correto bateria grampo', BARATO)
    expect(hash).toMatch(/^scrypt\$1024\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/)
    expect(await senhaConfereComHash('cavalo correto bateria grampo', hash)).toBe(true)
    expect(await senhaConfereComHash('cavalo correto bateria grampO', hash)).toBe(false)
  })

  it('a mesma senha gera hashes diferentes (sal aleatório)', async () => {
    const a = await gerarHashDeSenha('mesma senha de teste', BARATO)
    const b = await gerarHashDeSenha('mesma senha de teste', BARATO)
    expect(a).not.toBe(b)
  })

  it('o hash não contém a senha', async () => {
    const hash = await gerarHashDeSenha('segredo-visivel-123', BARATO)
    expect(hash).not.toContain('segredo')
  })

  it('o custo fica no hash: muda o padrão, a senha antiga continua valendo', async () => {
    const antigo = await gerarHashDeSenha('senha de outra época', { N: 2 ** 9, r: 8, p: 1 })
    expect(await senhaConfereComHash('senha de outra época', antigo)).toBe(true)
  })

  it('hash malformado é "não confere", nunca exceção', async () => {
    for (const lixo of ['', 'scrypt', 'md5$1$2$3$4$5', 'scrypt$0$8$1$aa$bb', 'scrypt$x$8$1$aa$bb']) {
      expect(await senhaConfereComHash('qualquer', lixo)).toBe(false)
    }
  })

  it('senha curta é recusada; comprimento manda mais que complexidade', () => {
    expect(problemaNaSenha('curta')).toMatch(/10 caracteres/)
    expect(problemaNaSenha('uma frase longa sem símbolo')).toBeNull()
  })
})

describe('sessão com AES-256-GCM', () => {
  const chave = randomBytes(32)
  const conteudo = { u: 'usr-1', s: 3, exp: 2_000_000_000 }

  it('cifra e abre de volta', () => {
    const token = cifrarSessao(conteudo, chave)
    expect(token.startsWith('v1.')).toBe(true)
    expect(decifrarSessao(token, chave)).toEqual(conteudo)
  })

  it('o conteúdo não é legível no cookie', () => {
    const token = cifrarSessao(conteudo, chave)
    const bruto = Buffer.from(token.slice(3), 'base64url').toString('latin1')
    expect(bruto).not.toContain('usr-1')
  })

  it('o mesmo conteúdo cifra diferente a cada vez (IV novo)', () => {
    expect(cifrarSessao(conteudo, chave)).not.toBe(cifrarSessao(conteudo, chave))
  })

  it('qualquer bit alterado faz a abertura falhar', () => {
    const token = cifrarSessao(conteudo, chave)
    const bytes = Buffer.from(token.slice(3), 'base64url')
    for (const posicao of [0, 13, bytes.length - 1]) {
      const adulterado = Buffer.from(bytes)
      adulterado[posicao] ^= 1
      expect(decifrarSessao(`v1.${adulterado.toString('base64url')}`, chave)).toBeNull()
    }
  })

  it('outra chave não abre', () => {
    const token = cifrarSessao(conteudo, chave)
    expect(decifrarSessao(token, randomBytes(32))).toBeNull()
  })

  it('lixo, versão errada e vazio dão null', () => {
    for (const lixo of [null, undefined, '', 'v1.', 'v2.abc', 'v1.abc.def', 'v1.' + 'A'.repeat(10)]) {
      expect(decifrarSessao(lixo, chave)).toBeNull()
    }
  })
})

describe('chave da sessão', () => {
  it('aceita 32 bytes em base64', () => {
    const base64 = randomBytes(32).toString('base64')
    expect(obterChaveDeSessao({ SESSAO_CHAVE: base64 })).toHaveLength(32)
  })

  it('recusa chave de tamanho errado', () => {
    expect(() => obterChaveDeSessao({ SESSAO_CHAVE: randomBytes(16).toString('base64') })).toThrow(
      /32 bytes/,
    )
  })

  it('em produção, sem chave, falha fechado', () => {
    expect(() => obterChaveDeSessao({ NODE_ENV: 'production' })).toThrow(/indisponível/)
  })

  it('em desenvolvimento, cai na chave de desenvolvimento', () => {
    expect(obterChaveDeSessao({ NODE_ENV: 'development' })).toHaveLength(32)
  })
})
