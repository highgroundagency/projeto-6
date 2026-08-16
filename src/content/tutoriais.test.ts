import { describe, expect, it } from 'vitest'
import { FEATURES, ORDEM_PERFIS, featurePorId, type FeatureId } from '@/lib/features'
import { TUTORIAIS } from './tutoriais'

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

  it('nenhum passo repete o par título mais tela dentro do mesmo tutorial', () => {
    for (const perfil of ORDEM_PERFIS) {
      const chaves = TUTORIAIS[perfil].passos.map((p) => `${p.tela}|${p.titulo}`)
      expect(new Set(chaves).size, `${perfil} tem passo duplicado`).toBe(chaves.length)
    }
  })
})
