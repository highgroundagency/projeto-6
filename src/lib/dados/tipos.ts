import type {
  Area,
  Avaliacao,
  CicloAvaliacao,
  Contestacao,
  EventoAuditoria,
  Gestor,
  Indicador,
  Lancamento,
  RegraDePontuacao,
} from '@/lib/calculo/tipos'

/**
 * Camada de dados do sistema.
 *
 * Existe para que as telas não saibam de onde os dados vêm. Nas fases 1–2 o
 * driver é o seed em memória; na F3, o Supabase com RLS. A forma dos dados é a
 * mesma nos dois — foi assim que a migração virou troca de driver, e não
 * reescrita de tela.
 */

export interface Panorama {
  readonly areas: readonly Area[]
  readonly gestores: readonly Gestor[]
  readonly indicadores: readonly Indicador[]
  readonly regras: readonly RegraDePontuacao[]
  readonly ciclos: readonly CicloAvaliacao[]
}

export interface FiltroAvaliacao {
  gestorId?: string
  cicloId?: string
}

export interface EntradaLancamento {
  indicadorId: string
  cicloId: string
  valor: number
  evidencia: string
  autor: string
}

export interface EntradaContestacao {
  gestorId: string
  cicloId: string
  indicadorId: string | null
  motivo: string
}

export interface Resultado {
  ok: boolean
  mensagem: string
}

export interface RepositorioDados {
  /** Nome do driver, exibido em /status. */
  readonly nome: string
  /** true quando as escritas sobrevivem ao reinício do processo. */
  readonly persistente: boolean

  panorama(): Promise<Panorama>
  lancamentos(cicloId?: string): Promise<Lancamento[]>
  avaliacoes(filtro?: FiltroAvaliacao): Promise<Avaliacao[]>
  contestacoes(gestorId?: string): Promise<Contestacao[]>
  eventos(limite?: number): Promise<EventoAuditoria[]>

  registrarLancamento(entrada: EntradaLancamento, agora: string): Promise<Resultado>
  avancarCiclo(cicloId: string, autor: string, agora: string): Promise<Resultado>
  abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado>
}
