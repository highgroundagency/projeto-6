/**
 * REGENERA A SEÇÃO SLIDE A SLIDE de `docs/pitch-kickoff.md`.
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

const original = readFileSync(ARQUIVO, 'utf8')
const inicio = original.indexOf(ABRE)
const fim = original.indexOf(FECHA)
if (inicio < 0 || fim < 0) {
  throw new Error(`Marcadores ${ABRE} e ${FECHA} não encontrados em docs/pitch-kickoff.md`)
}

const novo = `${original.slice(0, inicio + ABRE.length)}\n\n${corpo()}\n\n${original.slice(fim)}`
writeFileSync(ARQUIVO, novo)
console.log(`Roteiro regenerado: ${SLIDES.length} slides, ${formatarTempo(inicioDoSlide(SLIDES.length))}.`)
