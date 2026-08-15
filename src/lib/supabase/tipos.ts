import type {
  Direcao,
  EstadoCiclo,
  Periodicidade,
  StatusContestacao,
  StatusLancamento,
  TipoEvento,
} from '@/lib/calculo/tipos'
import type { PerfilId } from '@/lib/features'

/**
 * Forma das linhas do banco, espelhando `supabase/migrations/`.
 *
 * Escrito à mão de propósito: o `supabase gen types` exige a CLI conectada a um
 * projeto, e o time precisa conseguir rodar o projeto sem isso. O teste de RLS
 * aplica as migrações de verdade, então qualquer divergência entre este arquivo
 * e o schema aparece na primeira consulta.
 *
 * Convenção: o banco usa snake_case (padrão do PostgreSQL); a aplicação usa
 * camelCase. A tradução acontece em `mapeadores.ts`, num lugar só.
 */

export interface LinhaArea {
  id: string
  sigla: string
  nome: string
}

export interface LinhaGestor {
  id: string
  nome: string
  cargo: string
  area_id: string
}

export interface LinhaUsuario {
  id: string
  nome: string
  perfil: PerfilId
  area_id: string | null
  gestor_id: string | null
}

export interface LinhaIndicador {
  id: string
  area_id: string
  nome: string
  unidade: string
  direcao: Direcao
  fonte: string
  periodicidade: Periodicidade
  meta: number | string
  peso: number | string
}

export interface LinhaRegra {
  id: string
  versao: number
  descricao: string
  vigente_de: string
  vigente_ate: string | null
  faixas: unknown
  pontuacao_maxima: number | string
  faixas_gratificacao: unknown
  arredondamento: unknown
  teto_atingimento: number | string
  sem_lancamento: string
}

export interface LinhaCiclo {
  id: string
  competencia: string
  estado: EstadoCiclo
  janela_lancamento_inicio: string
  janela_lancamento_fim: string
  regra_id: string
}

export interface LinhaLancamento {
  id: string
  indicador_id: string
  ciclo_id: string
  valor: number | string
  evidencia: string
  autor: string
  registrado_em: string
  status: StatusLancamento
}

export interface LinhaAvaliacao {
  id: string
  gestor_id: string
  ciclo_id: string
  score: number | string
  faixa: unknown
  memoria: unknown
  avisos: unknown
  regra_id: string
  versao_regra: number
  calculado_em: string
}

export interface LinhaContestacao {
  id: string
  gestor_id: string
  ciclo_id: string
  indicador_id: string | null
  motivo: string
  aberta_em: string
  status: StatusContestacao
  resposta: string | null
}

export interface LinhaEvento {
  id: number
  quando: string
  autor: string
  perfil: string
  tipo: TipoEvento
  entidade: string
  descricao: string
  antes: Record<string, unknown> | null
  depois: Record<string, unknown> | null
}

export interface LinhaConfiguracao {
  id: number
  adiantamento_dias: number
  override_release: string | null
  travas: unknown
  atualizado_em: string
}

export interface LinhaLogRelease {
  id: number
  quando: string
  autor: string
  campo: string
  de: string
  para: string
}

/**
 * `numeric` do PostgreSQL chega como string no cliente JS — é assim que o
 * driver evita perder precisão. Converter num ponto só evita o clássico
 * "score de 72 virou '72' e a comparação falhou".
 */
export function numero(valor: number | string | null | undefined): number {
  if (valor === null || valor === undefined) return 0
  return typeof valor === 'number' ? valor : Number(valor)
}
