import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * O piso de acessibilidade da identidade, conferido em vez de afirmado.
 *
 * A ADR-016 declara números de contraste. Sem teste, "declara" é a palavra
 * certa — e o dia em que alguém clarear o fundo ou trocar o acento, a
 * declaração vira mentira em silêncio. Aqui os tokens são lidos do próprio
 * `globals.css`, então o teste mede o que o site usa, não uma cópia.
 */

const CSS = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')

/**
 * O bloco de tokens de cada tema, recortado do CSS.
 *
 * O escuro mora no `@theme` e o claro no seletor `[data-tema='claro']`. Ler os
 * dois separadamente é o que impede o teste de casar com o token errado: sem o
 * recorte, a busca por `--color-acento` acharia sempre a primeira ocorrência e
 * o modo claro passaria medindo a paleta escura.
 */
function bloco(tema: 'escuro' | 'claro'): string {
  const abertura = tema === 'escuro' ? '@theme {' : "[data-tema='claro'] {"
  const inicio = CSS.indexOf(abertura)
  if (inicio === -1) throw new Error(`Bloco do tema ${tema} não encontrado em globals.css`)
  const fim = CSS.indexOf('\n}', inicio)
  return CSS.slice(inicio, fim)
}

function token(nome: string, tema: 'escuro' | 'claro' = 'escuro'): string {
  const achado = bloco(tema).match(new RegExp(`--color-${nome}:\\s*(#[0-9a-fA-F]{6})`))
  if (!achado) throw new Error(`Token --color-${nome} não encontrado no tema ${tema}`)
  return achado[1]
}

/** Luminância relativa da WCAG 2.1. */
function luminancia(hex: string): number {
  const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = canais.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (escuro + 0.05)
}

const MINIMO_AA = 4.5

describe('contraste dos pares que a identidade usa', () => {
  const pares: [string, string, string][] = [
    ['corpo de texto sobre o fundo', 'apagado', 'fundo'],
    ['acento como texto sobre o fundo', 'acento', 'fundo'],
    ['acento sobre o preenchimento da pílula', 'acento', 'acento-fraco'],
    ['texto da chamada sobre o acento sólido', 'ink', 'acento'],
    ['título branco sobre o fundo', 'texto', 'fundo'],
    ['corpo de texto sobre a superfície', 'apagado', 'superficie'],
    ['estado ok sobre o fundo', 'ok', 'fundo'],
    ['estado de alerta sobre o fundo', 'alerta', 'fundo'],
  ]

  /**
   * OS MESMOS PARES, NOS DOIS TEMAS (ADR-027).
   *
   * O modo claro não é o escuro com `filter: invert`: o laranja da CESAR dá
   * 5,97:1 sobre o fundo escuro e só 3,2:1 sobre papel. Se alguém um dia
   * "simplificar" a paleta clara reusando #F7580B como texto, é aqui que a
   * regressão aparece, em vez de passar batida numa revisão visual.
   */
  for (const tema of ['escuro', 'claro'] as const) {
    for (const [nome, frente, atras] of pares) {
      it(`[${tema}] ${nome} passa em AA`, () => {
        const razao = contraste(token(frente, tema), token(atras, tema))
        expect(
          razao,
          `${frente} sobre ${atras} no tema ${tema} deu ${razao.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(MINIMO_AA)
      })
    }
  }

  it('o tema claro redefine todos os tokens de cor do tema escuro', () => {
    // Token esquecido no claro herda o valor do escuro em silêncio, e o
    // resultado é texto branco sobre papel branco. Aqui isso vira vermelho.
    const doEscuro = [...bloco('escuro').matchAll(/--(color-[a-z-]+):/g)].map((m) => m[1])
    const doClaro = new Set(
      [...bloco('claro').matchAll(/--(color-[a-z-]+):/g)].map((m) => m[1]),
    )
    // `--color-laranja` é a cor crua da marca: não muda com o tema, por desenho.
    const faltando = doEscuro.filter((n) => n !== 'color-laranja' && !doClaro.has(n))
    expect(faltando, `sem equivalente no tema claro: ${faltando.join(', ')}`).toEqual([])
  })

  it('o anel de foco é o acento, e ele se destaca do fundo', () => {
    expect(CSS).toMatch(/:focus-visible\s*\{[^}]*outline:[^;]*var\(--color-acento\)/)
    expect(contraste(token('acento'), token('fundo'))).toBeGreaterThanOrEqual(3)
  })

  it('a hairline é discreta de propósito nos dois temas', () => {
    // Documenta a intenção: se alguém um dia usar `text-linha`, este número
    // explica por que ficou ilegível.
    expect(contraste(token('linha'), token('fundo'))).toBeLessThan(3)
    expect(contraste(token('linha', 'claro'), token('fundo', 'claro'))).toBeLessThan(3)
  })
})
