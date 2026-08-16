import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FEATURES, ORDEM_PERFIS, featurePorId, type FeatureId } from '@/lib/features'
import { TUTORIAIS } from './tutoriais'

/** Onde mora o corpo de cada tela, para conferir os alvos no fonte. */
const ARQUIVO_DA_TELA: Record<FeatureId, string> = {
  'painel-cam': 'cam.tsx',
  indicadores: 'indicadores.tsx',
  lancamento: 'lancamento.tsx',
  'meu-resultado': 'meu-resultado.tsx',
  auditoria: 'auditoria.tsx',
  'painel-gestao': 'gestao.tsx',
  analytics: 'analytics.tsx',
  contestacao: 'contestacao.tsx',
}

function fonteDaTela(tela: FeatureId): string {
  return readFileSync(
    join(process.cwd(), 'src/components/sistema/telas', ARQUIVO_DA_TELA[tela]),
    'utf8',
  )
}

/**
 * O tutorial não pode ensinar o que a pessoa não pode fazer.
 *
 * Um passo que aponta para tela de outro perfil é pior que um passo faltando:
 * ele manda alguém procurar um botão que não existe naquela sessão, e a culpa
 * parece ser de quem procura.
 */
describe('tutoriais por perfil', () => {
  it('todo perfil tem tutorial', () => {
    for (const perfil of ORDEM_PERFIS) {
      expect(TUTORIAIS[perfil].passos.length, `${perfil} sem passos`).toBeGreaterThan(0)
    }
  })

  it('todo passo aponta para uma tela que existe', () => {
    const ids = FEATURES.map((f) => f.id as string)
    for (const perfil of ORDEM_PERFIS) {
      for (const passo of TUTORIAIS[perfil].passos) {
        if (passo.tela === null) continue
        expect(ids, `${perfil}: "${passo.titulo}" aponta para tela inexistente`).toContain(
          passo.tela as string,
        )
      }
    }
  })

  it('todo passo aponta para uma tela DAQUELE perfil', () => {
    for (const perfil of ORDEM_PERFIS) {
      for (const passo of TUTORIAIS[perfil].passos) {
        if (passo.tela === null) continue
        const feature = featurePorId(passo.tela as FeatureId)
        expect(
          feature.perfis as readonly string[],
          `${perfil}: "${passo.titulo}" ensina ${feature.rotulo}, que não é deste perfil`,
        ).toContain(perfil)
      }
    }
  })

  it('cada tela de um perfil aparece em algum passo do tutorial dele', () => {
    // Sem isto, uma tela nova entraria no sistema sem nunca ser explicada, e o
    // tutorial iria envelhecendo em silêncio.
    for (const perfil of ORDEM_PERFIS) {
      const ensinadas = new Set(
        TUTORIAIS[perfil].passos.map((p) => p.tela).filter((t): t is FeatureId => t !== null),
      )
      const suas = FEATURES.filter((f) => (f.perfis as readonly string[]).includes(perfil))

      const esquecidas = suas.filter((f) => !ensinadas.has(f.id as FeatureId))
      expect(
        esquecidas.map((f) => f.id),
        `o tutorial de ${perfil} não menciona estas telas`,
      ).toEqual([])
    }
  })

  /**
   * O passo aponta para um elemento que existe.
   *
   * É o teste que sustenta o tutorial guiado: `?passo=N` injeta um seletor
   * `#alvo-...` para contornar o elemento. Se o nome não existir na
   * tela, o passeio rola até o lugar nenhum e não contorna coisa alguma — uma
   * falha silenciosa, que é a pior espécie. Aqui ela vira vermelho.
   */
  it('todo alvo de passo existe como id na tela correspondente', () => {
    for (const perfil of ORDEM_PERFIS) {
      for (const passo of TUTORIAIS[perfil].passos) {
        if (passo.alvo === null) continue
        expect(passo.tela, `${perfil}: "${passo.titulo}" tem alvo sem tela`).not.toBeNull()

        const fonte = fonteDaTela(passo.tela as FeatureId)
        const temPainel = fonte.includes(`alvo="${passo.alvo}"`)
        const temAtributo = fonte.includes(`id="alvo-${passo.alvo}"`)

        expect(
          temPainel || temAtributo,
          `${perfil}: "${passo.titulo}" aponta para "${passo.alvo}", que não existe em ${ARQUIVO_DA_TELA[passo.tela as FeatureId]}`,
        ).toBe(true)
      }
    }
  })

  it('o nome do alvo é seguro para entrar num seletor CSS', () => {
    // `DestaqueDoAlvo` monta um seletor de atributo com este texto. Ele já
    // higieniza, e um nome fora do padrão viraria seletor mutilado em silêncio.
    for (const perfil of ORDEM_PERFIS) {
      for (const passo of TUTORIAIS[perfil].passos) {
        if (passo.alvo === null) continue
        expect(passo.alvo, `${perfil}: "${passo.titulo}"`).toMatch(/^[a-z0-9-]+$/)
      }
    }
  })

  it('nenhum passo repete o par título mais tela dentro do mesmo tutorial', () => {
    for (const perfil of ORDEM_PERFIS) {
      const chaves = TUTORIAIS[perfil].passos.map((p) => `${p.tela}|${p.titulo}`)
      expect(new Set(chaves).size, `${perfil} tem passo duplicado`).toBe(chaves.length)
    }
  })
})
