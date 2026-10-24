import type {
  Avaliacao,
  AvaliacaoDistrital,
  CicloAvaliacao,
  Contestacao,
  Distrito,
  EventoAuditoria,
  Gerente,
  Indicador,
  Lancamento,
  RegraDePontuacao,
  Subindicador,
  TipoUnidade,
  Unidade,
} from '@/lib/calculo/tipos'

/**
 * Camada de dados do sistema.
 *
 * Existe para que as telas não saibam de onde os dados vêm. Hoje o driver é o
 * seed em memória. O schema de banco guardado em `supabase/migrations/` ainda
 * modela o domínio anterior (pendência em docs/banco.md), então ligar uma
 * fonte persistente depois é acrescentar um driver e atualizar o SQL — não
 * reescrever tela.
 */

export interface Panorama {
  readonly distritos: readonly Distrito[]
  readonly tiposUnidade: readonly TipoUnidade[]
  readonly unidades: readonly Unidade[]
  readonly gerentes: readonly Gerente[]
  readonly indicadores: readonly Indicador[]
  readonly subindicadores: readonly Subindicador[]
  readonly regras: readonly RegraDePontuacao[]
  readonly ciclos: readonly CicloAvaliacao[]
}

export interface FiltroAvaliacao {
  unidadeId?: string
  cicloId?: string
}

export interface FiltroAvaliacaoDistrital {
  distritoId?: string
  cicloId?: string
}

export interface EntradaLancamento {
  subindicadorId: string
  unidadeId: string
  cicloId: string
  valor: number | null
  numerador: number | null
  denominador: number | null
  evidencia: string
  autor: string
  /** Perfil de quem lançou, para a trilha dizer a verdade (SEAB também lança). */
  perfil: string
}

export interface EntradaContestacao {
  gerenteId: string
  cicloId: string
  indicadorId: string | null
  motivo: string
  /** Perfil de quem abriu, para a trilha. */
  perfil: string
}

export interface EntradaResposta {
  contestacaoId: string
  decisao: 'acatada' | 'recusada'
  texto: string
  autor: string
  perfil: string
}

export interface EntradaExportacao {
  cicloId: string
  distritoId: string | null
  anonimo: boolean
  linhas: number
  autor: string
  perfil: string
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
  avaliacoesDistritais(filtro?: FiltroAvaliacaoDistrital): Promise<AvaliacaoDistrital[]>
  contestacoes(gerenteId?: string): Promise<Contestacao[]>
  /** Data da publicação de cada mês publicado (`YYYY-MM-DD`), por id do ciclo. */
  publicacoes(): Promise<Record<string, string>>
  eventos(limite?: number): Promise<EventoAuditoria[]>

  registrarLancamento(entrada: EntradaLancamento, agora: string): Promise<Resultado>
  avancarCiclo(cicloId: string, autor: string, agora: string): Promise<Resultado>
  abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado>
  responderContestacao(entrada: EntradaResposta, agora: string): Promise<Resultado>
  /** Registra a exportação na trilha. Quem chama só entrega o arquivo se der certo. */
  registrarExportacao(entrada: EntradaExportacao, agora: string): Promise<Resultado>
}
