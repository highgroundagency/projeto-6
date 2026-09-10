import { describe, expect, it } from 'vitest'
import { acaoDaTecla, ehControle, engoleTecla, impedePadrao } from './teclado'

/**
 * Um alvo de mentira: só o `closest` importa para a decisão.
 *
 * A comparação é por seletor INTEIRO, e não por substring: com substring o
 * alvo `a` casava com `textarea` e o teste media a própria mentira.
 */
function alvo(seletorDoAlvo: string | null): Element | null {
  if (seletorDoAlvo === null) return null
  return {
    closest: (seletor: string) =>
      seletor
        .split(',')
        .map((parte) => parte.trim())
        .includes(seletorDoAlvo)
        ? ({} as Element)
        : null,
  } as Element
}

describe('o teclado do deck', () => {
  it('avança e volta com as setas quando o foco está no corpo', () => {
    expect(acaoDaTecla({ key: 'ArrowRight' }, null)).toBe('avancar')
    expect(acaoDaTecla({ key: 'ArrowLeft' }, null)).toBe('voltar')
    expect(acaoDaTecla({ key: 'PageDown' }, null)).toBe('avancar')
    expect(acaoDaTecla({ key: 'Home' }, null)).toBe('inicio')
    expect(acaoDaTecla({ key: 'End' }, null)).toBe('fim')
  })

  it('CONTINUA avançando com o foco num botão, num link ou num sumário', () => {
    // O defeito que quase custou o pitch: clicar uma vez na seta da tela
    // deixava o foco no botão, e a partir dali nenhuma tecla funcionava.
    for (const controle of ['button', 'a', 'summary']) {
      expect(acaoDaTecla({ key: 'ArrowRight' }, alvo(controle)), controle).toBe('avancar')
      expect(acaoDaTecla({ key: 'n' }, alvo(controle)), controle).toBe('notas')
      expect(acaoDaTecla({ key: 'f' }, alvo(controle)), controle).toBe('tela-cheia')
    }
  })

  it('cala a boca dentro de campo de texto, onde a seta é do cursor', () => {
    for (const campo of ['input', 'textarea', 'select']) {
      expect(acaoDaTecla({ key: 'ArrowRight' }, alvo(campo)), campo).toBeNull()
      expect(acaoDaTecla({ key: ' ' }, alvo(campo)), campo).toBeNull()
    }
    expect(engoleTecla(alvo('[contenteditable="true"]'))).toBe(true)
    expect(engoleTecla(null)).toBe(false)
  })

  it('a barra de espaço não faz dois passos num controle', () => {
    // Com o foco num botão, o navegador já aciona o botão. Avançar também
    // seria pular um slide sem ninguém pedir.
    expect(acaoDaTecla({ key: ' ' }, alvo('button'))).toBeNull()
    expect(acaoDaTecla({ key: ' ' }, null)).toBe('avancar')
    expect(ehControle(alvo('button'))).toBe(true)
    expect(ehControle(alvo('div'))).toBe(false)
  })

  it('devolve o atalho do navegador quando há modificador', () => {
    expect(acaoDaTecla({ key: 'p', ctrlKey: true }, null)).toBeNull()
    expect(acaoDaTecla({ key: 'ArrowRight', metaKey: true }, null)).toBeNull()
    expect(acaoDaTecla({ key: 'f', altKey: true }, null)).toBeNull()
  })

  it('ignora tecla que não é nossa', () => {
    expect(acaoDaTecla({ key: 'x' }, null)).toBeNull()
    expect(acaoDaTecla({ key: 'Enter' }, null)).toBeNull()
    expect(acaoDaTecla({ key: 'Tab' }, null)).toBeNull()
  })

  it('só impede o padrão do navegador onde ele atrapalha', () => {
    // Rolar com a seta e a barra de espaço atrapalha; abrir as notas, não.
    expect(impedePadrao('avancar')).toBe(true)
    expect(impedePadrao('imprimir')).toBe(true)
    expect(impedePadrao('notas')).toBe(false)
    expect(impedePadrao('tela-cheia')).toBe(false)
  })
})
