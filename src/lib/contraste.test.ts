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

function token(nome: string): string {
  const achado = CSS.match(new RegExp(`--color-${nome}:\\s*(#[0-9a-fA-F]{6})`))
  if (!achado) throw new Error(`Token --color-${nome} não encontrado em globals.css`)
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

  for (const [nome, frente, atras] of pares) {
    it(`${nome} passa em AA`, () => {
      const razao = contraste(token(frente), token(atras))
      expect(
        razao,
        `${frente} sobre ${atras} deu ${razao.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(MINIMO_AA)
    })
  }

  it('o anel de foco é o acento, e ele se destaca do fundo', () => {
    expect(CSS).toMatch(/:focus-visible\s*\{[^}]*outline:[^;]*var\(--color-acento\)/)
    expect(contraste(token('acento'), token('fundo'))).toBeGreaterThanOrEqual(3)
  })

  it('a hairline é discreta de propósito — não é texto, e não precisa passar em AA', () => {
    // Documenta a intenção: se alguém um dia usar `text-linha`, este número
    // explica por que ficou ilegível.
    expect(contraste(token('linha'), token('fundo'))).toBeLessThan(3)
  })
})
