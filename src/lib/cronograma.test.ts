import { describe, expect, it } from 'vitest'
import {
  CRONOGRAMA,
  IDS_CICLOS,
  MARCOS,
  MARCOS_PARALELOS,
  PESO_TOTAL,
  cicloPorId,
  indiceDoCiclo,
} from './cronograma'
import { diaDaSemana, diferencaEmDias, ehDataISO } from './datas'

describe('cronograma', () => {
  it('tem os 18 ciclos do briefing', () => {
    expect(CRONOGRAMA).toHaveLength(18)
  })

  it('não repete id', () => {
    expect(new Set(IDS_CICLOS).size).toBe(IDS_CICLOS.length)
  })

  it('só tem datas civis válidas', () => {
    for (const ciclo of CRONOGRAMA) {
      expect(ehDataISO(ciclo.data), `${ciclo.id} tem data inválida`).toBe(true)
    }
  })

  it('está em ordem cronológica', () => {
    const datas = CRONOGRAMA.map((c) => c.data)
    expect([...datas].sort()).toEqual(datas)
  })

  it('cai sempre no sábado, de 7 em 7 dias', () => {
    for (const ciclo of CRONOGRAMA) {
      expect(diaDaSemana(ciclo.data), `${ciclo.id} não cai no sábado`).toBe('sábado')
    }
    for (let i = 1; i < CRONOGRAMA.length; i++) {
      expect(diferencaEmDias(CRONOGRAMA[i - 1].data, CRONOGRAMA[i].data)).toBe(7)
    }
  })

  it('mantém os pesos da matriz fiéis ao briefing', () => {
    // O documento da disciplina soma 115, não 100. Preservamos o dado como está
    // e normalizamos na exibição — este teste existe para que a inconsistência
    // seja uma decisão consciente e não uma surpresa.
    expect(PESO_TOTAL).toBe(115)
    expect(cicloPorId('sr2').peso).toBe(18)
    expect(cicloPorId('sr1').peso).toBe(15)
    expect(cicloPorId('ko').peso).toBe(0)
  })

  it('tem exatamente três marcos, na ordem Kick-off → SR1 → SR2', () => {
    expect(MARCOS.map((m) => m.id)).toEqual(['ko', 'sr1', 'sr2'])
  })

  it('tem três semanas de pausa', () => {
    expect(CRONOGRAMA.filter((c) => c.tipo === 'pausa').map((c) => c.id)).toEqual([
      'i1',
      'i2',
      'i3',
    ])
  })

  it('todo ciclo que não é pausa declara evidências', () => {
    for (const ciclo of CRONOGRAMA.filter((c) => c.tipo !== 'pausa')) {
      expect(ciclo.evidencias.length, `${ciclo.id} sem evidências`).toBeGreaterThan(0)
    }
  })

  it('localiza ciclo por id e por índice', () => {
    expect(cicloPorId('s5').rotulo).toBe('Semana 5 — Arquitetura')
    expect(indiceDoCiclo('s1')).toBe(0)
    expect(indiceDoCiclo('sr2')).toBe(17)
  })

  it('tem marcos paralelos de ML e Direito com datas válidas', () => {
    expect(MARCOS_PARALELOS.filter((m) => m.trilha === 'ml')).toHaveLength(4)
    expect(MARCOS_PARALELOS.filter((m) => m.trilha === 'direito')).toHaveLength(2)
    for (const marco of MARCOS_PARALELOS) {
      expect(ehDataISO(marco.data), `${marco.rotulo} tem data inválida`).toBe(true)
    }
  })
})
