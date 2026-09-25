/**
 * REGENERA A SEÇÃO SLIDE A SLIDE de `docs/pitch-kickoff.md`, de `docs/ml-av1.md` e de
 * `docs/pitch-sr1.md`.
 *
 * O documento é a versão para ler e ensaiar longe do navegador, e um teste em
 * `src/content/pitch.test.ts` exige que ele contenha o título e cada fala de
 * cada slide. Quando o deck tinha nove slides isso se mantinha à mão; com
 * dezessete, manter à mão é garantia de divergência.
 *
 * Só o miolo entre os marcadores é gerado. A prosa em volta, as correções do
 * roteiro original e as pendências continuam escritas por gente.
 *
 *     npm run roteiro
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { nomeCurto } from '../src/content/equipe'
import { SLIDES, formatarTempo, inicioDoSlide, palavrasNaTela } from '../src/content/pitch'
import {
  ETAPAS,
  SLIDES_ML,
  type SlideML,
  type SlideMLId,
  inicioDoSlideML,
  palavrasNaTela as palavrasNaTelaML,
} from '../src/content/apresentacao-ml'
import {
  SLIDES_SR1,
  type SlideSR1,
  type SlideSR1Id,
  inicioNaVersao,
  palavrasNaTela as palavrasNaTelaSR1,
} from '../src/content/apresentacao-sr1'

const ARQUIVO = join(process.cwd(), 'docs', 'pitch-kickoff.md')
const ABRE = '<!-- roteiro:inicio -->'
const FECHA = '<!-- roteiro:fim -->'

function corpo(): string {
  return SLIDES.map((slide, indice) => {
    const quem = nomeCurto(slide.quemFala)
    const falas = slide.notas.map((nota) => `  1. ${nota}`).join('\n')
    return [
      `### Slide ${slide.numero}: ${slide.titulo}`,
      '',
      `- **Começa em** ${formatarTempo(inicioDoSlide(indice))} · **dura** ${formatarTempo(slide.segundos)} · **quem fala:** ${quem} · **${palavrasNaTela(slide.id)} palavras na tela**`,
      `- **Frase da tela:** ${slide.apoio}`,
      `- **O que a tela mostra:** ${slide.visual}`,
      '- **A fala:**',
      falas,
    ].join('\n')
  }).join('\n\n')
}

/** A AV1 de machine learning: sem "quem fala", com a etapa da avaliação. */
function corpoML(): string {
  return (SLIDES_ML as readonly SlideML[]).map((slide, indice) => {
    const falas = slide.notas.map((nota) => `  1. ${nota}`).join('\n')
    const etapa = slide.etapa ? `etapa ${slide.etapa}, ${ETAPAS[slide.etapa]}` : 'abertura e fechamento'
    return [
      `### Slide ${slide.numero}: ${slide.titulo}`,
      '',
      `- **Começa em** ${formatarTempo(inicioDoSlideML(indice))} · **dura** ${formatarTempo(slide.segundos)} · **${etapa}** · **${palavrasNaTelaML(slide.id as SlideMLId)} palavras na tela**`,
      `- **Frase da tela:** ${slide.apoio}`,
      `- **O que a tela mostra:** ${slide.visual}`,
      '- **A fala:**',
      falas,
      ...(slide.perguntas?.length
        ? ['- **Se perguntarem** (fora do tempo):', ...slide.perguntas.map((p) => `  - ${p}`)]
        : []),
    ].join('\n')
  }).join('\n\n')
}

/** O SR1: quem fala, e o que entra na versão de cinco minutos. */
function corpoSR1(): string {
  return (SLIDES_SR1 as readonly SlideSR1[]).map((slide, indice) => {
    const falas = slide.notas.map((nota) => `  1. ${nota}`).join('\n')
    const curta = slide.curto
      ? `**na versão de 5 min:** ${formatarTempo(slide.curto.segundos)}, ${slide.curto.notas === slide.notas.length ? 'a fala inteira' : slide.curto.notas === 1 ? 'só a primeira fala' : `só as ${slide.curto.notas} primeiras falas`}`
      : '**fora da versão de 5 min**'
    return [
      `### Slide ${slide.numero}: ${slide.titulo}`,
      '',
      `- **Começa em** ${formatarTempo(inicioNaVersao(indice, 'completa'))} · **dura** ${formatarTempo(slide.segundos)} · **quem fala:** ${nomeCurto(slide.quemFala)} · **${palavrasNaTelaSR1(slide.id as SlideSR1Id)} palavras na tela**`,
      `- ${curta}`,
      `- **Frase da tela:** ${slide.apoio}`,
      `- **O que a tela mostra:** ${slide.visual}`,
      '- **A fala:**',
      falas,
      ...(slide.perguntas?.length
        ? ['- **Se perguntarem** (fora do tempo):', ...slide.perguntas.map((p) => `  - ${p}`)]
        : []),
    ].join('\n')
  }).join('\n\n')
}

/** Troca só o miolo entre os dois marcadores; a prosa em volta é de gente. */
function regenerar(arquivo: string, abre: string, fecha: string, miolo: string): void {
  const original = readFileSync(arquivo, 'utf8')
  const inicio = original.indexOf(abre)
  const fim = original.indexOf(fecha)
  if (inicio < 0 || fim < 0) {
    throw new Error(`Marcadores ${abre} e ${fecha} não encontrados em ${arquivo}`)
  }
  writeFileSync(arquivo, `${original.slice(0, inicio + abre.length)}\n\n${miolo}\n\n${original.slice(fim)}`)
}

regenerar(ARQUIVO, ABRE, FECHA, corpo())
console.log(`Roteiro regenerado: ${SLIDES.length} slides, ${formatarTempo(inicioDoSlide(SLIDES.length))}.`)

regenerar(
  join(process.cwd(), 'docs', 'ml-av1.md'),
  '<!-- roteiro-ml:inicio -->',
  '<!-- roteiro-ml:fim -->',
  corpoML(),
)
console.log(
  `Roteiro da AV1 de ML regenerado: ${SLIDES_ML.length} slides, ${formatarTempo(inicioDoSlideML(SLIDES_ML.length))}.`,
)

regenerar(
  join(process.cwd(), 'docs', 'pitch-sr1.md'),
  '<!-- roteiro-sr1:inicio -->',
  '<!-- roteiro-sr1:fim -->',
  corpoSR1(),
)
console.log(
  `Roteiro do SR1 regenerado: ${SLIDES_SR1.length} slides, ${formatarTempo(inicioNaVersao(SLIDES_SR1.length, 'completa'))}.`,
)
