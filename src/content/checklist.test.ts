import { describe, expect, it } from 'vitest'
import { CHECKLIST, montarChecklist } from './checklist'
import { EQUIPE } from './equipe'
import { CRONOGRAMA } from '@/lib/cronograma'

const IDS_INTEGRANTES = new Set<string>(EQUIPE.map((i) => i.id))

describe('checklist da matriz', () => {
  it('só referencia evidências que existem no cronograma', () => {
    for (const item of CHECKLIST) {
      const ciclo = CRONOGRAMA.find((c) => c.id === item.ciclo)
      expect(ciclo, `ciclo inexistente: ${item.ciclo}`).toBeDefined()
      expect(
        (ciclo?.evidencias as readonly string[]).includes(item.evidencia),
        `evidência não declarada em cronograma.ts para ${item.ciclo}: "${item.evidencia}"`,
      ).toBe(true)
    }
  })

  it('não repete a mesma evidência duas vezes', () => {
    const chaves = CHECKLIST.map((i) => `${i.ciclo}::${i.evidencia}`)
    expect(new Set(chaves).size).toBe(chaves.length)
  })

  it('atribui responsáveis que existem na equipe', () => {
    for (const item of CHECKLIST) {
      if (item.responsavel) {
        expect(
          IDS_INTEGRANTES.has(item.responsavel),
          `responsável inexistente: ${item.responsavel}`,
        ).toBe(true)
      }
    }
  })

  it('cobre todas as evidências do cronograma, com "a fazer" como padrão', () => {
    const linhas = montarChecklist()
    const totalEvidencias = CRONOGRAMA.reduce((soma, c) => soma + c.evidencias.length, 0)
    expect(linhas).toHaveLength(totalEvidencias)
    expect(linhas.filter((l) => l.status === 'a_fazer').length).toBeGreaterThan(0)
  })

  it('reflete o status declarado', () => {
    const linha = montarChecklist().find(
      (l) => l.ciclo === 's2' && l.evidencia === 'Cronograma inicial',
    )
    expect(linha?.status).toBe('validado')
    expect(linha?.responsavel).toBe('joao-henrique')
  })
})
