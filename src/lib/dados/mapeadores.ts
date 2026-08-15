import type {
  Area,
  Avaliacao,
  CicloAvaliacao,
  Contestacao,
  EventoAuditoria,
  Gestor,
  Indicador,
  MemoriaDeCalculo,
  RegraDePontuacao,
  Lancamento,
} from '@/lib/calculo/tipos'
import {
  numero,
  type LinhaArea,
  type LinhaAvaliacao,
  type LinhaCiclo,
  type LinhaContestacao,
  type LinhaEvento,
  type LinhaGestor,
  type LinhaIndicador,
  type LinhaLancamento,
  type LinhaRegra,
} from '@/lib/supabase/tipos'

/**
 * Tradução banco → domínio, num lugar só.
 *
 * O banco fala snake_case e devolve `numeric` como string; a aplicação fala
 * camelCase e number. Concentrar a conversão aqui evita que cada tela invente
 * a própria — e é onde qualquer divergência de schema aparece primeiro.
 */

export const paraArea = (linha: LinhaArea): Area => ({
  id: linha.id,
  sigla: linha.sigla,
  nome: linha.nome,
})

export const paraGestor = (linha: LinhaGestor): Gestor => ({
  id: linha.id,
  nome: linha.nome,
  cargo: linha.cargo,
  areaId: linha.area_id,
})

export const paraIndicador = (linha: LinhaIndicador): Indicador => ({
  id: linha.id,
  areaId: linha.area_id,
  nome: linha.nome,
  unidade: linha.unidade,
  direcao: linha.direcao,
  fonte: linha.fonte,
  periodicidade: linha.periodicidade,
  meta: numero(linha.meta),
  peso: numero(linha.peso),
})

export const paraRegra = (linha: LinhaRegra): RegraDePontuacao => ({
  id: linha.id,
  versao: linha.versao,
  descricao: linha.descricao,
  vigenteDe: linha.vigente_de,
  vigenteAte: linha.vigente_ate,
  faixas: linha.faixas as RegraDePontuacao['faixas'],
  pontuacaoMaxima: numero(linha.pontuacao_maxima),
  faixasGratificacao: linha.faixas_gratificacao as RegraDePontuacao['faixasGratificacao'],
  arredondamento: linha.arredondamento as RegraDePontuacao['arredondamento'],
  tetoAtingimento: numero(linha.teto_atingimento),
  semLancamento: linha.sem_lancamento as RegraDePontuacao['semLancamento'],
})

export const paraCiclo = (linha: LinhaCiclo): CicloAvaliacao => ({
  id: linha.id,
  competencia: linha.competencia,
  estado: linha.estado,
  janelaLancamentoInicio: linha.janela_lancamento_inicio,
  janelaLancamentoFim: linha.janela_lancamento_fim,
  regraId: linha.regra_id,
})

export const paraLancamento = (linha: LinhaLancamento): Lancamento => ({
  id: linha.id,
  indicadorId: linha.indicador_id,
  cicloId: linha.ciclo_id,
  valor: numero(linha.valor),
  evidencia: linha.evidencia,
  autor: linha.autor,
  registradoEm: linha.registrado_em,
  status: linha.status,
})

export const paraAvaliacao = (linha: LinhaAvaliacao): Avaliacao => ({
  gestorId: linha.gestor_id,
  cicloId: linha.ciclo_id,
  score: numero(linha.score),
  faixa: (linha.faixa ?? null) as Avaliacao['faixa'],
  memoria: linha.memoria as MemoriaDeCalculo,
  avisos: (Array.isArray(linha.avisos) ? linha.avisos : []) as readonly string[],
})

export const paraContestacao = (linha: LinhaContestacao): Contestacao => ({
  id: linha.id,
  gestorId: linha.gestor_id,
  cicloId: linha.ciclo_id,
  indicadorId: linha.indicador_id,
  motivo: linha.motivo,
  abertaEm: linha.aberta_em,
  status: linha.status,
  resposta: linha.resposta,
})

export const paraEvento = (linha: LinhaEvento): EventoAuditoria => ({
  id: String(linha.id),
  quando: linha.quando,
  autor: linha.autor,
  perfil: linha.perfil,
  tipo: linha.tipo,
  entidade: linha.entidade,
  descricao: linha.descricao,
  antes: linha.antes,
  depois: linha.depois,
})

/** Domínio → banco, para o script de semeadura. */
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
