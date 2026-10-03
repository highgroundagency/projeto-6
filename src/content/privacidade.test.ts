import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ATIVIDADE_2,
  BACKLOG_DE_PRIVACIDADE,
  BASE_LEGAL_DA_ATIVIDADE,
  DADOS_PESSOAIS,
  ESTADOS_DO_REQUISITO,
  NORMAS_DA_POLITICA,
  NOTA_DA_IMPLANTACAO,
  NOTA_DA_PORTARIA,
  PRINCIPIOS_PBD,
  REQUISITOS_DE_PRIVACIDADE,
} from './privacidade'

/**
 * A Atividade 2 de Direito transcrita. O PDF tem 16 dados, 15 riscos com
 * requisito e 8 itens de backlog: se a transcrição perder uma linha, o deck e
 * o site passam a contar errado em silêncio.
 */

const RAIZ = join(__dirname, '..', '..')
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), 'utf8')

describe('a Atividade 2 de Direito, como dado', () => {
  it('tem as contagens do PDF entregue', () => {
    expect(DADOS_PESSOAIS).toHaveLength(16)
    expect(REQUISITOS_DE_PRIVACIDADE).toHaveLength(15)
    expect(BACKLOG_DE_PRIVACIDADE).toHaveLength(8)
    expect(ATIVIDADE_2.entrega).toBe('2026-09-28')
  })

  it('cada requisito tem princípio, critério e estado válidos', () => {
    for (const r of REQUISITOS_DE_PRIVACIDADE) {
      expect(PRINCIPIOS_PBD).toContain(r.principio)
      expect(ESTADOS_DO_REQUISITO).toContain(r.estado)
      expect(r.criterio.length, r.risco).toBeGreaterThan(20)
      expect(r.hoje.length, r.risco).toBeGreaterThan(20)
    }
  })

  it('o backlog aponta para riscos que existem', () => {
    for (const item of BACKLOG_DE_PRIVACIDADE) {
      for (const n of item.riscos) {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(REQUISITOS_DE_PRIVACIDADE.length)
      }
    }
  })

  it('cita a portaria vigente, não a revogada que o PDF cita', () => {
    expect(NORMAS_DA_POLITICA.join(' ')).toContain('001/2024')
    expect(NORMAS_DA_POLITICA.join(' ')).not.toContain('05/2023')
    expect(ler('docs/portaria-001-2024.md')).toMatch(/Revoga a Portaria Conjunta SESAU\/SEPLAGTD nº 05/)
  })

  it('o estado de cada requisito bate com o código', () => {
    // Requisito 5: a fronteira dos modelos tem teste.
    expect(REQUISITOS_DE_PRIVACIDADE[4].estado).toBe('no MVP')
    expect(existsSync(join(RAIZ, 'src/lib/calculo/fronteira.test.ts'))).toBe(true)
    // Requisito 6: o formulário da contestação avisa.
    expect(ler('src/components/sistema/telas/contestacao.tsx')).toContain(
      'Não escreva aqui dado de saúde',
    )
    // Requisito 8: o ranking tem modo anônimo, ainda desligado por padrão.
    expect(ler('src/components/sistema/telas/gestao.tsx')).toContain("anonimo === '1'")
    // Requisito 11: nenhuma integração externa, nem chamada de rede no código.
    for (const arquivo of ['src/lib/dados/consultas.ts', 'src/lib/sistema/estado.ts']) {
      expect(ler(arquivo), arquivo).not.toMatch(/\bfetch\(/)
    }
  })

  it('não usa travessão no texto que vai para a tela', () => {
    const copy = JSON.stringify([
      DADOS_PESSOAIS,
      REQUISITOS_DE_PRIVACIDADE,
      BACKLOG_DE_PRIVACIDADE,
      BASE_LEGAL_DA_ATIVIDADE,
      NOTA_DA_PORTARIA,
      NOTA_DA_IMPLANTACAO,
    ])
    expect(copy).not.toMatch(/—/)
  })
})
