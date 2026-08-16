/**
 * Aritmética de datas civis no fuso do projeto (America/Recife).
 *
 * Regras da casa:
 * - Data é sempre `YYYY-MM-DD` (string), nunca `Date`.
 * - Comparar datas = comparar strings ISO (ordem lexicográfica = ordem cronológica).
 * - "Hoje" nunca é lido dentro de função de regra de negócio: é sempre injetado,
 *   para que os testes rodem igual em qualquer máquina.
 */

export const FUSO_PROJETO = 'America/Recife'

/** Data civil no formato `YYYY-MM-DD`. */
export type DataISO = string

const FORMATADOR_ISO = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO_PROJETO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Data civil de "agora" no fuso do projeto.
 *
 * Montada a partir de `formatToParts` para não depender de como cada locale
 * ordena os campos. Nunca use `toISOString().slice(0, 10)`: isso devolve a data
 * em UTC e erra o dia toda noite depois das 21h em Recife.
 */
export function hojeEmRecife(agora: Date = new Date()): DataISO {
  const partes = FORMATADOR_ISO.formatToParts(agora)
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? ''
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}

const PADRAO_ISO = /^\d{4}-\d{2}-\d{2}$/

export function ehDataISO(valor: string): boolean {
  if (!PADRAO_ISO.test(valor)) return false
  const [ano, mes, dia] = valor.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1, dia))
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
}

function paraEpochUTC(data: DataISO): number {
  const [ano, mes, dia] = data.split('-').map(Number)
  return Date.UTC(ano, mes - 1, dia)
}

const MS_POR_DIA = 86_400_000

/** Soma (ou subtrai) dias numa data civil. Puro, sem fuso: a conta é feita em UTC. */
export function somarDias(data: DataISO, dias: number): DataISO {
  const alvo = new Date(paraEpochUTC(data) + dias * MS_POR_DIA)
  return `${alvo.getUTCFullYear()}-${pad(alvo.getUTCMonth() + 1)}-${pad(alvo.getUTCDate())}`
}

/** Dias inteiros de `de` até `ate`. Negativo se `ate` for anterior. */
export function diferencaEmDias(de: DataISO, ate: DataISO): number {
  return Math.round((paraEpochUTC(ate) - paraEpochUTC(de)) / MS_POR_DIA)
}

export function formatarBR(data: DataISO): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function formatarExtenso(data: DataISO): string {
  const [ano, mes, dia] = data.split('-').map(Number)
  return `${dia} de ${MESES[mes - 1]} de ${ano}`
}

const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]

export function diaDaSemana(data: DataISO): string {
  return DIAS_SEMANA[new Date(paraEpochUTC(data)).getUTCDay()]
}
