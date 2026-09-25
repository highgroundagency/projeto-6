import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * O cookie do visitante: aleatório, sem privilégio, e fora do alcance de script.
 */

const potes = new Map<string, { valor: string; opcoes?: Record<string, unknown> }>()

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nome: string) => {
      const pote = potes.get(nome)
      return pote === undefined ? undefined : { name: nome, value: pote.valor }
    },
    set: (nome: string, valor: string, opcoes?: Record<string, unknown>) => {
      potes.set(nome, { valor, opcoes })
    },
  }),
}))

const {
  NOME_COOKIE_VISITANTE,
  ehIdDeVisitante,
  garantirVisitante,
  opcoesCookieVisitante,
  visitanteAtual,
} = await import('./visitante')

beforeEach(() => {
  potes.clear()
})

describe('visitante', () => {
  it('sem cookie, ninguém: ler não inventa visitante', async () => {
    expect(await visitanteAtual()).toBeNull()
    expect(potes.size).toBe(0)
  })

  it('a primeira escrita cria um id aleatório e grava o cookie', async () => {
    const id = await garantirVisitante()
    expect(ehIdDeVisitante(id)).toBe(true)
    expect(potes.get(NOME_COOKIE_VISITANTE)?.valor).toBe(id)
    // E a mesma requisição já enxerga o id novo.
    expect(await visitanteAtual()).toBe(id)
  })

  it('quem já tem id continua com ele', async () => {
    const existente = crypto.randomUUID()
    potes.set(NOME_COOKIE_VISITANTE, { valor: existente })
    expect(await garantirVisitante()).toBe(existente)
  })

  it('cookie adulterado vira um id novo, nunca uma cópia escolhida à mão', async () => {
    potes.set(NOME_COOKIE_VISITANTE, { valor: 'admin' })
    expect(await visitanteAtual()).toBeNull()
    const id = await garantirVisitante()
    expect(id).not.toBe('admin')
    expect(ehIdDeVisitante(id)).toBe(true)
  })

  it('o cookie é httpOnly, sameSite lax, e secure em produção', () => {
    expect(opcoesCookieVisitante(true)).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
    expect(opcoesCookieVisitante(false).secure).toBe(false)
  })
})
