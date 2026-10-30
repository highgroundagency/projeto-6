import type {
  Aplicabilidade,
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
 * Tradução entre o domínio (camelCase, `src/lib/calculo/tipos.ts`) e as
 * linhas do banco (snake_case, `db/migrations/`). Ida e volta no mesmo
 * arquivo, para que uma coluna nova não seja lembrada de um lado só.
 *
 * O teste `driver-postgres.test.ts` grava a base sintética inteira, lê de
 * volta e compara com o original: qualquer campo esquecido aqui aparece lá.
 */

type Linha = Record<string, unknown>

// --- domínio → banco -------------------------------------------------------

export const linhaDistrito = (d: Distrito): Linha => ({ id: d.id, nome: d.nome })

export const linhaTipoUnidade = (t: TipoUnidade): Linha => ({
  id: t.id,
  nome: t.nome,
  sigla: t.sigla,
})

export const linhaUnidade = (u: Unidade): Linha => ({
  id: u.id,
  nome: u.nome,
  distrito_id: u.distritoId,
  tipo_id: u.tipoId,
})

export const linhaGerente = (g: Gerente): Linha => ({
  id: g.id,
  nome: g.nome,
  cargo: g.cargo,
  escopo: g.escopo,
  unidade_id: g.unidadeId,
  distrito_id: g.distritoId,
})

export const linhaIndicador = (i: Indicador): Linha => ({
  id: i.id,
  nome: i.nome,
  unidade_medida: i.unidadeMedida,
  direcao: i.direcao,
  fonte: i.fonte,
  periodicidade: i.periodicidade,
})

export const linhaSubindicador = (s: Subindicador): Linha => ({
  id: s.id,
  indicador_id: s.indicadorId,
  nome: s.nome,
  tipo: s.tipo,
  rotulo_numerador: s.rotuloNumerador ?? null,
  rotulo_denominador: s.rotuloDenominador ?? null,
})

export const linhaRegra = (r: RegraDePontuacao): Linha => ({
  id: r.id,
  versao: r.versao,
  descricao: r.descricao,
  vigente_de: r.vigenteDe,
  vigente_ate: r.vigenteAte,
  faixas: r.faixas,
  pontuacao_maxima: r.pontuacaoMaxima,
  faixas_gratificacao: r.faixasGratificacao,
  arredondamento: r.arredondamento,
  teto_atingimento: r.tetoAtingimento,
  sem_lancamento: r.semLancamento,
  metodo: r.metodo ?? null,
  graduacoes: r.graduacoes ?? null,
  segunda_graduacao: r.segundaGraduacao ?? null,
})

export const linhasAplicabilidade = (r: RegraDePontuacao): Linha[] =>
  r.aplicabilidades.map((a) => ({
    regra_id: r.id,
    tipo_unidade_id: a.tipoUnidadeId,
    indicador_id: a.indicadorId,
    meta: a.meta,
    peso: a.peso,
  }))

export const linhaCiclo = (c: CicloAvaliacao): Linha => ({
  id: c.id,
  competencia: c.competencia,
  estado: c.estado,
  janela_lancamento_inicio: c.janelaLancamentoInicio,
  janela_lancamento_fim: c.janelaLancamentoFim,
  revisao_inicio: c.revisaoInicio,
  regra_id: c.regraId,
})

export const linhaLancamento = (l: Lancamento): Linha => ({
  id: l.id,
  subindicador_id: l.subindicadorId,
  unidade_id: l.unidadeId,
  ciclo_id: l.cicloId,
  valor: l.valor,
  numerador: l.numerador,
  denominador: l.denominador,
  evidencia: l.evidencia,
  autor: l.autor,
  registrado_em: l.registradoEm,
  status: l.status,
})

export const linhaAvaliacao = (a: Avaliacao): Linha => ({
  unidade_id: a.unidadeId,
  ciclo_id: a.cicloId,
  score: a.score,
  faixa: a.faixa,
  memoria: a.memoria,
  avisos: a.avisos,
  regra_id: a.memoria.regraId,
  versao_regra: a.memoria.versaoRegra,
})

export const linhaAvaliacaoDistrital = (a: AvaliacaoDistrital): Linha => ({
  distrito_id: a.distritoId,
  ciclo_id: a.cicloId,
  score: a.score,
  faixa: a.faixa,
  por_unidade: a.porUnidade,
  avisos: a.avisos,
})

export const linhaContestacao = (c: Contestacao): Linha => ({
  id: c.id,
  gerente_id: c.gerenteId,
  ciclo_id: c.cicloId,
  indicador_id: c.indicadorId,
  motivo: c.motivo,
  aberta_em: c.abertaEm,
  status: c.status,
  resposta: c.resposta,
})

export const linhaEvento = (e: EventoAuditoria): Linha => ({
  id: e.id,
  quando: e.quando,
  autor: e.autor,
  perfil: e.perfil,
  tipo: e.tipo,
  entidade: e.entidade,
  descricao: e.descricao,
  antes: e.antes,
  depois: e.depois,
})

// --- banco → domínio -------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any -- linha crua do `pg` */

export const deDistrito = (l: any): Distrito => ({ id: l.id, nome: l.nome })

export const deTipoUnidade = (l: any): TipoUnidade => ({ id: l.id, nome: l.nome, sigla: l.sigla })

export const deUnidade = (l: any): Unidade => ({
  id: l.id,
  nome: l.nome,
  distritoId: l.distrito_id,
  tipoId: l.tipo_id,
})

export const deGerente = (l: any): Gerente => ({
  id: l.id,
  nome: l.nome,
  cargo: l.cargo,
  escopo: l.escopo,
  unidadeId: l.unidade_id,
  distritoId: l.distrito_id,
})

export const deIndicador = (l: any): Indicador => ({
  id: l.id,
  nome: l.nome,
  unidadeMedida: l.unidade_medida,
  direcao: l.direcao,
  fonte: l.fonte,
  periodicidade: l.periodicidade,
})

export const deSubindicador = (l: any): Subindicador => ({
  id: l.id,
  indicadorId: l.indicador_id,
  nome: l.nome,
  tipo: l.tipo,
  // Campo opcional no tipo: ausente, não `null`.
  ...(l.rotulo_numerador !== null ? { rotuloNumerador: l.rotulo_numerador } : {}),
  ...(l.rotulo_denominador !== null ? { rotuloDenominador: l.rotulo_denominador } : {}),
})

export const deAplicabilidade = (l: any): Aplicabilidade => ({
  tipoUnidadeId: l.tipo_unidade_id,
  indicadorId: l.indicador_id,
  meta: l.meta,
  peso: l.peso,
})

export const deRegra = (l: any, aplicabilidades: Aplicabilidade[]): RegraDePontuacao => ({
  id: l.id,
  versao: l.versao,
  descricao: l.descricao,
  vigenteDe: l.vigente_de,
  vigenteAte: l.vigente_ate,
  faixas: l.faixas,
  pontuacaoMaxima: l.pontuacao_maxima,
  faixasGratificacao: l.faixas_gratificacao,
  aplicabilidades,
  arredondamento: l.arredondamento,
  tetoAtingimento: l.teto_atingimento,
  semLancamento: l.sem_lancamento,
  // Ausente quer dizer `atingimento` para o motor: não inventar campo.
  ...(l.metodo !== null ? { metodo: l.metodo } : {}),
  ...(l.graduacoes !== null ? { graduacoes: l.graduacoes } : {}),
  ...(l.segunda_graduacao !== null ? { segundaGraduacao: l.segunda_graduacao } : {}),
})

export const deCiclo = (l: any): CicloAvaliacao => ({
  id: l.id,
  competencia: l.competencia,
  estado: l.estado,
  janelaLancamentoInicio: l.janela_lancamento_inicio,
  janelaLancamentoFim: l.janela_lancamento_fim,
  revisaoInicio: l.revisao_inicio,
  regraId: l.regra_id,
})

export const deLancamento = (l: any): Lancamento => ({
  id: l.id,
  subindicadorId: l.subindicador_id,
  unidadeId: l.unidade_id,
  cicloId: l.ciclo_id,
  valor: l.valor,
  numerador: l.numerador,
  denominador: l.denominador,
  evidencia: l.evidencia,
  autor: l.autor,
  registradoEm: l.registrado_em,
  status: l.status,
})

export const deAvaliacao = (l: any): Avaliacao => ({
  unidadeId: l.unidade_id,
  cicloId: l.ciclo_id,
  score: l.score,
  faixa: l.faixa,
  memoria: l.memoria,
  avisos: l.avisos,
})

export const deAvaliacaoDistrital = (l: any): AvaliacaoDistrital => ({
  distritoId: l.distrito_id,
  cicloId: l.ciclo_id,
  score: l.score,
  faixa: l.faixa,
  porUnidade: l.por_unidade,
  avisos: l.avisos,
})

export const deContestacao = (l: any): Contestacao => ({
  id: l.id,
  gerenteId: l.gerente_id,
  cicloId: l.ciclo_id,
  indicadorId: l.indicador_id,
  motivo: l.motivo,
  abertaEm: l.aberta_em,
  status: l.status,
  resposta: l.resposta,
})

export const deEvento = (l: any): EventoAuditoria => ({
  id: l.id,
  quando: l.quando,
  autor: l.autor,
  perfil: l.perfil,
  tipo: l.tipo,
  entidade: l.entidade,
  descricao: l.descricao,
  antes: l.antes,
  depois: l.depois,
})
