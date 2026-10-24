import { describe, expect, it } from 'vitest'
import { BASE } from '@/lib/seed'
import { MINIMO_DO_RECORTE, recortePequenoDemais, tiposSuprimidos } from './anonimato'

/** O número mínimo do recorte (risco 15 da Atividade 2 de Direito). */
describe('o número mínimo do recorte', () => {
  it('suprime o tipo que aparece menos que o mínimo', () => {
    expect(MINIMO_DO_RECORTE).toBe(3)
    const suprimidos = tiposSuprimidos(['usf', 'usf', 'usf', 'caps', 'caps', 'cecon'])
    expect([...suprimidos].sort()).toEqual(['caps', 'cecon'])
  })

  it('não suprime nada quando todo tipo chega ao mínimo', () => {
    expect(tiposSuprimidos(['usf', 'usf', 'usf']).size).toBe(0)
    expect(tiposSuprimidos([]).size).toBe(0)
  })

  it('recorte abaixo do mínimo não tem ranking', () => {
    expect(recortePequenoDemais(2)).toBe(true)
    expect(recortePequenoDemais(3)).toBe(false)
  })

  it('no Distrito Oeste da base de teste, nenhuma sigla sobra', () => {
    const tipos = BASE.unidades.filter((u) => u.distritoId === 'ds-oeste').map((u) => u.tipoId)
    expect(tipos).toHaveLength(4)
    expect(tiposSuprimidos(tipos).size).toBe(new Set(tipos).size)
  })
})
