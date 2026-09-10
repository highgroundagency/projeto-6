/**
 * A REGRA DO TECLADO DO DECK, fora do componente.
 *
 * Ela morava dentro de um `useEffect`, e por isso só podia ser exercitada com
 * um navegador de verdade. Foi ali que o pior defeito do pitch se escondeu: o
 * guard ignorava a tecla sempre que o foco estivesse num botão, num link ou
 * num sumário, e como o script que gera o PDF navega sem nunca clicar, nenhum
 * teste via o problema. Quem apresenta clica; e do primeiro clique em diante
 * o teclado inteiro morria.
 *
 * Aqui é função pura sobre a tecla e o elemento em foco: `teclado.test.ts`
 * cobre a tabela inteira, incluindo os casos que ninguém lembra de testar à
 * mão. Sem `'use client'` e sem importar conteúdo: este módulo é carregado
 * pelo componente cliente, e conteúdo de ciclo não pode chegar ao bundle.
 */

export type AcaoDoDeck =
  | 'avancar'
  | 'voltar'
  | 'inicio'
  | 'fim'
  | 'notas'
  | 'tela-cheia'
  | 'zerar'
  | 'imprimir'

/** O mínimo de um evento de teclado que a decisão precisa conhecer. */
export interface TeclaDoDeck {
  readonly key: string
  readonly metaKey?: boolean
  readonly ctrlKey?: boolean
  readonly altKey?: boolean
}

/** Onde a tecla é de quem digita, não do deck: ali a seta move o cursor. */
export function engoleTecla(alvo: Element | null): boolean {
  return Boolean(alvo?.closest('input, select, textarea, [contenteditable="true"]'))
}

/**
 * Controle que o próprio navegador aciona com a barra de espaço.
 *
 * Botão, link e sumário. Com o foco num deles, avançar o slide TAMBÉM daria
 * dois passos numa tecla só. As setas continuam valendo: ali elas não têm
 * significado nativo nenhum.
 */
export function ehControle(alvo: Element | null): boolean {
  return Boolean(alvo?.closest('button, a, summary'))
}

const ACOES: Record<string, AcaoDoDeck> = {
  ArrowRight: 'avancar',
  ArrowDown: 'avancar',
  PageDown: 'avancar',
  j: 'avancar',
  ' ': 'avancar',
  ArrowLeft: 'voltar',
  ArrowUp: 'voltar',
  PageUp: 'voltar',
  Backspace: 'voltar',
  k: 'voltar',
  Home: 'inicio',
  End: 'fim',
  n: 'notas',
  f: 'tela-cheia',
  r: 'zerar',
  p: 'imprimir',
}

/**
 * A ação do deck para esta tecla neste foco, ou `null` quando a tecla não é
 * nossa.
 */
export function acaoDaTecla(evento: TeclaDoDeck, alvo: Element | null): AcaoDoDeck | null {
  if (evento.metaKey || evento.ctrlKey || evento.altKey) return null
  if (engoleTecla(alvo)) return null
  if (evento.key === ' ' && ehControle(alvo)) return null
  return ACOES[evento.key] ?? null
}

/** As ações em que vale impedir o comportamento padrão do navegador. */
export function impedePadrao(acao: AcaoDoDeck): boolean {
  return acao !== 'notas' && acao !== 'tela-cheia' && acao !== 'zerar'
}
