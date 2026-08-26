import { gerarBase, SEMENTE_PADRAO, type BaseSintetica } from './gerar'

/**
 * Base sintética do MVP, calculada uma vez por processo.
 *
 * Os dados vivem em memória, com semente fixa (§3). O acesso das telas passa
 * por `src/lib/dados/`, então trocar esta fonte por um banco é acrescentar um
 * driver — o schema guardado em `supabase/migrations/` ainda modela o domínio
 * anterior; a pendência está declarada em docs/banco.md.
 */
export const BASE: BaseSintetica = gerarBase(SEMENTE_PADRAO)

// A API de consulta das telas mora em src/lib/dados/consultas.ts, que enxerga
// também o overlay de escrita. Este módulo exporta só a base congelada: uma
// segunda API com os mesmos nomes, cega ao overlay, era convite a bug.

/**
 * Sinaliza lançamento suspeito de erro de digitação (§10.3).
 *
 * Heurística simples e explicável: valor a mais de 5 vezes a meta, ou a menos
 * de um quinto dela. SINALIZA, nunca bloqueia — a decisão continua humana.
 */
export function pareceErroDeDigitacao(valor: number, meta: number): boolean {
  if (meta <= 0) return false
  const razao = valor / meta
  return razao > 5 || razao < 0.2
}
