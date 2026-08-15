import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Leitor mínimo de Markdown para os documentos de `docs/`.
 *
 * Suporta o que a equipe realmente usa nesses arquivos — títulos, parágrafos,
 * listas e tabelas — sem trazer um parser inteiro para o bundle. Se algum dia
 * precisar de mais que isso, troque por `remark` e registre um ADR.
 */

export type NoMarkdown =
  | { tipo: 'titulo'; nivel: 1 | 2 | 3; texto: string }
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'lista'; ordenada: boolean; itens: string[] }
  | { tipo: 'tabela'; colunas: string[]; linhas: string[][] }

export async function lerDoc(nome: string): Promise<string> {
  return readFile(join(process.cwd(), 'docs', nome), 'utf8')
}

function celulas(linha: string): string[] {
  return linha
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim())
}

const ehSeparadorDeTabela = (linha: string) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(linha)

export function analisarMarkdown(bruto: string): NoMarkdown[] {
  const linhas = bruto.split('\n')
  const nos: NoMarkdown[] = []
  let i = 0

  while (i < linhas.length) {
    const linha = linhas[i]

    if (!linha.trim()) {
      i++
      continue
    }

    const titulo = /^(#{1,3})\s+(.*)$/.exec(linha)
    if (titulo) {
      nos.push({
        tipo: 'titulo',
        nivel: titulo[1].length as 1 | 2 | 3,
        texto: titulo[2].trim(),
      })
      i++
      continue
    }

    // Tabela: cabeçalho + separador + linhas
    if (linha.includes('|') && ehSeparadorDeTabela(linhas[i + 1] ?? '')) {
      const colunas = celulas(linha)
      const corpo: string[][] = []
      i += 2
      while (i < linhas.length && linhas[i].includes('|')) {
        corpo.push(celulas(linhas[i]))
        i++
      }
      nos.push({ tipo: 'tabela', colunas, linhas: corpo })
      continue
    }

    const itemLista = /^\s*([-*]|\d+\.)\s+(.*)$/.exec(linha)
    if (itemLista) {
      const ordenada = /\d/.test(itemLista[1])
      const itens: string[] = []
      while (i < linhas.length) {
        const item = /^\s*([-*]|\d+\.)\s+(.*)$/.exec(linhas[i])
        if (!item) break
        itens.push(item[2].trim())
        i++
      }
      nos.push({ tipo: 'lista', ordenada, itens })
      continue
    }

    const paragrafo: string[] = []
    while (i < linhas.length && linhas[i].trim() && !/^(#{1,3}\s|\s*[-*]\s|\d+\.\s)/.test(linhas[i])) {
      paragrafo.push(linhas[i].trim())
      i++
    }
    nos.push({ tipo: 'paragrafo', texto: paragrafo.join(' ') })
  }

  return nos
}

/** Converte a ênfase inline (`**forte**` e `` `mono` ``) em segmentos tipados. */
export type Segmento = { texto: string; forte?: boolean; mono?: boolean }

export function segmentar(texto: string): Segmento[] {
  const segmentos: Segmento[] = []
  const padrao = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let ultimo = 0

  for (const achado of texto.matchAll(padrao)) {
    const inicio = achado.index ?? 0
    if (inicio > ultimo) segmentos.push({ texto: texto.slice(ultimo, inicio) })

    const trecho = achado[0]
    if (trecho.startsWith('**')) {
      segmentos.push({ texto: trecho.slice(2, -2), forte: true })
    } else {
      segmentos.push({ texto: trecho.slice(1, -1), mono: true })
    }
    ultimo = inicio + trecho.length
  }

  if (ultimo < texto.length) segmentos.push({ texto: texto.slice(ultimo) })
  return segmentos
}
