import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ACHADOS_DA_PLANILHA,
  ARQUIVO_PDF_SR1,
  COMPROMISSOS_NO_SR1,
  DEMO_SR1,
  DURACAO_SR1_CURTA_SEGUNDOS,
  DURACAO_SR1_SEGUNDOS,
  PALAVRAS_POR_SEGUNDO,
  PARADAS_ATE_O_SR2,
  SLIDES_SR1,
  SLIDES_SR1_CURTA,
  TELAS_NO_SR1,
  TESTES_DO_MOTOR,
  TETO_DE_PALAVRAS_SR1,
  TIPOS_DE_UNIDADE,
  TRES_CONTAS,
  UNIDADE_DO_DECK,
  inicioNaVersao,
  notasNaVersao,
  palavrasFaladas,
  palavrasNaTela,
  segundosNaVersao,
  tempoPorIntegranteSR1,
  textoNaTela,
  type SlideSR1,
  type Versao,
} from './apresentacao-sr1'
import { EQUIPE } from './equipe'
import { COMPROMISSOS_ATE_O_SR1 } from './pitch'
import { regraVigente } from '@/lib/calculo/motor'
import { indiceDoCiclo } from '@/lib/cronograma'
import { BASE } from '@/lib/seed'

const RAIZ = join(__dirname, '..', '..')
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), 'utf8')
const VERSOES: readonly Versao[] = ['completa', 'curta']
const LISTA = SLIDES_SR1 as readonly SlideSR1[]

