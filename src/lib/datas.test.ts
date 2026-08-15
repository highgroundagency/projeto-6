import { describe, expect, it } from 'vitest'
import {
  diaDaSemana,
  diferencaEmDias,
  ehDataISO,
  formatarBR,
  formatarExtenso,
  hojeEmRecife,
  somarDias,
} from './datas'

describe('hojeEmRecife', () => {
  // Recife é UTC-3 o ano inteiro (o Brasil aboliu o horário de verão em 2019),
  // então 21h em Recife já é o dia seguinte em UTC. É exatamente aí que uma
  // implementação ingênua com toISOString() erra o dia.
  it('devolve o dia anterior quando em UTC já virou', () => {
    expect(hojeEmRecife(new Date('2026-08-15T02:30:00Z'))).toBe('2026-08-14')
  })

  it('vira o dia à meia-noite de Recife, não à meia-noite de UTC', () => {
    expect(hojeEmRecife(new Date('2026-08-15T02:59:59Z'))).toBe('2026-08-14')
    expect(hojeEmRecife(new Date('2026-08-15T03:00:00Z'))).toBe('2026-08-15')
  })

  it('não é afetado por horário de verão em janeiro', () => {
    expect(hojeEmRecife(new Date('2026-01-15T02:00:00Z'))).toBe('2026-01-14')
    expect(hojeEmRecife(new Date('2026-01-15T03:00:00Z'))).toBe('2026-01-15')
  })

  it('preenche mês e dia com zero à esquerda', () => {
    expect(hojeEmRecife(new Date('2026-03-05T15:00:00Z'))).toBe('2026-03-05')
  })
})

describe('somarDias', () => {
  it('atravessa a virada de mês', () => {
    expect(somarDias('2026-08-29', 7)).toBe('2026-09-05')
  })

  it('atravessa a virada de ano', () => {
    expect(somarDias('2026-12-05', 30)).toBe('2027-01-04')
  })

  it('aceita deslocamento negativo', () => {
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('respeita ano bissexto', () => {
    expect(somarDias('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('com zero devolve a mesma data', () => {
    expect(somarDias('2026-10-17', 0)).toBe('2026-10-17')
  })
})

describe('diferencaEmDias', () => {
  it('conta dias inteiros entre duas datas', () => {
    expect(diferencaEmDias('2026-08-15', '2026-08-22')).toBe(7)
  })

  it('é negativa quando a data final é anterior', () => {
    expect(diferencaEmDias('2026-08-22', '2026-08-15')).toBe(-7)
  })
})

describe('ehDataISO', () => {
  it('aceita data civil válida', () => {
    expect(ehDataISO('2026-08-08')).toBe(true)
  })

  it('recusa dia inexistente', () => {
    expect(ehDataISO('2026-02-30')).toBe(false)
  })

  it('recusa mês inválido e formato errado', () => {
    expect(ehDataISO('2026-13-01')).toBe(false)
    expect(ehDataISO('2026/08/08')).toBe(false)
    expect(ehDataISO('08-08-2026')).toBe(false)
  })
})

describe('formatação', () => {
  it('formata no padrão brasileiro', () => {
    expect(formatarBR('2026-12-05')).toBe('05/12/2026')
  })

  it('formata por extenso em português', () => {
    expect(formatarExtenso('2026-03-01')).toBe('1 de março de 2026')
  })

  it('nomeia o dia da semana', () => {
    // O briefing marca o Kick-off como sábado — serve de conferência cruzada.
    expect(diaDaSemana('2026-09-12')).toBe('sábado')
  })
})

describe('ordenação lexicográfica', () => {
  it('comparar strings ISO equivale a comparar datas', () => {
    const datas = ['2026-12-05', '2026-08-08', '2026-10-03', '2026-09-12']
    expect([...datas].sort()).toEqual([
      '2026-08-08',
      '2026-09-12',
      '2026-10-03',
      '2026-12-05',
    ])
  })
})
