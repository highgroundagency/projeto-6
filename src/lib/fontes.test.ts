import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * As fontes são arquivo versionado, não download de build (ADR-028).
 *
 * O CI quebrou cinco vezes por isto e nenhuma delas por causa do código: o
 * `next/font/google` busca o .woff2 em fonts.gstatic.com toda vez que compila,
 * e quando a rede do runner falhava o build morria. O sintoma era o pior
 * possível de diagnosticar, porque o MESMO commit passava numa branch e
 * quebrava na outra, dependendo só da sorte da rede naquele minuto.
 *
 * Este teste guarda as duas metades da correção: ninguém volta a importar do
 * Google, e todo arquivo declarado existe mesmo no disco.
 */

const LAYOUT = 'src/app/layout.tsx'
const FONTE = readFileSync(join(process.cwd(), LAYOUT), 'utf8')

/** Só o código, sem os comentários de bloco que citam `next/font/google`. */
const CODIGO = FONTE.replace(/\/\*[\s\S]*?\*\//g, '')

describe('fontes', () => {
  it('não baixa fonte do Google no build', () => {
    expect(CODIGO).not.toContain('next/font/google')
  })

  it('carrega as famílias de arquivo local', () => {
    expect(CODIGO).toContain("from 'next/font/local'")
  })

  it('todo arquivo declarado existe no disco', () => {
    const declarados = [...CODIGO.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1])

    // Um layout sem nenhum `path` passaria neste teste sem provar nada. As duas
    // famílias somam cinco pesos; menos que isso é fonte sumida, não teste ocioso.
    expect(declarados.length).toBe(5)

    for (const relativo of declarados) {
      const absoluto = resolve(join(process.cwd(), dirname(LAYOUT)), relativo)
      expect(existsSync(absoluto), `arquivo de fonte não encontrado: ${relativo}`).toBe(true)
    }
  })

  it('os arquivos são woff2 de verdade', () => {
    const declarados = [...CODIGO.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1])

    for (const relativo of declarados) {
      const absoluto = resolve(join(process.cwd(), dirname(LAYOUT)), relativo)
      // Assinatura do formato: um arquivo truncado ou uma página de erro HTML
      // salva por engano no lugar da fonte não passa daqui.
      expect(readFileSync(absoluto).subarray(0, 4).toString('latin1')).toBe('wOF2')
    }
  })
})
