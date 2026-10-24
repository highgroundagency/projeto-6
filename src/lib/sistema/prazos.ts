import { diaDaSemana, somarDias, type DataISO } from '@/lib/datas'

/**
 * Os prazos do art. 9º da portaria, como função pura.
 *
 * A portaria dá ao gerente 10 dias CORRIDOS, contados da publicação do
 * resultado, para pedir revisão, e à comissão 5 dias ÚTEIS, contados do
 * pedido, para responder. Até a Sprint 2 o sistema dizia isso na tela e não
 * cobrava: o pedido entrava em qualquer mês fechado, a qualquer tempo.
 *
 * "Hoje" é sempre injetado (regra 6 da casa). Quem chama converte a hora do
 * pedido para a data civil do Recife antes de perguntar.
 *
 * FERIADO NÃO ENTRA NA CONTA. Dia útil aqui é de segunda a sexta. O calendário
 * de feriados do município não está no repositório, e inventar um seria pior
 * que declarar a falta: a tela diz que o prazo de resposta ignora feriados.
 */

/** Dias corridos, da publicação, para o gerente contestar (art. 9º). */
export const DIAS_PARA_CONTESTAR = 10

/** Dias úteis, do pedido, para a SEAB responder (art. 9º). */
export const DIAS_UTEIS_PARA_RESPONDER = 5

/** Último dia em que o mês publicado em `publicadoEm` ainda aceita contestação. */
export function prazoParaContestar(publicadoEm: DataISO): DataISO {
  return somarDias(publicadoEm, DIAS_PARA_CONTESTAR)
}

function ehDiaUtil(data: DataISO): boolean {
  const dia = diaDaSemana(data)
  return dia !== 'sábado' && dia !== 'domingo'
}

/** Soma dias úteis (segunda a sexta) a uma data. O dia de partida não conta. */
export function somarDiasUteis(data: DataISO, dias: number): DataISO {
  let atual = data
  let faltam = dias
  while (faltam > 0) {
    atual = somarDias(atual, 1)
    if (ehDiaUtil(atual)) faltam--
  }
  return atual
}

/** Último dia para a SEAB responder um pedido aberto em `abertaEm`. */
export function prazoParaResponder(abertaEm: DataISO): DataISO {
  return somarDiasUteis(abertaEm, DIAS_UTEIS_PARA_RESPONDER)
}

export type SituacaoDoPrazo =
  | { readonly aberto: true; readonly ate: DataISO }
  | { readonly aberto: false; readonly motivo: 'nao_publicado' }
  | { readonly aberto: false; readonly motivo: 'vencido'; readonly ate: DataISO }

/**
 * Se um mês ainda aceita contestação em `hoje`.
 *
 * `publicadoEm` nulo é mês que ainda não foi publicado: homologado já tem nota,
 * mas o prazo da portaria só começa a correr na publicação. O último dia do
 * prazo ainda vale.
 */
export function situacaoParaContestar(
  publicadoEm: DataISO | null,
  hoje: DataISO,
): SituacaoDoPrazo {
  if (!publicadoEm) return { aberto: false, motivo: 'nao_publicado' }
  const ate = prazoParaContestar(publicadoEm)
  return hoje <= ate ? { aberto: true, ate } : { aberto: false, motivo: 'vencido', ate }
}
