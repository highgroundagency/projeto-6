import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { decodeProtectedHeader, EncryptJWT, SignJWT } from 'jose'
import {
  abrirJwe,
  emitirJwe,
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

describe('sessão: JWE com AES-256-GCM', () => {
  const chave = randomBytes(32)
  const conteudo = { usuarioId: 'usr-0001', versao: 3 }
  const AGORA = 2_000_000_000
  const HORA = 3600

  it('é um JWE compacto: cinco partes, cabeçalho dir + A256GCM', async () => {
    const token = await emitirJwe(conteudo, chave, AGORA, HORA)
    const partes = token.split('.')
    expect(partes).toHaveLength(5)
    // No modo `dir` não há chave embrulhada: a segunda parte é vazia.
    expect(partes[1]).toBe('')
    expect(decodeProtectedHeader(token)).toEqual({ alg: 'dir', enc: 'A256GCM', typ: 'JWT' })
  })

  it('abre de volta com a chave certa', async () => {
    const token = await emitirJwe(conteudo, chave, AGORA, HORA)
    expect(await abrirJwe(token, chave, AGORA + 10)).toEqual(conteudo)
  })

  it('o conteúdo não é legível no cookie (é cifrado, não só assinado)', async () => {
    const token = await emitirJwe(conteudo, chave, AGORA, HORA)
    const cifrado = Buffer.from(token.split('.')[3], 'base64url').toString('latin1')
    expect(cifrado).not.toContain('usr-0001')
    expect(cifrado).not.toContain('prumo')
  })

  it('o mesmo conteúdo cifra diferente a cada vez (IV novo)', async () => {
    const a = await emitirJwe(conteudo, chave, AGORA, HORA)
    const b = await emitirJwe(conteudo, chave, AGORA, HORA)
    expect(a.split('.')[2]).not.toBe(b.split('.')[2])
    expect(a).not.toBe(b)
  })

  it('qualquer pedaço alterado faz a abertura falhar', async () => {
    const token = await emitirJwe(conteudo, chave, AGORA, HORA)
    const partes = token.split('.')
    for (const indice of [0, 2, 3, 4]) {
      const bytes = Buffer.from(partes[indice], 'base64url')
      bytes[bytes.length - 1] ^= 1
      const adulterado = [...partes]
      adulterado[indice] = bytes.toString('base64url')
      expect(await abrirJwe(adulterado.join('.'), chave, AGORA)).toBeNull()
    }
  })

  it('outra chave não abre', async () => {
    const token = await emitirJwe(conteudo, chave, AGORA, HORA)
    expect(await abrirJwe(token, randomBytes(32), AGORA)).toBeNull()
  })

  it('vencido não abre, nem por um segundo', async () => {
    const token = await emitirJwe(conteudo, chave, AGORA, HORA)
    expect(await abrirJwe(token, chave, AGORA + HORA - 1)).toEqual(conteudo)
    expect(await abrirJwe(token, chave, AGORA + HORA)).toBeNull()
  })

  it('recusa JWT só ASSINADO, mesmo com a mesma chave (só cifrado é aceito)', async () => {
    const assinado = await new SignJWT({ sv: 3 })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('usr-0001')
      .setIssuer('prumo')
      .setAudience('prumo-sistema')
      .setIssuedAt(AGORA)
      .setExpirationTime(AGORA + HORA)
      .sign(chave)
    expect(await abrirJwe(assinado, chave, AGORA)).toBeNull()
  })

  it('recusa o truque do alg "none"', async () => {
    const cabecalho = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const corpo = Buffer.from(
      JSON.stringify({ sub: 'usr-0001', sv: 3, iss: 'prumo', aud: 'prumo-sistema', iat: AGORA, exp: AGORA + HORA }),
    ).toString('base64url')
    expect(await abrirJwe(`${cabecalho}.${corpo}.`, chave, AGORA)).toBeNull()
  })

  it('recusa outra cifra, mesmo válida (A128GCM no lugar de A256GCM)', async () => {
    const outra = await new EncryptJWT({ sv: 3 })
      .setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })
      .setSubject('usr-0001')
      .setIssuer('prumo')
      .setAudience('prumo-sistema')
      .setIssuedAt(AGORA)
      .setExpirationTime(AGORA + HORA)
      .encrypt(randomBytes(16))
    expect(await abrirJwe(outra, chave, AGORA)).toBeNull()
  })

  it('recusa emissor ou audiência de outro sistema', async () => {
    for (const [emissor, audiencia] of [
      ['outro', 'prumo-sistema'],
      ['prumo', 'painel-admin'],
    ]) {
      const token = await new EncryptJWT({ sv: 3 })
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setSubject('usr-0001')
        .setIssuer(emissor)
        .setAudience(audiencia)
        .setIssuedAt(AGORA)
        .setExpirationTime(AGORA + HORA)
        .encrypt(chave)
      expect(await abrirJwe(token, chave, AGORA)).toBeNull()
    }
  })

  it('lixo, vazio e formato antigo dão null, nunca exceção', async () => {
    for (const lixo of [null, undefined, '', 'v1.abc', 'a.b.c.d.e', '....', 'x'.repeat(500)]) {
      expect(await abrirJwe(lixo, chave, AGORA)).toBeNull()
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
