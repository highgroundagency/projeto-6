import type {
  Avaliacao,
  CicloAvaliacao,
  Indicador,
  Lancamento,
  RegraDePontuacao,
} from '@/lib/calculo/tipos'

/**
 * Tradução domínio → banco, usada pelo script de semeadura.
 *
 * O banco fala snake_case; a aplicação fala camelCase. Concentrar a conversão
 * aqui evita que cada lugar invente a própria — e é onde uma divergência com
 * `supabase/migrations/` aparece primeiro, porque `semeadura.test.ts` executa
 * estas funções contra o schema real.
 */

export const deIndicador = (indicador: Indicador) => ({
  id: indicador.id,
  area_id: indicador.areaId,
  nome: indicador.nome,
  unidade: indicador.unidade,
  direcao: indicador.direcao,
  fonte: indicador.fonte,
  periodicidade: indicador.periodicidade,
  meta: indicador.meta,
  peso: indicador.peso,
})

export const deRegra = (regra: RegraDePontuacao) => ({
  id: regra.id,
  versao: regra.versao,
  descricao: regra.descricao,
  vigente_de: regra.vigenteDe,
  vigente_ate: regra.vigenteAte,
  faixas: regra.faixas,
  pontuacao_maxima: regra.pontuacaoMaxima,
  faixas_gratificacao: regra.faixasGratificacao,
  arredondamento: regra.arredondamento,
  teto_atingimento: regra.tetoAtingimento,
  sem_lancamento: regra.semLancamento,
})

export const deCiclo = (ciclo: CicloAvaliacao) => ({
  id: ciclo.id,
  competencia: ciclo.competencia,
  janela_lancamento_inicio: ciclo.janelaLancamentoInicio,
  janela_lancamento_fim: ciclo.janelaLancamentoFim,
  regra_id: ciclo.regraId,
})

export const deLancamento = (lancamento: Lancamento) => ({
  indicador_id: lancamento.indicadorId,
  ciclo_id: lancamento.cicloId,
  valor: lancamento.valor,
  evidencia: lancamento.evidencia,
  autor: lancamento.autor,
  registrado_em: lancamento.registradoEm,
  status: lancamento.status,
})

export const deAvaliacao = (avaliacao: Avaliacao) => ({
  gestor_id: avaliacao.gestorId,
  ciclo_id: avaliacao.cicloId,
  score: avaliacao.score,
  faixa: avaliacao.faixa,
  memoria: avaliacao.memoria,
  avisos: avaliacao.avisos,
  regra_id: avaliacao.memoria.regraId,
  versao_regra: avaliacao.memoria.versaoRegra,
})
