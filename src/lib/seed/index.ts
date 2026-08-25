import { gerarBase, SEMENTE_PADRAO, type BaseSintetica } from './gerar'
import type {
  Avaliacao,
  AvaliacaoDistrital,
  CicloAvaliacao,
  Gerente,
  Indicador,
  Subindicador,
  Unidade,
} from '@/lib/calculo/tipos'

/**
 * Base sintética do MVP, calculada uma vez por processo.
 *
 * Os dados vivem em memória, com semente fixa (§3). O acesso das telas passa
 * por `src/lib/dados/`, então trocar esta fonte por um banco é acrescentar um
 * driver — o schema guardado em `supabase/migrations/` ainda modela o domínio
 * anterior; a pendência está declarada em docs/banco.md.
 */
export const BASE: BaseSintetica = gerarBase(SEMENTE_PADRAO)

export function distritoPorId(id: string) {
  return BASE.distritos.find((d) => d.id === id)
}

export function tipoUnidadePorId(id: string) {
  return BASE.tiposUnidade.find((t) => t.id === id)
}

export function unidadePorId(id: string): Unidade | undefined {
  return BASE.unidades.find((u) => u.id === id)
}

export function unidadesDoDistrito(distritoId: string): Unidade[] {
  return BASE.unidades.filter((u) => u.distritoId === distritoId)
}

export function gerentePorId(id: string): Gerente | undefined {
  return BASE.gerentes.find((g) => g.id === id)
}

export function indicadorPorId(id: string): Indicador | undefined {
  return BASE.indicadores.find((i) => i.id === id)
}

export function subindicadorPorId(id: string): Subindicador | undefined {
  return BASE.subindicadores.find((s) => s.id === id)
}

export function subindicadoresDoIndicador(indicadorId: string): Subindicador[] {
  return BASE.subindicadores.filter((s) => s.indicadorId === indicadorId)
}

export function cicloPorId(id: string): CicloAvaliacao | undefined {
  return BASE.ciclos.find((c) => c.id === id)
}

export function lancamentosDoCiclo(cicloId: string) {
  return BASE.lancamentos.filter((l) => l.cicloId === cicloId)
}

export function avaliacaoDe(unidadeId: string, cicloId: string): Avaliacao | undefined {
  return BASE.avaliacoes.find((a) => a.unidadeId === unidadeId && a.cicloId === cicloId)
}

export function avaliacoesDaUnidade(unidadeId: string): Avaliacao[] {
  return BASE.avaliacoes
    .filter((a) => a.unidadeId === unidadeId)
    .sort((a, b) => a.cicloId.localeCompare(b.cicloId))
}

export function avaliacoesDoCiclo(cicloId: string): Avaliacao[] {
  return BASE.avaliacoes.filter((a) => a.cicloId === cicloId)
}

export function avaliacaoDistritalDe(
  distritoId: string,
  cicloId: string,
): AvaliacaoDistrital | undefined {
  return BASE.avaliacoesDistritais.find(
    (a) => a.distritoId === distritoId && a.cicloId === cicloId,
  )
}

export function regraPorId(id: string) {
  return BASE.regras.find((r) => r.id === id)
}

/** Ciclo mais recente que já tem resultado publicado ou homologado. */
export function cicloMaisRecenteFechado(): CicloAvaliacao | undefined {
  return [...BASE.ciclos]
    .reverse()
    .find((c) => c.estado === 'publicado' || c.estado === 'homologado')
}

/** Ciclo em lançamento, se houver. */
export function cicloEmLancamento(): CicloAvaliacao | undefined {
  return BASE.ciclos.find((c) => c.estado === 'lancamento_aberto')
}

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
