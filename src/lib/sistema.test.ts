import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assinarToken,
  criarTokenSessao,
  NOME_COOKIE_SESSAO,
  NOME_COOKIE_VISAO,
  obterSegredo,
} from './admin/sessao'
import { FEATURES, ORDEM_PERFIS, type FeatureId } from './features'
import { NOME_COOKIE_PERFIL } from './sistema/identidade'
import type { Overlay } from './visao'

/**
 * Quem pode operar controle que muda estado compartilhado (ADR-015).
 *
 * O `admin` do contexto do sistema não é o perfil do seletor — é a sessão
 * assinada. E não basta ter a sessão: no "ver como visitante" ele também cai
 * para `false`, senão a prévia mostraria botões que o visitante não tem.
 */

const potes = new Map<string, string>()

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nome: string) => {
      const valor = potes.get(nome)
      return valor === undefined ? undefined : { name: nome, value: valor }
    },
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

const { exigirFeature, exigirPerfil } = await import('./sistema')

const SEGREDO = obterSegredo()

async function entrarComoAdmin(): Promise<void> {
  potes.set(NOME_COOKIE_SESSAO, await criarTokenSessao(SEGREDO))
}

async function definirOverlay(overlay: Overlay): Promise<void> {
  potes.set(NOME_COOKIE_VISAO, await assinarToken(overlay, SEGREDO))
}

/**
 * `obterVisao` lê o relógio por dentro, então o teste fixa o relógio em vez de
 * injetar a data. Sem isto, o primeiro caso passaria hoje e quebraria sozinho
 * em 12/09/2026, quando a s5 entra no ar pelo adiantamento de 7 dias.
 */
beforeAll(() => {
  // A vitrine versionada em `src/content/vitrine.ts` pode estar aberta, e aberta
  // ela libera tudo para todo mundo. Estes casos medem o GATE DE RELEASE, então
  // a env var fecha a janela: ela vence o valor versionado.
  process.env.RELEASE_ABERTO_ATE = '2020-01-01T00:00:00Z'
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-15T15:00:00Z'))
})

afterAll(() => {
  delete process.env.RELEASE_ABERTO_ATE
  vi.useRealTimers()
})

beforeEach(() => {
  potes.clear()
})

describe('exigirFeature — quem pode operar', () => {
  it('sem sessão, a tela nem abre: o gate de release fecha antes', async () => {
    // Em 15/08/2026 a s5 ainda não foi liberada, então o visitante leva 404 na
    // porta. É a primeira camada, e ela é anterior a qualquer questão de perfil.
    await expect(exigirFeature('painel-cam')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('com sessão, o modo completo abre a tela e libera o controle', async () => {
    await entrarComoAdmin()
    const contexto = await exigirFeature('painel-cam')

    expect(contexto.visao.modoCompleto).toBe(true)
    expect(contexto.admin).toBe(true)
  })

  it('no "ver como visitante", a tela abre mas o controle não', async () => {
    await entrarComoAdmin()
    await definirOverlay({ verComoVisitante: true, dataSimulada: '2026-09-19' })

    const contexto = await exigirFeature('painel-cam')

    // A prévia enxerga a tela porque, em 19/09, a s5 já saiu...
    expect(contexto.visao.verComoVisitante).toBe(true)
    expect(contexto.visao.visiveis).toContain('s5')
    // ...e não enxerga o controle, que é o ponto: prévia fiel.
    expect(contexto.admin).toBe(false)
  })

  it('o perfil do seletor não concede nada', async () => {
    await entrarComoAdmin()
    await definirOverlay({ verComoVisitante: true, dataSimulada: '2026-09-19' })
    potes.set(NOME_COOKIE_PERFIL, 'cam')

    const contexto = await exigirFeature('painel-cam')

    expect(contexto.perfil).toBe('cam')
    expect(contexto.admin).toBe(false)
  })
})

/**
 * As oito telas contra os quatro perfis — a matriz inteira, sem amostragem.
 *
 * Este é o teste que faltava. Até a ADR-023, `indicadores`, `meu-resultado`,
 * `auditoria`, `painel-gestao` e `analytics` não olhavam o perfil uma única vez:
 * o filtro existia só na navegação, e quem digitasse a rota entrava. O briefing
 * pede perfis de ACESSO, e acesso que a barra de endereço contorna é ordenação
 * de menu com outro nome.
 *
 * A verdade é `FEATURES[].perfis`. Se alguém mexer lá e esquecer a tela, ou
 * mexer na tela e esquecer o dado, um destes 32 casos cai.
 */
describe('exigirPerfil — a matriz de 8 telas × 4 perfis', () => {
  beforeEach(async () => {
    // Sessão de admin em todos os casos: o modo completo libera as oito telas,
    // e assim o que sobra medindo é exclusivamente o gate de PERFIL.
    await entrarComoAdmin()
  })

  for (const feature of FEATURES) {
    for (const perfil of ORDEM_PERFIS) {
      const permitido = (feature.perfis as readonly string[]).includes(perfil)

      it(`${feature.id} × ${perfil}: ${permitido ? 'abre' : '404'}`, async () => {
        potes.set(NOME_COOKIE_PERFIL, perfil)
        const chamada = exigirPerfil(feature.id as FeatureId)

        if (permitido) {
          expect((await chamada).perfil).toBe(perfil)
        } else {
          await expect(chamada).rejects.toThrow('NEXT_NOT_FOUND')
        }
      })
    }
  }

  it('nenhuma tela é aberta para os quatro perfis ao mesmo tempo', () => {
    // Uma tela visível para todo mundo é uma tela sem recorte, e um seletor de
    // perfil que não muda nada. Se um dia isso for proposital, o teste avisa.
    const irrestritas = FEATURES.filter(
      (f) => (f.perfis as readonly string[]).length === ORDEM_PERFIS.length,
    )
    expect(irrestritas.map((f) => f.id)).toEqual([])
  })

  it('todo perfil tem ao menos uma tela, senão o seletor teria opção morta', () => {
    for (const perfil of ORDEM_PERFIS) {
      const suas = FEATURES.filter((f) => (f.perfis as readonly string[]).includes(perfil))
      expect(suas.length, `${perfil} ficou sem nenhuma tela`).toBeGreaterThan(0)
    }
  })
})
