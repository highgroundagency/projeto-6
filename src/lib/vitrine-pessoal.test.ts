import { describe, expect, it } from 'vitest'
import { criarTokenSessao, sessaoValida } from './admin/sessao'
import {
  chaveVitrineConfere,
  chaveVitrineEsperada,
  criarTokenVitrine,
  DURACAO_VITRINE_DIAS,
  vitrineValida,
} from './vitrine-pessoal'

const SEGREDO = 'segredo-de-teste-com-tamanho-suficiente'
const CHAVE = 'uma-chave-longa-o-bastante-para-valer'

describe('chaveVitrineEsperada', () => {
  it('falha fechado sem a variável', () => {
    expect(chaveVitrineEsperada({})).toBeNull()
    expect(chaveVitrineEsperada({ CHAVE_VITRINE: undefined })).toBeNull()
    expect(chaveVitrineEsperada({ CHAVE_VITRINE: '   ' })).toBeNull()
  })

  it('recusa chave curta: melhor nenhuma que uma adivinhável', () => {
    expect(chaveVitrineEsperada({ CHAVE_VITRINE: 'curtinha' })).toBeNull()
    expect(chaveVitrineEsperada({ CHAVE_VITRINE: '123456789012345' })).toBeNull()
  })

  it('aceita chave com tamanho suficiente, sem espaços das pontas', () => {
    expect(chaveVitrineEsperada({ CHAVE_VITRINE: `  ${CHAVE}  ` })).toBe(CHAVE)
  })
})

describe('chaveVitrineConfere', () => {
  it('aceita a chave certa e recusa qualquer outra', async () => {
    expect(await chaveVitrineConfere(CHAVE, CHAVE)).toBe(true)
    expect(await chaveVitrineConfere('outra-chave-igualmente-longa', CHAVE)).toBe(false)
    expect(await chaveVitrineConfere('', CHAVE)).toBe(false)
  })
})

describe('token da vitrine', () => {
  it('token recém-emitido é válido', async () => {
    const token = await criarTokenVitrine(SEGREDO)
    expect(await vitrineValida(token, SEGREDO)).toBe(true)
  })

  it('expira depois da duração', async () => {
    const emissao = new Date('2026-08-25T12:00:00Z')
    const token = await criarTokenVitrine(SEGREDO, emissao)

    const dentroDoPrazo = new Date(
      emissao.getTime() + (DURACAO_VITRINE_DIAS - 1) * 24 * 60 * 60 * 1000,
    )
    const depoisDoPrazo = new Date(
      emissao.getTime() + (DURACAO_VITRINE_DIAS + 1) * 24 * 60 * 60 * 1000,
    )

    expect(await vitrineValida(token, SEGREDO, dentroDoPrazo)).toBe(true)
    expect(await vitrineValida(token, SEGREDO, depoisDoPrazo)).toBe(false)
  })

  it('recusa assinatura de outro segredo e token adulterado', async () => {
    const token = await criarTokenVitrine(SEGREDO)
    expect(await vitrineValida(token, 'outro-segredo-tambem-longo-o-bastante')).toBe(false)

    const [corpo, assinatura] = token.split('.')
    const adulterado = `${corpo}x.${assinatura}`
    expect(await vitrineValida(adulterado, SEGREDO)).toBe(false)
  })

  it('não vale como sessão de admin, e sessão de admin não vale como vitrine', async () => {
    // O ataque real: copiar o valor de prumo_vitrine para prumo_admin. O payload
    // da vitrine satisfaz os campos que a sessão confere, então só a separação
    // de domínio na assinatura impede a troca. Este teste é a tranca da porta.
    const tokenVitrine = await criarTokenVitrine(SEGREDO)
    expect(await sessaoValida(tokenVitrine, SEGREDO)).toBe(false)

    const tokenSessao = await criarTokenSessao(SEGREDO)
    expect(await vitrineValida(tokenSessao, SEGREDO)).toBe(false)
  })

  it('recusa lixo: cookie é entrada hostil por definição', async () => {
    expect(await vitrineValida(undefined, SEGREDO)).toBe(false)
    expect(await vitrineValida('', SEGREDO)).toBe(false)
    expect(await vitrineValida('nem.token.é', SEGREDO)).toBe(false)
  })
})
