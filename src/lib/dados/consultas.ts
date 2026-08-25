import 'server-only'
import type {
  Aplicabilidade,
  Avaliacao,
  AvaliacaoDistrital,
  CicloAvaliacao,
  Distrito,
  Gerente,
  Indicador,
  RegraDePontuacao,
  Subindicador,
  TipoUnidade,
  Unidade,
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
  distritoPorId(id: string): Distrito | undefined
  tipoUnidadePorId(id: string): TipoUnidade | undefined
  unidadePorId(id: string): Unidade | undefined
  gerentePorId(id: string): Gerente | undefined
  indicadorPorId(id: string): Indicador | undefined
  subindicadorPorId(id: string): Subindicador | undefined
  cicloPorId(id: string): CicloAvaliacao | undefined
  regraPorId(id: string): RegraDePontuacao | undefined
  unidadesDoDistrito(distritoId: string): Unidade[]
  subindicadoresDoIndicador(indicadorId: string): Subindicador[]
  /** Indicadores que valem para um tipo de unidade sob uma regra, na ordem do catálogo. */
  indicadoresDoTipo(
    tipoUnidadeId: string,
    regra: RegraDePontuacao,
  ): { indicador: Indicador; aplicabilidade: Aplicabilidade }[]
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
    distritoPorId: (id) => panorama.distritos.find((d) => d.id === id),
    tipoUnidadePorId: (id) => panorama.tiposUnidade.find((t) => t.id === id),
    unidadePorId: (id) => panorama.unidades.find((u) => u.id === id),
    gerentePorId: (id) => panorama.gerentes.find((g) => g.id === id),
    indicadorPorId: (id) => panorama.indicadores.find((i) => i.id === id),
    subindicadorPorId: (id) => panorama.subindicadores.find((s) => s.id === id),
    cicloPorId: (id) => panorama.ciclos.find((c) => c.id === id),
    regraPorId: (id) => panorama.regras.find((r) => r.id === id),
    unidadesDoDistrito: (distritoId) =>
      panorama.unidades.filter((u) => u.distritoId === distritoId),
    subindicadoresDoIndicador: (indicadorId) =>
      panorama.subindicadores.filter((s) => s.indicadorId === indicadorId),
    indicadoresDoTipo: (tipoUnidadeId, regra) =>
      panorama.indicadores.flatMap((indicador) => {
        const aplicabilidade = regra.aplicabilidades.find(
          (a) => a.tipoUnidadeId === tipoUnidadeId && a.indicadorId === indicador.id,
        )
        return aplicabilidade ? [{ indicador, aplicabilidade }] : []
      }),
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

/** Lançamento vigente de um subindicador numa unidade: o último registrado vence. */
export function vigente<
  T extends { subindicadorId: string; unidadeId: string; registradoEm: string },
>(lancamentos: readonly T[], subindicadorId: string, unidadeId: string): T | undefined {
  return [...lancamentos]
    .filter((l) => l.subindicadorId === subindicadorId && l.unidadeId === unidadeId)
    .sort((a, b) => (a.registradoEm < b.registradoEm ? 1 : -1))[0]
}

export async function avaliacoesDaUnidade(unidadeId: string): Promise<Avaliacao[]> {
  const avaliacoes = await repositorio().avaliacoes({ unidadeId })
  return [...avaliacoes].sort((a, b) => a.cicloId.localeCompare(b.cicloId))
}

export async function avaliacoesDoCiclo(cicloId: string): Promise<Avaliacao[]> {
  return repositorio().avaliacoes({ cicloId })
}

export async function avaliacoesDistritaisDoDistrito(
  distritoId: string,
): Promise<AvaliacaoDistrital[]> {
  const avaliacoes = await repositorio().avaliacoesDistritais({ distritoId })
  return [...avaliacoes].sort((a, b) => a.cicloId.localeCompare(b.cicloId))
}

export async function avaliacoesDistritaisDoCiclo(
  cicloId: string,
): Promise<AvaliacaoDistrital[]> {
  return repositorio().avaliacoesDistritais({ cicloId })
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
