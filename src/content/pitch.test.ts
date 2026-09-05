import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EQUIPE } from './equipe'
import {
  CONTAGENS_PITCH,
  DEMO_PITCH,
  DURACAO_PITCH_SEGUNDOS,
  SLIDES,
  formatarTempo,
  inicioDoSlide,
  tempoPorIntegrante,
} from './pitch'
import { BASE } from '@/lib/seed'

const RAIZ = join(__dirname, '..', '..')
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), 'utf8')

/** Linhas de tabela markdown que não são cabeçalho nem separador. */
function linhasDaTabela(markdown: string, titulo: string): string[] {
  const inicio = markdown.indexOf(titulo)
  if (inicio < 0) throw new Error(`Seção não encontrada: ${titulo}`)
  const depois = markdown.slice(inicio)
  const fim = depois.indexOf('\n## ', 1)
  const secao = fim < 0 ? depois : depois.slice(0, fim)
  return secao
    .split('\n')
    .filter((linha) => linha.startsWith('| '))
    .filter((linha) => !/^\|\s*-{3}/.test(linha))
    .slice(1)
}

describe('o pitch do Kick-off', () => {
  it('tem nove slides numerados em sequência, com ids únicos', () => {
    expect(SLIDES).toHaveLength(9)
    expect(SLIDES.map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(new Set(SLIDES.map((s) => s.id)).size).toBe(9)
  })

  it('fecha em 4:55, com margem de cinco segundos para os cinco minutos', () => {
    const soma = SLIDES.reduce((total, s) => total + s.segundos, 0)
    expect(soma).toBe(DURACAO_PITCH_SEGUNDOS)
    expect(soma).toBeLessThan(300)
    expect(formatarTempo(soma)).toBe('4:55')
    expect(inicioDoSlide(0)).toBe(0)
    expect(inicioDoSlide(SLIDES.length)).toBe(DURACAO_PITCH_SEGUNDOS)
  })

  it('distribui a fala entre os seis integrantes, e só entre eles', () => {
    const ids = new Set(EQUIPE.map((i) => i.id))
    for (const slide of SLIDES) expect(ids.has(slide.quemFala)).toBe(true)
    expect(new Set(SLIDES.map((s) => s.quemFala)).size).toBe(EQUIPE.length)
    // Ninguém fala menos de trinta segundos nem mais de um minuto e meio.
    for (const [, segundos] of tempoPorIntegrante()) {
      expect(segundos).toBeGreaterThanOrEqual(30)
      expect(segundos).toBeLessThanOrEqual(90)
    }
  })

  it('não usa travessão em texto de tela (regra 8 da casa)', () => {
    for (const slide of SLIDES) {
      const textos = [slide.titulo, slide.apoio, slide.visual, ...slide.notas]
      for (const texto of textos) {
        expect(texto, `slide ${slide.numero}`).not.toMatch(/[—–]/)
        expect(texto.trim().length, `slide ${slide.numero}`).toBeGreaterThan(0)
      }
      expect(slide.notas.length).toBeGreaterThan(0)
    }
  })

  it('demonstra uma unidade que existe na base, num ciclo fechado e com memória', () => {
    const unidade = BASE.unidades.find((u) => u.id === DEMO_PITCH.unidadeId)
    expect(unidade).toBeDefined()
    const ciclo = BASE.ciclos.find((c) => c.id === DEMO_PITCH.cicloId)
    expect(['homologado', 'publicado']).toContain(ciclo?.estado)
    const avaliacao = BASE.avaliacoes.find(
      (a) => a.unidadeId === DEMO_PITCH.unidadeId && a.cicloId === DEMO_PITCH.cicloId,
    )
    expect(avaliacao).toBeDefined()
    expect(avaliacao?.memoria.passos.length).toBeGreaterThan(0)
    // Sem aviso: a memória aparece inteira, sem linha vermelha para explicar no palco.
    expect(avaliacao?.avisos).toEqual([])
  })

  it('diz no palco os números que os documentos sustentam', () => {
    const seguranca = ler('docs/seguranca.md')
    expect(linhasDaTabela(seguranca, '## STRIDE')).toHaveLength(CONTAGENS_PITCH.ameacasStride)
    const owasp = linhasDaTabela(seguranca, '## OWASP Top 10')
    expect(owasp).toHaveLength(CONTAGENS_PITCH.itensOwasp)
    expect(owasp.filter((l) => l.includes('**Parcial**'))).toHaveLength(
      CONTAGENS_PITCH.owaspParciais,
    )

    const privacidade = ler('docs/privacidade.md')
    expect(linhasDaTabela(privacidade, '## Privacy by Design')).toHaveLength(
      CONTAGENS_PITCH.principiosPrivacidade,
    )

    const usoDeIa = ler('docs/uso-de-ia.md')
    const linhas = linhasDaTabela(usoDeIa, '## Registro semanal')
    expect(linhas).toHaveLength(CONTAGENS_PITCH.usosDeIa)
    // "Todos assinados" só pode ser dito se for verdade.
    for (const linha of linhas) expect(linha).not.toMatch(/\|\s*pendente\s*\|\s*$/)
  })

  it('o roteiro impresso traz o título e a fala de cada slide', () => {
    const roteiro = ler('docs/pitch-kickoff.md')
    for (const slide of SLIDES) {
      expect(roteiro, `slide ${slide.numero}`).toContain(slide.titulo)
      for (const nota of slide.notas) expect(roteiro, `slide ${slide.numero}`).toContain(nota)
    }
  })

  it('o componente cliente do deck não importa conteúdo (regra 3 da casa)', () => {
    const deck = ler('src/components/pitch/deck.tsx')
    expect(deck.startsWith("'use client'")).toBe(true)
    expect(deck).not.toMatch(/@\/content\//)
    expect(deck).not.toMatch(/ciclos\//)
  })
})
