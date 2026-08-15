import 'server-only'
import type {
  Area,
  Avaliacao,
  CicloAvaliacao,
  Gestor,
  Indicador,
  RegraDePontuacao,
} from '@/lib/calculo/tipos'
import { ORDEM_ESTADOS, type EstadoCiclo } from '@/lib/calculo/tipos'
import { repositorio } from './index'
import type { Panorama } from './tipos'

/**
 * Panorama com os atalhos que as telas usam.
 *
 * As buscas por id acontecem sobre o que já foi carregado, e não com uma ida
 * ao banco por item: uma tela que mostra trinta indicadores não deve virar
 * trinta consultas.
 */
export interface DadosDoSistema extends Panorama {
  areaPorId(id: string): Area | undefined
  gestorPorId(id: string): Gestor | undefined
  indicadorPorId(id: string): Indicador | undefined
  cicloPorId(id: string): CicloAvaliacao | undefined
  regraPorId(id: string): RegraDePontuacao | undefined
  indicadoresDaArea(areaId: string): Indicador[]
  ciclosFechados(): CicloAvaliacao[]
  cicloEmLancamento(): CicloAvaliacao | undefined
  cicloMaisRecenteFechado(): CicloAvaliacao | undefined
  proximoEstado(atual: EstadoCiclo): EstadoCiclo | null
}

const ESTADOS_FECHADOS: readonly EstadoCiclo[] = ['homologado', 'publicado']

export async function carregarDados(): Promise<DadosDoSistema> {
  const panorama = await repositorio().panorama()

  return {
    ...panorama,
    areaPorId: (id) => panorama.areas.find((a) => a.id === id),
    gestorPorId: (id) => panorama.gestores.find((g) => g.id === id),
    indicadorPorId: (id) => panorama.indicadores.find((i) => i.id === id),
    cicloPorId: (id) => panorama.ciclos.find((c) => c.id === id),
    regraPorId: (id) => panorama.regras.find((r) => r.id === id),
    indicadoresDaArea: (areaId) => panorama.indicadores.filter((i) => i.areaId === areaId),
    ciclosFechados: () => panorama.ciclos.filter((c) => ESTADOS_FECHADOS.includes(c.estado)),
    cicloEmLancamento: () => panorama.ciclos.find((c) => c.estado === 'lancamento_aberto'),
    cicloMaisRecenteFechado: () =>
      [...panorama.ciclos].reverse().find((c) => ESTADOS_FECHADOS.includes(c.estado)),
    proximoEstado: (atual) => {
      const posicao = ORDEM_ESTADOS.indexOf(atual)
      return posicao >= 0 && posicao < ORDEM_ESTADOS.length - 1
        ? ORDEM_ESTADOS[posicao + 1]
        : null
    },
  }
}

export async function lancamentosDoCiclo(cicloId: string) {
  return repositorio().lancamentos(cicloId)
}

/** Lançamento vigente de um indicador num ciclo: o último registrado vence. */
export function vigente<T extends { indicadorId: string; registradoEm: string }>(
  lancamentos: readonly T[],
  indicadorId: string,
): T | undefined {
  return [...lancamentos]
    .filter((l) => l.indicadorId === indicadorId)
    .sort((a, b) => (a.registradoEm < b.registradoEm ? 1 : -1))[0]
}

export async function avaliacoesDoGestor(gestorId: string): Promise<Avaliacao[]> {
  const avaliacoes = await repositorio().avaliacoes({ gestorId })
  return [...avaliacoes].sort((a, b) => a.cicloId.localeCompare(b.cicloId))
}

export async function avaliacoesDoCiclo(cicloId: string): Promise<Avaliacao[]> {
  return repositorio().avaliacoes({ cicloId })
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
