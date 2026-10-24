import { describe, expect, it } from 'vitest'
import {
  DIAS_PARA_CONTESTAR,
  DIAS_UTEIS_PARA_RESPONDER,
  prazoParaContestar,
  prazoParaResponder,
  situacaoParaContestar,
  somarDiasUteis,
} from './prazos'

/** Os prazos do art. 9º da Portaria Conjunta 001/2024. */
describe('os prazos do art. 9º', () => {
  it('são os da portaria', () => {
    expect(DIAS_PARA_CONTESTAR).toBe(10)
    expect(DIAS_UTEIS_PARA_RESPONDER).toBe(5)
  })

  it('contestar: 10 dias corridos, atravessando o mês', () => {
    expect(prazoParaContestar('2026-04-27')).toBe('2026-05-07')
    expect(prazoParaContestar('2026-12-28')).toBe('2027-01-07')
  })

  it('responder: dias úteis pulam o fim de semana', () => {
    // Quinta 07/05: sexta, segunda, terça, quarta, quinta.
    expect(prazoParaResponder('2026-05-07')).toBe('2026-05-14')
    // Aberto no domingo: a contagem começa na segunda.
    expect(prazoParaResponder('2026-05-03')).toBe('2026-05-08')
    // Aberto no sábado chega ao mesmo lugar.
    expect(prazoParaResponder('2026-05-02')).toBe('2026-05-08')
    expect(somarDiasUteis('2026-05-08', 1)).toBe('2026-05-11')
    expect(somarDiasUteis('2026-05-08', 0)).toBe('2026-05-08')
  })

  it('o último dia ainda vale, o seguinte não', () => {
    expect(situacaoParaContestar('2026-04-27', '2026-04-27')).toEqual({
      aberto: true,
      ate: '2026-05-07',
    })
    expect(situacaoParaContestar('2026-04-27', '2026-05-07').aberto).toBe(true)
    expect(situacaoParaContestar('2026-04-27', '2026-05-08')).toEqual({
      aberto: false,
      motivo: 'vencido',
      ate: '2026-05-07',
    })
  })

  it('sem publicação, o prazo não começou', () => {
    expect(situacaoParaContestar(null, '2026-10-24')).toEqual({
      aberto: false,
      motivo: 'nao_publicado',
    })
  })
})
