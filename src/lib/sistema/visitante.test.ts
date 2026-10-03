import { randomBytes } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Operacao } from './estado'

/**
 * O diário do visitante no cookie: assinado, compactado, com teto, e fora do
 * alcance de script (ADR-048).
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
  LIMITE_DO_COOKIE,
  NOME_COOKIE_DIARIO,
  codificarDiario,
  decodificarDiario,
  gravarSessao,
  opcoesCookieDiario,
  sessaoAtual,
} = await import('./visitante')
const { novaSessao } = await import('./estado')

const SEGREDO = 'segredo-de-teste-com-mais-de-16'

/** A demonstração do SR1 inteira: um lançamento, três avanços e uma contestação longa. */
const DEMONSTRACAO: Operacao[] = [
  {
    tipo: 'lancar',
    lancamento: {
      subindicadorId: 'acompanhamento-familias',
      unidadeId: 'usf-canario',
      cicloId: 'ciclo-2026-07',
      valor: null,
      numerador: 170,
      denominador: 200,
      evidencia: 'Relatório do e-SUS de julho, conferido pela coordenação.',
      autor: 'ger-usf-canario',
      registradoEm: '2026-10-03T12:00:00.000Z',
      status: 'enviado',
    },
    agora: '2026-10-03T12:00:00.000Z',
    perfil: 'gerente_unidade',
  },
  {
    tipo: 'avancar',
    cicloId: 'ciclo-2026-07',
    autor: 'seab',
    agora: '2026-10-03T12:01:00.000Z',
  },
  {
    tipo: 'avancar',
    cicloId: 'ciclo-2026-07',
    autor: 'seab',
    agora: '2026-10-03T12:02:00.000Z',
  },
  {
    tipo: 'avancar',
    cicloId: 'ciclo-2026-07',
    autor: 'seab',
    agora: '2026-10-03T12:03:00.000Z',
  },
  {
    tipo: 'contestar',
    dados: {
      gerenteId: 'ger-usf-canario',
      cicloId: 'ciclo-2026-06',
      indicadorId: null,
      motivo: 'A nota de junho não bate com o que a unidade mandou. '.repeat(18).slice(0, 1000),
      abertaEm: '2026-10-03T12:04:00.000Z',
    },
    perfil: 'gerente_unidade',
  },
]

beforeEach(() => {
  potes.clear()
})

describe('o diário no cookie', () => {
  it('ida e volta: o que se grava é o que se lê', () => {
    const valor = codificarDiario(DEMONSTRACAO, SEGREDO)
    expect(decodificarDiario(valor, SEGREDO)).toEqual(DEMONSTRACAO)
  })

  it('a demonstração inteira cabe com folga no cookie', () => {
    const valor = codificarDiario(DEMONSTRACAO, SEGREDO)
    expect(valor).not.toBeNull()
    expect(valor!.length).toBeLessThan(LIMITE_DO_COOKIE / 2)
  })

  it('cookie editado à mão vira base pura, nunca escrita pulando a rota', () => {
    const valor = codificarDiario(DEMONSTRACAO, SEGREDO)!
    const [corpo, assinatura] = valor.split('.')
    const forjado = codificarDiario([], 'outro-segredo-qualquer-123')!.split('.')[0]

    expect(decodificarDiario(`${forjado}.${assinatura}`, SEGREDO)).toBeNull()
    expect(decodificarDiario(`${corpo}.${assinatura.slice(1)}`, SEGREDO)).toBeNull()
    expect(decodificarDiario(valor, 'outro-segredo-qualquer-123')).toBeNull()
    expect(decodificarDiario(corpo, SEGREDO)).toBeNull()
    expect(decodificarDiario('lixo', SEGREDO)).toBeNull()
    expect(decodificarDiario(undefined, SEGREDO)).toBeNull()
  })

  it('assinatura certa com formato errado também não entra', () => {
    const operacaoEstranha = [{ tipo: 'apagar_tudo' }] as unknown as Operacao[]
    expect(decodificarDiario(codificarDiario(operacaoEstranha, SEGREDO), SEGREDO)).toBeNull()
  })

  it('sem segredo, não grava nem lê', () => {
    expect(codificarDiario(DEMONSTRACAO, null)).toBeNull()
    expect(decodificarDiario(codificarDiario(DEMONSTRACAO, SEGREDO), null)).toBeNull()
  })

  it('sem cookie, diário vazio; com cookie, o diário dele', async () => {
    expect((await sessaoAtual()).diario).toEqual([])

    expect(await gravarSessao(novaSessao(DEMONSTRACAO))).toBe(true)
    expect(potes.has(NOME_COOKIE_DIARIO)).toBe(true)
    expect((await sessaoAtual()).diario).toEqual(DEMONSTRACAO)
  })

  it('o que não cabe no cookie é recusado, e o cookie antigo fica', async () => {
    expect(await gravarSessao(novaSessao(DEMONSTRACAO))).toBe(true)
    const antes = potes.get(NOME_COOKIE_DIARIO)?.valor

    // Texto que não se compacta: aleatório, cada contestação perto do teto.
    const semPadrao = () => randomBytes(750).toString('base64')
    const enorme: Operacao[] = Array.from({ length: 8 }, () => ({
      tipo: 'contestar',
      dados: {
        gerenteId: 'ger-usf-canario',
        cicloId: 'ciclo-2026-06',
        indicadorId: null,
        motivo: semPadrao(),
        abertaEm: '2026-10-03T12:04:00.000Z',
      },
      perfil: 'gerente_unidade',
    }))

    expect(await gravarSessao(novaSessao(enorme))).toBe(false)
    expect(potes.get(NOME_COOKIE_DIARIO)?.valor).toBe(antes)
  })

  it('o cookie é httpOnly, sameSite lax, sem prazo, e secure em produção', () => {
    expect(opcoesCookieDiario(true)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
    expect(opcoesCookieDiario(false).secure).toBe(false)
  })
})
