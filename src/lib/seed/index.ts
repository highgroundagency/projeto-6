import { gerarBase, SEMENTE_PADRAO, type BaseSintetica } from './gerar'
import type { Avaliacao, CicloAvaliacao, Gestor, Indicador } from '@/lib/calculo/tipos'

/**
 * Base sintética do MVP, calculada uma vez por processo.
 *
 * Nas fases 1–2 os dados vivem em memória (§3). Na F3 este módulo é trocado
 * por consultas ao Supabase, mantendo a mesma forma de dados.
 */
export const BASE: BaseSintetica = gerarBase(SEMENTE_PADRAO)

export function areaPorId(id: string) {
  return BASE.areas.find((a) => a.id === id)
}

export function gestorPorId(id: string): Gestor | undefined {
  return BASE.gestores.find((g) => g.id === id)
}

export function indicadorPorId(id: string): Indicador | undefined {
  return BASE.indicadores.find((i) => i.id === id)
}

export function cicloPorId(id: string): CicloAvaliacao | undefined {
  return BASE.ciclos.find((c) => c.id === id)
}

export function indicadoresDaArea(areaId: string): Indicador[] {
  return BASE.indicadores.filter((i) => i.areaId === areaId)
}

export function lancamentosDoCiclo(cicloId: string) {
  return BASE.lancamentos.filter((l) => l.cicloId === cicloId)
}

export function avaliacaoDe(gestorId: string, cicloId: string): Avaliacao | undefined {
  return BASE.avaliacoes.find((a) => a.gestorId === gestorId && a.cicloId === cicloId)
}

export function avaliacoesDoGestor(gestorId: string): Avaliacao[] {
  return BASE.avaliacoes
    .filter((a) => a.gestorId === gestorId)
    .sort((a, b) => a.cicloId.localeCompare(b.cicloId))
}

export function avaliacoesDoCiclo(cicloId: string): Avaliacao[] {
  return BASE.avaliacoes.filter((a) => a.cicloId === cicloId)
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
