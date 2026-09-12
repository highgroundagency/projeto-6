import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EQUIPE, INTEGRANTES_FUNDADORES } from './equipe'
import {
  ARQUIVO_PDF,
  CONTAGENS_PITCH,
  DEMO_PITCH,
  LEGENDAS_DA_BASE,
  DURACAO_PITCH_SEGUNDOS,
  SLIDES,
  TETO_DE_PALAVRAS_POR_SLIDE,
  formatarTempo,
  inicioDoSlide,
  palavrasNaTela,
  tempoPorIntegrante,
  textoNaTela,
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
  it('tem dezessete slides numerados em sequência, com ids únicos', () => {
    expect(SLIDES).toHaveLength(17)
    expect(SLIDES.map((s) => s.numero)).toEqual(
      Array.from({ length: SLIDES.length }, (_, i) => i + 1),
    )
    expect(new Set(SLIDES.map((s) => s.id)).size).toBe(SLIDES.length)
  })

  it('fecha em 9:00, com um minuto de margem dentro dos dez liberados', () => {
    const soma = SLIDES.reduce((total, s) => total + s.segundos, 0)
    expect(soma).toBe(DURACAO_PITCH_SEGUNDOS)
    // O limite é 10 minutos, liberados pelo professor sobre os 5 da diretriz.
    // A margem de um minuto inteiro é de propósito: ensaio que fecha no limite
    // estoura no dia.
    expect(soma).toBeLessThanOrEqual(540)
    expect(formatarTempo(soma)).toBe('9:00')
    expect(inicioDoSlide(0)).toBe(0)
    expect(inicioDoSlide(SLIDES.length)).toBe(DURACAO_PITCH_SEGUNDOS)
  })

  it('distribui a fala entre quem já estava na equipe, e só entre integrantes', () => {
    const ids = new Set(EQUIPE.map((i) => i.id))
    for (const slide of SLIDES) expect(ids.has(slide.quemFala)).toBe(true)
    // Contra os FUNDADORES, não contra a equipe inteira. Quem entra no meio do
    // semestre aparece na capa, porque está na sala, e não recebe bloco de
    // fala num pitch que já estava dividido e ensaiado: dar um seria inventar
    // participação. Quando a pessoa nova tiver semanas de trabalho atrás dela,
    // ela entra no roteiro do SR1 como qualquer outra.
    expect(new Set(SLIDES.map((s) => s.quemFala)).size).toBe(INTEGRANTES_FUNDADORES.length)
    // Ninguém fala menos de trinta segundos nem mais de um minuto e meio.
    for (const [, segundos] of tempoPorIntegrante()) {
      // A faixa acompanhou o deck: com 9 minutos entre seis pessoas, a média
      // é de 90 segundos cada. O que o teste impede é alguém sumir da
      // apresentação ou tomar conta dela.
      expect(segundos).toBeGreaterThanOrEqual(30)
      expect(segundos).toBeLessThanOrEqual(130)
    }
  })

  it('cabe no teto de palavras: a tela não é teleprompter', () => {
    // A primeira versão do deck tinha 1.127 palavras na tela para 4:55 de
    // fala, e quase todas repetiam a nota do apresentador. Este teste existe
    // para o corte não voltar sozinho na próxima edição.
    for (const slide of SLIDES) {
      const palavras = palavrasNaTela(slide.id)
      expect(palavras, `slide ${slide.numero} (${slide.titulo})`).toBeLessThanOrEqual(
        TETO_DE_PALAVRAS_POR_SLIDE,
      )
    }
    const total = SLIDES.reduce((soma, slide) => soma + palavrasNaTela(slide.id), 0)
    // Dezessete slides a uma média de cinquenta palavras. O teto POR SLIDE
    // não subiu quando o deck dobrou: mais slides, não mais texto por slide.
    expect(total).toBeLessThan(900)
  })

  it('todo texto de tela sai de pitch.ts, e não do componente', () => {
    // O teto acima só vale se o componente não escrever texto por conta
    // própria. Nenhum literal de conteúdo em slides.tsx: o que ele tem são
    // classes, nomes de campo e o rótulo dos elementos estruturais.
    const frasesLongas = ler('src/components/pitch/slides.tsx')
      // Comentário explica a decisão e não chega à tela: fora da conta. Sem
      // isto, documentar o componente deixa o teste vermelho, e o remédio
      // vira parar de documentar.
      .replace(/\{\/\*[\s\S]*?\*\/\}?/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((linha) => linha.trim())
      // Nó de texto JSX é uma linha sem código: sem atributo, sem chave, sem
      // aspas e sem tag. Sobra prosa, e prosa aqui é conteúdo fora do lugar.
      .filter((linha) => !/[=<>{}"'`]/.test(linha))
      .filter((linha) => !linha.startsWith('*') && !linha.startsWith('//'))
      .filter((linha) => !linha.startsWith('/*') && !linha.endsWith('*/'))
      .filter((linha) => linha.split(/\s+/).filter(Boolean).length >= 5)
    expect(frasesLongas, `mova para src/content/pitch.ts: ${frasesLongas.join(' | ')}`).toEqual([])
  })

  it('a tela do slide da demonstração não repete a explicação da fala', () => {
    // O que aparece ali é a interface real do sistema; a explicação de como
    // ler a memória é da fala, e o CSS esconde o parágrafo no deck e no papel.
    const naTela = textoNaTela('ideia').join(' ')
    expect(naTela).not.toContain('Como ler')
    expect(palavrasNaTela('ideia')).toBeLessThan(20)
  })

  it('não usa palavra difícil na tela nem na fala', () => {
    // Quem apresenta são os seis, e nem todos estão dentro de cada parte do
    // projeto: a pessoa precisa entender o slide enquanto lê. Termo técnico
    // que vale ponto com a banca entra entre parênteses, depois da palavra
    // simples, e por isso a checagem ignora o que está entre parênteses.
    const DIFICEIS =
      /\b(consolida\w*|régua|aplicabilidade|homologa\w*|memória de cálculo|subindicador\w*|competência|gradação|atingimento|reproduzív\w*|sintétic\w*|instância|parametriz\w*)\b/i

    for (const slide of SLIDES) {
      const naTela = textoNaTela(slide.id)
        .join(' ')
        .replace(/\([^)]*\)/g, ' ')
      expect(naTela, `slide ${slide.numero} na tela`).not.toMatch(DIFICEIS)

      for (const nota of slide.notas) {
        expect(nota.replace(/\([^)]*\)/g, ' '), `slide ${slide.numero} na fala`).not.toMatch(
          DIFICEIS,
        )
      }
    }
  })

  it('não usa travessão em texto de tela (regra 8 da casa)', () => {
    for (const slide of SLIDES) {
      const textos = [slide.titulo, slide.apoio, slide.visual, ...slide.notas, ...textoNaTela(slide.id)]
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

  it('as legendas do slide de dados não mentem sobre a base', () => {
    expect(LEGENDAS_DA_BASE.unidades).toBe(
      `em ${BASE.distritos.length} distritos, de ${BASE.tiposUnidade.length} tipos`,
    )
    expect(LEGENDAS_DA_BASE.subindicadores).toBe(
      `dentro de ${BASE.indicadores.length} indicadores`,
    )
  })

  it('o PDF do pitch está no rastreamento de arquivos, senão some no deploy', () => {
    // `readFile(join(process.cwd(), ...))` é invisível para o rastreador do
    // Next: sem esta linha a rota funciona no repositório e devolve 404 em
    // produção, justamente no dia em que alguém precisa do PDF.
    const config = ler('next.config.ts')
    expect(config).toContain(ARQUIVO_PDF)
    expect(config).toContain('docs/pitch-kickoff.pdf')
  })

  it('o componente cliente do deck não importa conteúdo (regra 3 da casa)', () => {
    for (const caminho of ['src/components/pitch/deck.tsx', 'src/components/pitch/teclado.ts']) {
      const fonte = ler(caminho)
      expect(fonte, caminho).not.toMatch(/@\/content\//)
      expect(fonte, caminho).not.toMatch(/ciclos\//)
    }
    expect(ler('src/components/pitch/deck.tsx').startsWith("'use client'")).toBe(true)
  })
})
