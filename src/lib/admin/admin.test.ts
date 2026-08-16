import { describe, expect, it } from 'vitest'
import {
  MAX_TENTATIVAS,
  criarArmazem,
  ipDaRequisicao,
  limparTentativas,
  registrarTentativa,
  verificarLimite,
} from './rate-limit'
import { SENHA_PADRAO, senhaConfere, senhaEsperada } from './senha'
import {
  assinarToken,
  criarTokenSessao,
  iguaisEmTempoConstante,
  obterSegredo,
  opcoesCookieSessao,
  sessaoValida,
  verificarToken,
  type PayloadSessao,
} from './sessao'

const SEGREDO = 'segredo-de-teste-com-tamanho-suficiente'

describe('assinatura de token', () => {
  it('assina e verifica de volta', async () => {
    const token = await assinarToken({ ola: 'mundo' }, SEGREDO)
    expect(await verificarToken<{ ola: string }>(token, SEGREDO)).toEqual({ ola: 'mundo' })
  })

  it('recusa token assinado com outro segredo', async () => {
    const token = await assinarToken({ admin: true }, 'outro-segredo-qualquer-aqui')
    expect(await verificarToken(token, SEGREDO)).toBeNull()
  })

  it('recusa payload adulterado', async () => {
    const token = await assinarToken({ admin: false }, SEGREDO)
    const [, assinatura] = token.split('.')
    const forjado = `${btoa('{"admin":true}').replace(/=+$/, '')}.${assinatura}`
    expect(await verificarToken(forjado, SEGREDO)).toBeNull()
  })

  it('recusa assinatura adulterada', async () => {
    const token = await assinarToken({ admin: true }, SEGREDO)
    const [corpo, assinatura] = token.split('.')
    const trocado = assinatura.startsWith('A')
      ? `B${assinatura.slice(1)}`
      : `A${assinatura.slice(1)}`
    expect(await verificarToken(`${corpo}.${trocado}`, SEGREDO)).toBeNull()
  })

  it('recusa entrada malformada sem lançar', async () => {
    for (const entrada of ['', 'sem-ponto', 'a.b.c', '...', undefined, null]) {
      expect(await verificarToken(entrada, SEGREDO)).toBeNull()
    }
  })

  it('sobrevive a caracteres não-ASCII no payload', async () => {
    const token = await assinarToken({ nome: 'João — avaliação' }, SEGREDO)
    expect(await verificarToken<{ nome: string }>(token, SEGREDO)).toEqual({
      nome: 'João — avaliação',
    })
  })
})

