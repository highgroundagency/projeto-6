/**
 * Motor de releases — o coração do site (§6 do briefing).
 *
 * O site tem duas realidades: a pública (o recorte que o professor vê hoje) e a
 * completa (tudo que a equipe já construiu). Este módulo decide, de forma pura e
 * testável, onde fica a fronteira.
 *
 * Nada aqui lê data do sistema, cookie, arquivo ou banco: tudo entra por parâmetro.
 * Quem faz I/O é `src/lib/config` e `src/lib/visao.ts`.
 */

import { VITRINE, type Vitrine } from '@/content/vitrine'
import type { Ambiente } from './ambiente'
import { CRONOGRAMA, type Ciclo, type CicloId } from './cronograma'
import { ehDataISO, somarDias, type DataISO } from './datas'

/**
 * Estado de liberação de um ciclo específico.
 * - `automatico`: segue o release calculado pela data.
 * - `sempre_visivel`: libera fora de ordem, sem mexer no resto.
 * - `sempre_oculto`: esconde mesmo que a data já tenha passado.
 */
export type Trava = 'automatico' | 'sempre_visivel' | 'sempre_oculto'

export type Travas = Partial<Record<CicloId, Trava>>

/** Uma semana à frente: o padrão do §6.1. */
export const ADIANTAMENTO_PADRAO = 7

export const ADIANTAMENTOS_SUGERIDOS = [0, 7, 14, 21] as const

export interface ParametrosRelease {
  /** Data civil de hoje no fuso do projeto. */
  hoje: DataISO
  adiantamentoDias?: number
  /** Fixa o release manualmente. Tem prioridade sobre o cálculo por data. */
  override?: CicloId | null
  ciclos?: readonly Ciclo[]
}

function ehCicloConhecido(
  id: string | null | undefined,
  ciclos: readonly Ciclo[],
): id is CicloId {
  return !!id && ciclos.some((c) => c.id === id)
}

/**
 * releaseAtual = override manual, se existir
 *              : último ciclo cuja data <= hoje + ADIANTAMENTO_DIAS
 *
 * Devolve `null` quando nem o primeiro ciclo começou — estado legítimo, e não
 * um erro: antes de 08/08/2026 não há nada liberado.
 *
 * Um override inválido (config corrompida, env var com lixo) é ignorado em vez
 * de derrubar a página: o cálculo automático assume.
 */
export function calcularReleaseAtual({
  hoje,
  adiantamentoDias = ADIANTAMENTO_PADRAO,
  override = null,
  ciclos = CRONOGRAMA,
}: ParametrosRelease): CicloId | null {
  if (ehCicloConhecido(override, ciclos)) return override

  const limite = somarDias(hoje, adiantamentoDias)
  let atual: CicloId | null = null
  for (const ciclo of ciclos) {
    if (ciclo.data <= limite) atual = ciclo.id as CicloId
  }
  return atual
}

export interface ParametrosVisibilidade {
  releaseAtual: CicloId | null
  travas?: Travas
  ciclos?: readonly Ciclo[]
}

/**
 * Um ciclo é visível quando a trava manda, ou quando ele é anterior ou igual ao
 * release atual. A trava age por ciclo e NÃO move o release — é exatamente isso
 * que permite liberar um ciclo fora de ordem sem arrastar os vizinhos.
 */
export function cicloVisivel(
  id: CicloId,
  { releaseAtual, travas = {}, ciclos = CRONOGRAMA }: ParametrosVisibilidade,
): boolean {
  const trava = travas[id] ?? 'automatico'
  if (trava === 'sempre_visivel') return true
  if (trava === 'sempre_oculto') return false
  if (!releaseAtual) return false

  const posicao = ciclos.findIndex((c) => c.id === id)
  const posicaoRelease = ciclos.findIndex((c) => c.id === releaseAtual)
  if (posicao < 0 || posicaoRelease < 0) return false
  return posicao <= posicaoRelease
}

export function ciclosVisiveis(params: ParametrosVisibilidade): CicloId[] {
  const ciclos = params.ciclos ?? CRONOGRAMA
  return ciclos
    .map((c) => c.id as CicloId)
    .filter((id) => cicloVisivel(id, { ...params, ciclos }))
}

/** O ciclo em que estamos hoje de fato — ignora adiantamento, override e travas. */
export function cicloCorrente(
  hoje: DataISO,
  ciclos: readonly Ciclo[] = CRONOGRAMA,
): CicloId | null {
  return calcularReleaseAtual({ hoje, adiantamentoDias: 0, ciclos })
}

/** Próximo marco (Kick-off, SR1 ou SR2) a partir de hoje — alimenta o countdown. */
export function proximoMarco(
  hoje: DataISO,
  ciclos: readonly Ciclo[] = CRONOGRAMA,
): Ciclo | null {
  return ciclos.find((c) => c.tipo === 'marco' && c.data >= hoje) ?? null
}

export type EstadoMarco = 'feito' | 'atual' | 'futuro'

/**
 * Estado de cada marco na trilha Kick-off → SR1 → SR2.
 * "atual" é o primeiro marco ainda não vencido; os anteriores são "feito".
 */
export function estadoDoMarco(
  marco: Ciclo,
  hoje: DataISO,
  ciclos: readonly Ciclo[] = CRONOGRAMA,
): EstadoMarco {
  if (marco.data < hoje) return 'feito'
  const proximo = proximoMarco(hoje, ciclos)
  return proximo?.id === marco.id ? 'atual' : 'futuro'
}

