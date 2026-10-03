import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import resultados from '@/content/ml/resultados.json'

/**
 * A FRONTEIRA ENTRE OS MODELOS E A CONTA.
 *
 * Requisito 5 da Atividade 2 de Direito (`src/content/privacidade.ts`): os
 * modelos de aprendizado de máquina apontam onde olhar, mas nenhuma saída
 * deles entra no cálculo da gratificação, e nenhum deles recebe identificador
 * de gestor. A decisão continua humana e contestável (LGPD, art. 20).
 *
 * É um teste de dependência: se alguém fizer o motor ler um resultado de
 * modelo, ou um modelo passar a usar gestor como atributo, ele falha.
 */

const PASTA_DO_MOTOR = join(__dirname)

const fontesDoMotor = readdirSync(PASTA_DO_MOTOR)
  .filter((arquivo) => arquivo.endsWith('.ts') && !arquivo.endsWith('.test.ts'))
  .map((arquivo) => ({ arquivo, codigo: readFileSync(join(PASTA_DO_MOTOR, arquivo), 'utf8') }))

describe('a fronteira entre os modelos e a conta', () => {
  it('o motor só importa os próprios tipos: nada de modelo, analytics ou dado externo', () => {
    expect(fontesDoMotor.length).toBeGreaterThan(0)
    for (const { arquivo, codigo } of fontesDoMotor) {
      const origens = [...codigo.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
      for (const origem of origens) {
        expect(origem.startsWith('./'), `${arquivo} importa ${origem}`).toBe(true)
      }
      expect(codigo, arquivo).not.toMatch(/\bml\b|analytics|resultados\.json/i)
    }
  })

  it('nenhum atributo dos modelos aponta para uma pessoa', () => {
    const atributos = resultados.modelos.flatMap((modelo) =>
      'importancias' in modelo.metricas
        ? (modelo.metricas.importancias as readonly { atributo: string }[]).map((i) => i.atributo)
        : [],
    )
    expect(atributos.length).toBeGreaterThan(0)
    for (const atributo of atributos) {
      expect(atributo, atributo).not.toMatch(/gestor|gerente|servidor|nome|matr[ií]cula|cpf/i)
    }
  })

  it('os resultados dos modelos dizem, eles mesmos, que não entram na conta', () => {
    expect(resultados.aviso).toMatch(/Nenhum resultado .* entra no cálculo/)
  })
})