describe('sessão', () => {
  const agora = new Date('2026-08-15T12:00:00Z')

  it('cria sessão válida com 30 dias', async () => {
    const token = await criarTokenSessao(SEGREDO, agora)
    expect(await sessaoValida(token, SEGREDO, agora)).toBe(true)

    const payload = await verificarToken<PayloadSessao>(token, SEGREDO)
    expect(payload?.exp).toBe(payload!.iat + 30 * 24 * 60 * 60)
    expect(payload?.jti).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('recusa sessão expirada', async () => {
    const token = await criarTokenSessao(SEGREDO, agora)
    const depois = new Date('2026-09-15T12:00:01Z')
    expect(await sessaoValida(token, SEGREDO, depois)).toBe(false)
  })

  it('aceita sessão no último segundo de validade', async () => {
    const token = await criarTokenSessao(SEGREDO, agora)
    expect(await sessaoValida(token, SEGREDO, new Date('2026-09-14T11:59:59Z'))).toBe(true)
  })

  it('recusa payload de versão desconhecida', async () => {
    const token = await assinarToken({ v: 99, iat: 0, exp: 9_999_999_999, jti: 'x' }, SEGREDO)
    expect(await sessaoValida(token, SEGREDO, agora)).toBe(false)
  })

  it('recusa token sem expiração', async () => {
    const token = await assinarToken({ v: 1, iat: 0, jti: 'x' }, SEGREDO)
    expect(await sessaoValida(token, SEGREDO, agora)).toBe(false)
  })

  it('marca o cookie como httpOnly e sameSite lax', () => {
    const opcoes = opcoesCookieSessao(true)
    expect(opcoes).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  })

  it('não exige secure fora de produção, para o dev funcionar em http', () => {
    expect(opcoesCookieSessao(false).secure).toBe(false)
  })
})

describe('obterSegredo', () => {
  it('usa a env var quando ela existe e é longa o bastante', () => {
    expect(obterSegredo({ ADMIN_COOKIE_SECRET: SEGREDO })).toBe(SEGREDO)
  })

  it('falha fechado em produção quando o segredo está ausente', () => {
    expect(() => obterSegredo({ NODE_ENV: 'production' })).toThrow(/ADMIN_COOKIE_SECRET/)
  })

  it('falha fechado em produção quando o segredo é curto demais', () => {
    expect(() =>
      obterSegredo({ NODE_ENV: 'production', ADMIN_COOKIE_SECRET: 'curto' }),
    ).toThrow()
  })

  it('em desenvolvimento cai num segredo fixo, para Edge e Node combinarem', () => {
    const a = obterSegredo({ NODE_ENV: 'development' })
    const b = obterSegredo({ NODE_ENV: 'development' })
    expect(a).toBe(b)
    expect(a).toContain('dev')
  })
})

describe('senha', () => {
  it('aceita a senha correta', async () => {
    expect(await senhaConfere('0321', '0321')).toBe(true)
  })

  it('recusa senha errada do mesmo tamanho', async () => {
    expect(await senhaConfere('0322', '0321')).toBe(false)
  })

  it('recusa senha errada de tamanho diferente', async () => {
    expect(await senhaConfere('0', '0321')).toBe(false)
    expect(await senhaConfere('0321000000', '0321')).toBe(false)
  })

  it('recusa senha vazia', async () => {
    expect(await senhaConfere('', '0321')).toBe(false)
  })

  it('usa a senha do briefing como padrão e respeita a env var', () => {
    expect(senhaEsperada({})).toBe(SENHA_PADRAO)
    expect(senhaEsperada({ ADMIN_SENHA: 'outra' })).toBe('outra')
  })
})

describe('comparação em tempo constante', () => {
  it('compara conteúdo, não referência', () => {
    expect(iguaisEmTempoConstante(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true)
    expect(iguaisEmTempoConstante(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false)
    expect(iguaisEmTempoConstante(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false)
  })
})

describe('rate limit', () => {
  it('permite as primeiras tentativas e bloqueia a partir do limite', () => {
    const armazem = criarArmazem()
    const agora = 1_000_000

    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      expect(verificarLimite('ip', agora, armazem).permitido).toBe(true)
      registrarTentativa('ip', agora, armazem)
    }

    const bloqueado = verificarLimite('ip', agora, armazem)
    expect(bloqueado.permitido).toBe(false)
    expect(bloqueado.esperarSegundos).toBeGreaterThan(0)
  })

  it('libera de novo depois que a janela passa', () => {
    const armazem = criarArmazem()
    const agora = 1_000_000
    for (let i = 0; i < MAX_TENTATIVAS; i++) registrarTentativa('ip', agora, armazem)

    expect(verificarLimite('ip', agora + 9 * 60 * 1000, armazem).permitido).toBe(false)
    expect(verificarLimite('ip', agora + 10 * 60 * 1000 + 1, armazem).permitido).toBe(true)
  })

  it('conta por IP, sem contaminar vizinho', () => {
    const armazem = criarArmazem()
    for (let i = 0; i < MAX_TENTATIVAS; i++) registrarTentativa('ip-a', 1000, armazem)
    expect(verificarLimite('ip-a', 1000, armazem).permitido).toBe(false)
    expect(verificarLimite('ip-b', 1000, armazem).permitido).toBe(true)
  })

  it('login bem-sucedido limpa o contador', () => {
    const armazem = criarArmazem()
    for (let i = 0; i < MAX_TENTATIVAS; i++) registrarTentativa('ip', 1000, armazem)
    limparTentativas('ip', armazem)
    expect(verificarLimite('ip', 1000, armazem).permitido).toBe(true)
  })
})

describe('ipDaRequisicao', () => {
  it('pega o primeiro IP do x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 70.41.3.18' })
    expect(ipDaRequisicao(headers)).toBe('203.0.113.7')
  })

  it('cai no x-real-ip e depois em desconhecido', () => {
    expect(ipDaRequisicao(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
    expect(ipDaRequisicao(new Headers())).toBe('desconhecido')
  })
})