export interface ResumoRelease {
  releaseAtual: CicloId | null
  cicloCorrente: CicloId | null
  visiveis: CicloId[]
  adiantamentoDias: number
  override: CicloId | null
  travas: Travas
  hoje: DataISO
  /** true quando o release foi fixado à mão em vez de calculado pela data. */
  manual: boolean
}

/** Empacota tudo que a UI precisa saber sobre o release em uma passada só. */
export function resumirRelease({
  hoje,
  adiantamentoDias = ADIANTAMENTO_PADRAO,
  override = null,
  travas = {},
  ciclos = CRONOGRAMA,
}: ParametrosRelease & { travas?: Travas }): ResumoRelease {
  const releaseAtual = calcularReleaseAtual({ hoje, adiantamentoDias, override, ciclos })
  return {
    releaseAtual,
    cicloCorrente: cicloCorrente(hoje, ciclos),
    visiveis: ciclosVisiveis({ releaseAtual, travas, ciclos }),
    adiantamentoDias,
    override: ehCicloConhecido(override, ciclos) ? override : null,
    travas,
    hoje,
    manual: ehCicloConhecido(override, ciclos),
  }
}

/**
 * Janela de vitrine: abre o site inteiro para TODO MUNDO, até um instante.
 *
 * `RELEASE_ABERTO_ATE` recebe um instante ISO 8601 (ex.: `2026-08-17T05:54:00Z`).
 * Enquanto o relógio não passar dele, todo visitante enxerga os 18 ciclos e as
 * oito telas do sistema — como se fosse admin em modo completo. Depois disso o
 * recorte volta sozinho ao cálculo normal.
 *
 * POR QUE COM PRAZO E NÃO UM INTERRUPTOR: `RELEASE_OVERRIDE=sr2` já abre tudo,
 * mas fica aberto até alguém lembrar de fechar — e é justamente numa semana
 * corrida que ninguém lembra. Prazo que expira sozinho não depende de memória.
 *
 * ISTO SUSPENDE A GARANTIA DO §6.3 DE PROPÓSITO. Enquanto a janela estiver
 * aberta, conteúdo de semana futura chega ao HTML do visitante, porque é
 * exatamente o que se pediu. `scripts/verificar-vazamento.ts` roda sem a
 * variável e continua provando o comportamento normal.
 *
 * Valor ausente, vazio ou malformado = janela fechada. Nunca lança: uma env var
 * digitada errada não pode derrubar o site nem, pior, abri-lo por acidente.
 */
export function janelaAberta(
  env: Ambiente = process.env,
  agora: Date = new Date(),
  vitrine: Vitrine = VITRINE,
): boolean {
  // Env var vence o valor versionado: quem opera pelo painel da Vercel precisa
  // conseguir corrigir uma data errada sem abrir o editor.
  const bruto = env.RELEASE_ABERTO_ATE?.trim() || vitrine.ate?.trim()
  if (!bruto) return false

  const limite = Date.parse(bruto)
  if (Number.isNaN(limite)) return false

  return agora.getTime() < limite
}

/**
 * Data civil simulada para a janela de vitrine.
 *
 * `RELEASE_ABERTO_ATE` decide o que está VISÍVEL; esta decide QUE DIA o site
 * pensa que é. São coisas diferentes, e a primeira sozinha não basta: com todos
 * os ciclos liberados mas o relógio em agosto, o topo continua dizendo "próximo
 * marco: Kick-off, faltam 27 dias" e o SR2 aparece como "a realizar". Para
 * mostrar o semestre como concluído, a data também precisa andar.
 *
 * Só tem efeito enquanto a janela estiver aberta — sozinha, não faz nada. Isso
 * evita que alguém deixe o site preso numa data por esquecimento: quando o
 * prazo vence, o calendário volta junto com a visibilidade.
 *
 * Formato `YYYY-MM-DD`, como toda data do projeto (ADR-007). Valor ausente ou
 * malformado devolve `null`, e o chamador usa a data real.
 */
export function dataSimuladaDaJanela(
  env: Ambiente = process.env,
  vitrine: Vitrine = VITRINE,
): DataISO | null {
  const bruto = env.RELEASE_DATA_SIMULADA?.trim() || vitrine.dataSimulada?.trim()
  if (!bruto || !ehDataISO(bruto)) return null
  return bruto
}

/** Quantos dias uma semana do cronograma cobre. */
const DIAS_DA_SEMANA = 7

/**
 * `hoje` cai DENTRO da semana deste ciclo?
 *
 * Diferente de `cicloCorrente`, que devolve o último ciclo já vencido e por isso
 * nunca é nulo depois do primeiro. A distinção só aparece quando a data passa do
 * fim do cronograma: em janeiro de 2027, `cicloCorrente` ainda diz "sr2" — o que
 * está certo para "qual foi o último" e errado para "qual é esta semana".
 *
 * O bug apareceu ao simular 2027 na vitrine: a pílula "esta semana" ficou colada
 * no SR2, três semanas depois de ele ter acontecido.
 */
export function ehSemanaCorrente(
  hoje: DataISO,
  ciclo: CicloId,
  ciclos: readonly Ciclo[] = CRONOGRAMA,
): boolean {
  const alvo = ciclos.find((c) => c.id === ciclo)
  if (!alvo) return false
  return hoje >= alvo.data && hoje < somarDias(alvo.data, DIAS_DA_SEMANA)
}
