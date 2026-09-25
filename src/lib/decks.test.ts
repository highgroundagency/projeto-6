import { describe, expect, it } from 'vitest'
import { CRONOGRAMA, cicloPorId } from './cronograma'
import { somarDias } from './datas'
import { DECKS_DOS_MARCOS, deckEmDestaque } from './decks'
import { DIAS_DE_DESTAQUE_DO_PITCH } from './releases'

const todos = () => true
const kickOff = cicloPorId('ko').data
const sr1 = cicloPorId('sr1').data

describe('o deck em destaque', () => {
  it('é o do marco mais recente que o visitante já vê', () => {
    // Na semana antes do SR1, com os dois abertos, o SR1 ganha.
    expect(deckEmDestaque(somarDias(sr1, -7), todos)?.ciclo).toBe('sr1')
    // Com o SR1 ainda fechado, o Kick-off continua, se a janela dele durar.
    expect(deckEmDestaque(kickOff, (c) => c === 'ko')?.ciclo).toBe('ko')
  })

  it('some dez dias depois do marco, e antes do portão não existe', () => {
    expect(deckEmDestaque(somarDias(sr1, DIAS_DE_DESTAQUE_DO_PITCH), todos)?.ciclo).toBe('sr1')
    expect(deckEmDestaque(somarDias(sr1, DIAS_DE_DESTAQUE_DO_PITCH + 1), todos)).toBeNull()
    expect(deckEmDestaque(sr1, () => false)).toBeNull()
  })

  it('entre a janela do Kick-off e a abertura do SR1, não oferece nada', () => {
    const depoisDoKo = somarDias(kickOff, DIAS_DE_DESTAQUE_DO_PITCH + 1)
    expect(deckEmDestaque(depoisDoKo, (c) => c === 'ko')).toBeNull()
  })

  it('anda com o cronograma, não com uma data escrita à mão', () => {
    const adiado = CRONOGRAMA.map((c) => (c.id === 'sr1' ? { ...c, data: '2026-10-20' } : c))
    expect(deckEmDestaque('2026-10-30', todos, adiado)?.ciclo).toBe('sr1')
    expect(deckEmDestaque('2026-10-31', todos, adiado)).toBeNull()
  })

  it('cada deck aponta para uma rota e um PDF próprios, fechados pelo mesmo ciclo', () => {
    for (const deck of DECKS_DOS_MARCOS) {
      expect(deck.pdf).toBe(`${deck.rota}/pdf`)
      expect(cicloPorId(deck.ciclo).tipo).toBe('marco')
    }
  })
})
