/**
 * Entidades do sistema de gratificação (§8.2).
 *
 * Todos os dados que preenchem estes tipos são SINTÉTICOS. Nenhum dado real de
 * pessoa ou da SESAU entra no repositório.
 */

export type Direcao = 'maior_melhor' | 'menor_melhor'

export type Periodicidade = 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'

export type EstadoCiclo =
  | 'rascunho'
  | 'lancamento_aberto'
  | 'em_validacao'
  | 'homologado'
  | 'publicado'

export const ORDEM_ESTADOS: readonly EstadoCiclo[] = [
  'rascunho',
  'lancamento_aberto',
  'em_validacao',
  'homologado',
  'publicado',
]

export const ROTULO_ESTADO: Record<EstadoCiclo, string> = {
  rascunho: 'Rascunho',
  lancamento_aberto: 'Lançamento aberto',
  em_validacao: 'Em validação',
  homologado: 'Homologado',
  publicado: 'Publicado',
}

/**
 * A explicação de cada etapa, em linguagem de balcão.
 *
 * Os nomes das etapas vêm do processo real e não dá para trocá-los sem perder a
 * ligação com a portaria. O que dá para fazer é explicar cada um em uma frase
 * curta, sem palavra de sistema, e mostrar essa frase SEMPRE ao lado do nome.
 */
export const EXPLICACAO_ESTADO: Record<EstadoCiclo, string> = {
  rascunho: 'O mês ainda está sendo preparado. Ninguém informa nada por enquanto.',
  lancamento_aberto: 'O prazo está aberto: cada área entra e informa os números do mês.',
  em_validacao: 'O prazo acabou. A comissão confere os números antes de fazer a conta.',
  homologado: 'A conta foi feita e a comissão aprovou o resultado.',
  publicado: 'O resultado está no ar. Cada gestor pode ver a própria nota.',
}

export interface CicloAvaliacao {
  readonly id: string
  /** Competência no formato `YYYY-MM`. */
  readonly competencia: string
  readonly estado: EstadoCiclo
  readonly janelaLancamentoInicio: string
  readonly janelaLancamentoFim: string
  /** Versão da regra usada quando o ciclo foi homologado. */
  readonly regraId: string
}

export interface Area {
  readonly id: string
  readonly nome: string
  readonly sigla: string
}

export interface Gestor {
  readonly id: string
  readonly nome: string
  readonly cargo: string
  readonly areaId: string
}

export interface Indicador {
  readonly id: string
  readonly areaId: string
  readonly nome: string
  readonly unidade: string
  readonly direcao: Direcao
  readonly fonte: string
  readonly periodicidade: Periodicidade
  readonly meta: number
  /** Peso relativo do indicador. Não precisa somar 1: o motor normaliza. */
  readonly peso: number
}

export type StatusLancamento = 'rascunho' | 'enviado' | 'validado' | 'rejeitado'

export interface Lancamento {
  readonly id: string
  readonly indicadorId: string
  readonly cicloId: string
  readonly valor: number
  readonly evidencia: string
  readonly autor: string
  readonly registradoEm: string
  readonly status: StatusLancamento
}

/** Faixa de atingimento → pontos. Intervalo fechado à esquerda, aberto à direita. */
export interface FaixaPontuacao {
  /** Atingimento mínimo, em fração (0.9 = 90%). */
  readonly de: number
  /** Atingimento máximo exclusivo. `null` = sem teto superior. */
  readonly ate: number | null
  readonly pontos: number
}

export interface FaixaGratificacao {
  /** Score mínimo, de 0 a 100. */
  readonly de: number
  readonly ate: number | null
  readonly rotulo: string
  /** Percentual da gratificação devida nesta faixa. */
  readonly percentual: number
}

export type ModoArredondamento = 'meio_para_cima' | 'meio_para_baixo' | 'truncar'

export type TratamentoSemLancamento = 'zera_com_aviso' | 'ignora' | 'usa_meta'

/**
 * Regra de pontuação VERSIONADA.
 *
 * Alterar uma regra cria uma nova versão; a vigente nunca é editada. Sem isso,
 * um ciclo já homologado deixaria de reproduzir o próprio resultado — que é
 * exatamente o problema que o projeto ataca. Regra é dado, não código.
 */
export interface RegraDePontuacao {
  readonly id: string
  readonly versao: number
  readonly descricao: string
  /** Competência inicial de vigência, `YYYY-MM`. */
  readonly vigenteDe: string
  readonly vigenteAte: string | null
  readonly faixas: readonly FaixaPontuacao[]
  readonly pontuacaoMaxima: number
  readonly faixasGratificacao: readonly FaixaGratificacao[]
  readonly arredondamento: {
    readonly casas: number
    readonly modo: ModoArredondamento
  }
  /** Teto de atingimento, em fração. 1.5 = ninguém passa de 150%. */
  readonly tetoAtingimento: number
  readonly semLancamento: TratamentoSemLancamento
}

export interface PassoMemoria {
  readonly indicadorId: string
  readonly indicador: string
  readonly unidade: string
  readonly direcao: Direcao
  readonly valor: number | null
  readonly meta: number
  /** Atingimento antes do teto. `null` quando não houve lançamento. */
  readonly atingimentoBruto: number | null
  readonly atingimento: number | null
  readonly aplicouTeto: boolean
  readonly faixa: string
  readonly pontos: number
  readonly peso: number
  readonly pesoNormalizado: number
  readonly contribuicao: number
  readonly aviso?: string
}

export interface MemoriaDeCalculo {
  readonly regraId: string
  readonly versaoRegra: number
  readonly passos: readonly PassoMemoria[]
  readonly somaPesos: number
  readonly somaContribuicoes: number
  readonly pontuacaoMaxima: number
  readonly score: number
  readonly formula: string
}

export interface Avaliacao {
  readonly gestorId: string
  readonly cicloId: string
  readonly score: number
  readonly faixa: FaixaGratificacao | null
  readonly memoria: MemoriaDeCalculo
  readonly avisos: readonly string[]
}

export type TipoEvento =
  | 'ciclo_criado'
  | 'ciclo_estado_alterado'
  | 'indicador_criado'
  | 'indicador_alterado'
  | 'regra_versionada'
  | 'lancamento_registrado'
  | 'lancamento_alterado'
  | 'avaliacao_calculada'
  | 'contestacao_aberta'
  | 'contestacao_respondida'

/** Trilha append-only: nada se apaga, tudo guarda o antes e o depois. */
export interface EventoAuditoria {
  readonly id: string
  readonly quando: string
  readonly autor: string
  readonly perfil: string
  readonly tipo: TipoEvento
  readonly entidade: string
  readonly descricao: string
  readonly antes: Record<string, unknown> | null
  readonly depois: Record<string, unknown> | null
}

export type StatusContestacao = 'aberta' | 'em_analise' | 'respondida' | 'acatada' | 'recusada'

export interface Contestacao {
  readonly id: string
  readonly gestorId: string
  readonly cicloId: string
  readonly indicadorId: string | null
  readonly motivo: string
  readonly abertaEm: string
  readonly status: StatusContestacao
  readonly resposta: string | null
}
