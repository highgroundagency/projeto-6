import type { AvaliacaoV1, CicloV1, IndicadorV1, LancamentoV1, RegraV1 } from './dominio-v1'

/**
 * Tradução domínio → banco, usada pelo script de semeadura.
 *
 * O banco fala snake_case; a aplicação fala camelCase. Concentrar a conversão
 * aqui evita que cada lugar invente a própria — e é onde uma divergência com
 * `supabase/migrations/` aparece primeiro, porque `semeadura.test.ts` executa
 * estas funções contra o schema real.
 *
 * Os tipos vêm de `dominio-v1.ts` de propósito: o schema guardado ainda modela
 * o domínio anterior à reunião de 22/08 (ADR-034). A pendência de remodelar o
 * SQL está declarada em docs/banco.md.
 */

export const deIndicador = (indicador: IndicadorV1) => ({
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

export const deRegra = (regra: RegraV1) => ({
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

export const deCiclo = (ciclo: CicloV1) => ({
  id: ciclo.id,
  competencia: ciclo.competencia,
  janela_lancamento_inicio: ciclo.janelaLancamentoInicio,
  janela_lancamento_fim: ciclo.janelaLancamentoFim,
  regra_id: ciclo.regraId,
})

export const deLancamento = (lancamento: LancamentoV1) => ({
  indicador_id: lancamento.indicadorId,
  ciclo_id: lancamento.cicloId,
  valor: lancamento.valor,
  evidencia: lancamento.evidencia,
  autor: lancamento.autor,
  registrado_em: lancamento.registradoEm,
  status: lancamento.status,
})

export const deAvaliacao = (avaliacao: AvaliacaoV1) => ({
  gestor_id: avaliacao.gestorId,
  ciclo_id: avaliacao.cicloId,
  score: avaliacao.score,
  faixa: avaliacao.faixa,
  memoria: avaliacao.memoria,
  avisos: avaliacao.avisos,
  regra_id: avaliacao.memoria.regraId,
  versao_regra: avaliacao.memoria.versaoRegra,
})