describe('o deck do SR1', () => {
  it('tem dezesseis slides numerados em sequência, com ids únicos', () => {
    expect(SLIDES_SR1).toHaveLength(16)
    expect(SLIDES_SR1.map((s) => s.numero)).toEqual(
      Array.from({ length: SLIDES_SR1.length }, (_, i) => i + 1),
    )
    expect(new Set(SLIDES_SR1.map((s) => s.id)).size).toBe(SLIDES_SR1.length)
  })

  it('a versão completa fecha em 9:00 e a curta em 4:55, com margem nas duas', () => {
    const completa = LISTA.reduce((soma, s) => soma + s.segundos, 0)
    expect(completa).toBe(DURACAO_SR1_SEGUNDOS)
    expect(completa).toBeLessThanOrEqual(540)
    expect(inicioNaVersao(LISTA.length, 'completa')).toBe(DURACAO_SR1_SEGUNDOS)

    const curta = SLIDES_SR1_CURTA.reduce((soma, s) => soma + segundosNaVersao(s, 'curta'), 0)
    expect(curta).toBe(DURACAO_SR1_CURTA_SEGUNDOS)
    // Cinco minutos é o que a diretriz escrita do Kick-off dizia. Fechar em
    // cima do limite é estourar no dia.
    expect(curta).toBeLessThan(300)
    // A curta é recorte, não outro deck: capa e fechamento ficam.
    expect(SLIDES_SR1_CURTA[0].id).toBe('capa')
    expect(SLIDES_SR1_CURTA.at(-1)?.id).toBe('fechamento')
    for (const slide of SLIDES_SR1_CURTA) {
      expect(slide.curto!.segundos).toBeLessThanOrEqual(slide.segundos)
      expect(slide.curto!.notas).toBeGreaterThan(0)
      expect(slide.curto!.notas).toBeLessThanOrEqual(slide.notas.length)
    }
  })

  it('os sete falam nas duas versões, e ninguém some nem toma conta', () => {
    // No Kick-off a fala era só de quem já estava na equipe. No SR1 o Kerry
    // tem três semanas de trabalho atrás dele, e entra como qualquer outro.
    for (const versao of VERSOES) {
      const tempos = tempoPorIntegranteSR1(versao)
      expect([...tempos.keys()].sort(), versao).toEqual(EQUIPE.map((i) => i.id).sort())
      for (const [quem, segundos] of tempos) {
        expect(segundos, `${quem} na versão ${versao}`).toBeGreaterThanOrEqual(30)
        expect(segundos, `${quem} na versão ${versao}`).toBeLessThanOrEqual(130)
      }
    }
  })

  it('a fala de cada slide cabe no tempo dele, a uma fala calma', () => {
    for (const versao of VERSOES) {
      for (const slide of versao === 'curta' ? SLIDES_SR1_CURTA : LISTA) {
        const palavras = palavrasFaladas(slide, versao)
        const cabem = Math.floor(segundosNaVersao(slide, versao) * PALAVRAS_POR_SEGUNDO)
        expect(palavras, `slide ${slide.numero} (${slide.titulo}), versão ${versao}`).toBeLessThanOrEqual(
          cabem,
        )
      }
    }
  })

  it('cabe no teto de palavras: a tela não é teleprompter', () => {
    for (const slide of SLIDES_SR1) {
      expect(palavrasNaTela(slide.id), `slide ${slide.numero} (${slide.titulo})`).toBeLessThanOrEqual(
        TETO_DE_PALAVRAS_SR1,
      )
    }
  })

  it('todo texto de tela sai do conteúdo, e não do componente', () => {
    const frasesLongas = ler('src/components/sr1/slides.tsx')
      .replace(/\{\/\*[\s\S]*?\*\/\}?/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => !/[=<>{}"'`]/.test(linha))
      .filter((linha) => !linha.startsWith('*') && !linha.startsWith('//'))
      .filter((linha) => linha.split(/\s+/).filter(Boolean).length >= 5)
    expect(frasesLongas, `mova para apresentacao-sr1.ts: ${frasesLongas.join(' | ')}`).toEqual([])
  })

  it('não usa palavra difícil na tela nem na fala', () => {
    // A mesma lista do Kick-off: sete pessoas apresentam, e nem todas estão
    // dentro de cada parte. O que está entre parênteses é o termo que vale
    // ponto com a banca, depois da palavra simples.
    const DIFICEIS =
      /\b(consolida\w*|régua|aplicabilidade|homologa\w*|memória de cálculo|subindicador\w*|competência|gradação|atingimento|reproduzív\w*|sintétic\w*|instância|parametriz\w*)\b/i
    for (const slide of SLIDES_SR1) {
      const naTela = textoNaTela(slide.id).join(' ').replace(/\([^)]*\)/g, ' ')
      expect(naTela, `slide ${slide.numero} na tela`).not.toMatch(DIFICEIS)
      for (const nota of slide.notas) {
        expect(nota.replace(/\([^)]*\)/g, ' '), `slide ${slide.numero} na fala`).not.toMatch(DIFICEIS)
      }
    }
  })

  it('não usa travessão em nada que se lê ou se fala (regra 8 da casa)', () => {
    for (const slide of LISTA) {
      const textos = [
        slide.titulo,
        slide.apoio,
        slide.visual,
        ...slide.notas,
        ...(slide.perguntas ?? []),
        ...textoNaTela(slide.id as (typeof SLIDES_SR1)[number]['id']),
      ]
      for (const texto of textos) {
        expect(texto, `slide ${slide.numero}`).not.toMatch(/[—–]/)
        expect(texto.trim().length, `slide ${slide.numero}`).toBeGreaterThan(0)
      }
    }
  })

  it('maio continua com o número que fechou, e a regra nova é outra conta', () => {
    const [maioV2, maioV3, junhoV3] = TRES_CONTAS.map((c) => c.avaliacao)
    // O número do slide é o mesmo que a base guardou quando maio fechou.
    const guardada = BASE.avaliacoes.find(
      (a) => a.unidadeId === UNIDADE_DO_DECK && a.cicloId === 'ciclo-2026-05',
    )
    expect(guardada?.score).toBe(maioV2.score)
    expect(maioV3.score).not.toBe(maioV2.score)
    // Cada mês aponta para a versão que vale para ele: é isso que o slide diz.
    expect(regraVigente('2026-05', BASE.regras)?.id).toBe('regra-v2')
    expect(regraVigente('2026-06', BASE.regras)?.id).toBe('regra-v3')
    expect(junhoV3.memoria.passos.length).toBeGreaterThan(0)
    expect(DEMO_SR1.avaliacao).toBe(junhoV3)
    // Se junho estiver fechado na base, a reserva do slide é a mesma conta.
    const junhoGuardado = BASE.avaliacoes.find(
      (a) => a.unidadeId === UNIDADE_DO_DECK && a.cicloId === 'ciclo-2026-06',
    )
    if (junhoGuardado) expect(junhoGuardado.score).toBe(junhoV3.score)
  })

  it('diz no palco os números que o repositório sustenta', () => {
    const casos = ler('src/lib/calculo/motor.test.ts').match(/^\s*it\(/gm) ?? []
    expect(casos).toHaveLength(TESTES_DO_MOTOR)
    expect(TIPOS_DE_UNIDADE.depois).toContain(String(BASE.tiposUnidade.length))
    expect(ACHADOS_DA_PLANILHA[0].texto).toContain('1,7')
    // "As telas estão no ar" só vale se o release as abrir até o SR1.
    expect(TELAS_NO_SR1.length).toBeGreaterThanOrEqual(4)
  })

  it('presta conta dos três compromissos do Kick-off, sem pular nenhum', () => {
    expect(COMPROMISSOS_NO_SR1.map((c) => c.ciclo)).toEqual(
      COMPROMISSOS_ATE_O_SR1.map((c) => c.ciclo),
    )
    for (const item of COMPROMISSOS_NO_SR1) {
      expect(['feito', 'em parte', 'não feito']).toContain(item.estado)
      expect(item.porque.length).toBeGreaterThan(10)
    }
  })

  it('o caminho até o SR2 anda para a frente e termina no SR2', () => {
    const indices = PARADAS_ATE_O_SR2.map((p) => indiceDoCiclo(p.ciclo))
    expect(indices).toEqual([...indices].sort((a, b) => a - b))
    expect(indices[0]).toBeGreaterThan(indiceDoCiclo('sr1'))
    expect(PARADAS_ATE_O_SR2.at(-1)?.ciclo).toBe('sr2')
    expect(PARADAS_ATE_O_SR2.filter((p) => p.destaque)).toHaveLength(1)
  })

  it('o roteiro impresso traz o título, a fala e as respostas de cada slide', () => {
    const roteiro = ler('docs/pitch-sr1.md')
    for (const slide of LISTA) {
      expect(roteiro, `slide ${slide.numero}`).toContain(slide.titulo)
      for (const nota of slide.notas) expect(roteiro, `slide ${slide.numero}`).toContain(nota)
      for (const resposta of slide.perguntas ?? []) {
        expect(roteiro, `slide ${slide.numero}`).toContain(resposta)
      }
    }
  })

  it('a versão curta diz só o começo da fala de cada slide', () => {
    for (const slide of SLIDES_SR1_CURTA) {
      expect(notasNaVersao(slide, 'curta')).toEqual(slide.notas.slice(0, slide.curto!.notas))
    }
  })

  it('o PDF do SR1 está no rastreamento de arquivos, senão some no deploy', () => {
    const config = ler('next.config.ts')
    expect(config).toContain(ARQUIVO_PDF_SR1)
    expect(config).toContain('docs/sr1.pdf')
  })

  it('não traz dado de pessoa', () => {
    const tudo = JSON.stringify(SLIDES_SR1)
    expect(tudo).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
    expect(tudo).not.toMatch(/[\w.]+@[\w.]+\.\w+/)
  })
})
