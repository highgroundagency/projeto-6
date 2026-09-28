import dados from '@/content/ml/apresentacao.json'
import resultados from '@/content/ml/resultados.json'
import { CITACAO_DA_SECRETARIA, decimal, enxuto } from '@/content/apresentacao-ml'
import {
  ALTERNATIVAS,
  BENCHMARKING,
  CSD_EM_25_09,
  MAPA_DE_EMPATIA,
  SWOT,
  TECNICAS_DE_IDEACAO,
} from '@/content/analises'
import { CHECKLIST } from '@/content/checklist'
import { BACKLOG, type Moscow } from '@/content/ciclos/s6'
import { EQUIPE, nomeCurto, type IntegranteId } from '@/content/equipe'
import {
  COMPROMISSOS_ATE_O_SR1,
  CONTAGENS_PITCH,
  LEGENDAS_DO_WIREFRAME,
  PESSOAS,
  formatarTempo,
} from '@/content/pitch'
import { SECOES } from '@/components/base/indice'
import { ENDERECO_SITE, OBJETIVOS_ESPECIFICOS, OBJETIVO_GERAL_CURTO } from '@/content/produto'
import { calcularAvaliacao } from '@/lib/calculo/motor'
import type { Avaliacao } from '@/lib/calculo/tipos'
import { CRONOGRAMA, cicloPorId, indiceDoCiclo, type CicloId } from '@/lib/cronograma'
import { FEATURES, PERFIS, type PerfilId } from '@/lib/features'
import { BASE } from '@/lib/seed'
// Só o tipo: `lib/ml.ts` é server-only, e este arquivo também roda nos scripts.
import type { ResultadosML } from '@/lib/ml'

/**
 * A APRESENTAÇÃO DO SR1, como dado.
 *
 * O mesmo desenho do pitch do Kick-off (`pitch.ts`) e da AV1 de ML
 * (`apresentacao-ml.ts`): a rota `/sr1` renderiza estes slides,
 * `apresentacao-sr1.test.ts` conta as palavras de cada um, confere que a fala
 * cabe no tempo e que nenhum número dito no palco diverge da fonte. O
 * componente escolhe a forma do visual; as palavras vêm daqui.
 *
 * NA ORDEM DA RUBRICA (ADR-047). As orientações oficiais do SR1 chegaram em
 * 28/09 com seis critérios de conteúdo, cada um com a lista do que mostrar.
 * O deck anterior tinha sido montado antes delas e deixava de fora, de
 * propósito, personas, SWOT, ideação e wireframes, porque o Kick-off já tinha
 * mostrado. A rubrica cobra tudo isso de novo, atualizado. Agora cada slide
 * pertence a uma parte (`parte`), o rodapé diz qual, e o slide 2 é o mapa:
 * quem avalia confere a rubrica sem procurar.
 *
 * AUTOCONTIDO. O PDF vai para o Drive e é lido sem a fala. Por isso o teto de
 * palavras subiu de 70 para 90: a tela precisa dizer o bastante para ser
 * entendida sozinha, e continua não sendo teleprompter.
 *
 * NENHUM NÚMERO DIGITADO. A nota de maio e de junho sai do motor de cálculo na
 * hora de montar o slide; a planilha e a base, de `ml/apresentacao.json`; os
 * modelos, de `ml/resultados.json`; o planejado x realizado, do cronograma e
 * do checklist; o avanço do backlog, de `BACKLOG`. Se a fonte mudar, a tela e
 * a fala mudam junto.
 *
 * Nomes aparecem aqui só como QUEM FALA e como responsável por entrega.
 * Nenhuma pessoa real aparece nos dados: o sistema roda com dados de teste, e
 * a base da Secretaria é por unidade de saúde, sem nome, CPF ou matrícula
 * (ADR-044).
 */

/* -------------------------------------------------------------------------
   Os números, lidos da fonte
------------------------------------------------------------------------- */

const ML = resultados as unknown as ResultadosML
const B = dados.base

/** A unidade de teste que o deck acompanha, a mesma do Kick-off. */
export const UNIDADE_DO_DECK = 'usf-canario'

function avaliar(cicloId: string, regraId: string): Avaliacao {
  const unidade = BASE.unidades.find((u) => u.id === UNIDADE_DO_DECK)
  const regra = BASE.regras.find((r) => r.id === regraId)
  if (!unidade || !regra) throw new Error(`Sem unidade ou regra: ${UNIDADE_DO_DECK}, ${regraId}`)
  return calcularAvaliacao({
    unidade,
    cicloId,
    indicadores: BASE.indicadores,
    subindicadores: BASE.subindicadores,
    lancamentos: BASE.lancamentos,
    regra,
  })
}

/**
 * A mesma unidade em três contas: é a prova do diferencial "regra com versão".
 *
 * Maio fechou pela versão 2 e continua com o número que publicou. Maio pela
 * versão 3 é a conta que NÃO foi feita, calculada aqui só para mostrar o
 * tamanho da mudança. Junho já usa a versão 3.
 */
export const TRES_CONTAS = [
  { id: 'maio-v2', avaliacao: avaliar('ciclo-2026-05', 'regra-v2') },
  { id: 'maio-v3', avaliacao: avaliar('ciclo-2026-05', 'regra-v3') },
  { id: 'junho-v3', avaliacao: avaliar('ciclo-2026-06', 'regra-v3') },
] as const

const [MAIO_V2, MAIO_V3, JUNHO_V3] = TRES_CONTAS.map((c) => c.avaliacao)

/** A nota como a tela do sistema escreve: 86,67. */
export function nota(avaliacao: Avaliacao): string {
  return decimal(avaliacao.score, 2)
}

/** A nota como se diz em voz alta: 86,67 e 85, sem o zero que ninguém fala. */
export function notaFalada(avaliacao: Avaliacao): string {
  return enxuto(avaliacao.score, 2)
}

/** A classe da nota, em minúsculas. */
export function classe(avaliacao: Avaliacao): string {
  return (avaliacao.faixa?.rotulo ?? 'sem classe').toLowerCase()
}

/** A demonstração de reserva, com a conta de junho pela versão 3. */
export const DEMO_SR1 = { cicloId: 'ciclo-2026-06', avaliacao: JUNHO_V3 } as const

/** Telas que estão no ar no dia do SR1: as que o ciclo de cada uma já abriu. */
export const TELAS_NO_SR1 = FEATURES.filter(
  (f) => indiceDoCiclo(f.ciclo) <= indiceDoCiclo('sr1'),
)

/** Quantos testes o motor de cálculo tem. Conferido contra o arquivo no teste. */
export const TESTES_DO_MOTOR = 55

const CLASSIFICACAO = ML.modelos.find((m) => m.modelo === 'classificacao')
const AGRUPAMENTO = ML.modelos.find((m) => m.modelo === 'clustering')
if (!CLASSIFICACAO || !AGRUPAMENTO) {
  throw new Error('resultados.json sem os modelos de classificação e agrupamento')
}

const ACERTO = CLASSIFICACAO.metricas.acuracia as number
const ACERTO_DO_CHUTE = (CLASSIFICACAO.referencia as { acuracia: number }).acuracia
const GRUPOS = AGRUPAMENTO.metricas.k as number
const SILHUETA = AGRUPAMENTO.metricas.silhueta as number

/** 0,54 vira 54%, que é como se diz em voz alta. */
function porcentoInteiro(fracao: number): string {
  return `${Math.round(fracao * 100)}%`
}

/** Quantos distritos a base da Secretaria tem, lido da própria base. */
export const DISTRITOS_NA_BASE =
  B.categoricas.find((c) => c.coluna === 'Distrito Sanitário')?.valores ?? 0

/* -------------------------------------------------------------------------
   O planejado x realizado, contado no cronograma e no checklist
------------------------------------------------------------------------- */

function entregue(ciclo: CicloId, evidencia: string): boolean {
  const item = CHECKLIST.find((i) => i.ciclo === ciclo && i.evidencia === evidencia)
  return item?.status === 'feito' || item?.status === 'validado'
}

/** Os ciclos com entrega, sem os imprensados, que não pedem nada. */
const CICLOS_COM_ENTREGA = CRONOGRAMA.filter((c) => c.tipo !== 'pausa')

/** Os ciclos até o SR1, inclusive: o que já devia estar feito no dia. */
const CICLOS_ATE_O_SR1 = CICLOS_COM_ENTREGA.filter(
  (c) => indiceDoCiclo(c.id) <= indiceDoCiclo('sr1'),
)

export interface LinhaDoPlanejado {
  readonly ciclo: CicloId
  readonly planejadas: number
  readonly entregues: number
  /** As evidências que ainda não estão feitas, com o nome do cronograma. */
  readonly emAndamento: readonly string[]
  /** Quem responde pelas evidências do ciclo, na ordem da equipe. */
  readonly responsaveis: readonly IntegranteId[]
}

export const PLANEJADO_X_REALIZADO: readonly LinhaDoPlanejado[] = CICLOS_ATE_O_SR1.map((c) => {
  const itens = CHECKLIST.filter((i) => i.ciclo === c.id)
  const donos = new Set(itens.flatMap((i) => (i.responsavel ? [i.responsavel] : [])))
  return {
    ciclo: c.id,
    planejadas: c.evidencias.length,
    entregues: c.evidencias.filter((e) => entregue(c.id, e)).length,
    emAndamento: c.evidencias.filter((e) => !entregue(c.id, e)),
    responsaveis: EQUIPE.map((i) => i.id).filter((id) => donos.has(id)),
  }
})

const PLANEJADAS_ATE_O_SR1 = PLANEJADO_X_REALIZADO.reduce((s, l) => s + l.planejadas, 0)
const ENTREGUES_ATE_O_SR1 = PLANEJADO_X_REALIZADO.reduce((s, l) => s + l.entregues, 0)
const EM_ANDAMENTO_ATE_O_SR1 = PLANEJADAS_ATE_O_SR1 - ENTREGUES_ATE_O_SR1
const PLANEJADAS_NO_SEMESTRE = CICLOS_COM_ENTREGA.reduce((s, c) => s + c.evidencias.length, 0)
const ENTREGUES_NO_SEMESTRE = CICLOS_COM_ENTREGA.reduce(
  (s, c) => s + c.evidencias.filter((e) => entregue(c.id, e)).length,
  0,
)

/** Em que semana do semestre o SR1 cai, contando os imprensados: o tempo corre neles também. */
export const SEMANA_DO_SR1 = indiceDoCiclo('sr1') + 1
export const SEMANAS_NO_SEMESTRE = CRONOGRAMA.length

const HISTORIAS_NO_AR = BACKLOG.filter((h) => h.estado === 'no_ar').length

function historias(moscow: Moscow, estado?: 'no_ar'): number {
  return BACKLOG.filter((h) => h.moscow === moscow && (!estado || h.estado === estado)).length
}

/** 0,907 vira 91%. */
function porcento(parte: number, todo: number): string {
  return `${Math.round((parte / todo) * 100)}%`
}

/**
 * O percentual de avanço, contado de três jeitos, e cada um diz o seu.
 *
 * A rubrica pede "percentual de avanço do projeto", e um número só esconde
 * a conta. O primeiro compara com o que devia estar pronto hoje; o segundo,
 * com o semestre inteiro, e é o que se compara com o tempo que passou; o
 * terceiro olha o produto, e não a disciplina.
 */
export const AVANCO = [
  {
    id: 'ate-hoje',
    numero: porcento(ENTREGUES_ATE_O_SR1, PLANEJADAS_ATE_O_SR1),
    rotulo: 'do que o cronograma pedia até hoje',
    conta: `${ENTREGUES_ATE_O_SR1} de ${PLANEJADAS_ATE_O_SR1} entregas`,
  },
  {
    id: 'semestre',
    numero: porcento(ENTREGUES_NO_SEMESTRE, PLANEJADAS_NO_SEMESTRE),
    rotulo: 'das entregas do semestre',
    conta: `${ENTREGUES_NO_SEMESTRE} de ${PLANEJADAS_NO_SEMESTRE}, na semana ${SEMANA_DO_SR1} de ${SEMANAS_NO_SEMESTRE}`,
  },
  {
    id: 'historias',
    numero: porcento(HISTORIAS_NO_AR, BACKLOG.length),
    rotulo: 'das histórias do backlog no ar',
    conta: `${HISTORIAS_NO_AR} de ${BACKLOG.length} histórias`,
  },
] as const

/** Número por extenso, como se diz no palco: "cinco fontes", "oito alternativas". */
export function porExtenso(n: number): string {
  const nomes = [
    'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
    'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito',
    'dezenove', 'vinte',
  ]
  return nomes[n] ?? String(n)
}

/* -------------------------------------------------------------------------
   Os dados que a fala também cita

   Moram antes dos slides porque a fala é montada com eles: "cinco fontes",
   "dois objetivos alcançados". Um número dito no palco sai daqui, nunca de
   uma frase escrita à mão.
------------------------------------------------------------------------- */

/** Slide 4: as fontes, na ordem em que chegaram. */
export const FONTES_SR1 = [
  { quando: 'semana 1', fonte: 'o caso da escola com o órgão' },
  { quando: '22/08', fonte: 'reunião com a secretaria' },
  { quando: '05/09', fonte: 'a portaria 001/2024' },
  { quando: '22/09', fonte: 'a planilha que eles usam' },
  { quando: '23/09', fonte: 'a base de desempenho por unidade' },
] as const

export const APRENDIZADOS_SR1 = {
  itens: [
    { antes: 'média dos valores', depois: 'média das notas' },
    { antes: 'faltou número, zera', depois: 'sai da conta com o peso' },
    { antes: 'nota de 0 a 10', depois: 'nota de 0 a 1' },
  ],
} as const

/** Slide 7: o estado de cada objetivo específico, hoje. */
/**
 * O estado de cada objetivo. "no prazo" é o objetivo cuja data ainda não
 * chegou: não é atraso, e também não é promessa cumprida.
 */
export type EstadoDoObjetivo = 'alcançado' | 'em parte' | 'no prazo'

export const ESTADO_DOS_OBJETIVOS: Record<
  (typeof OBJETIVOS_ESPECIFICOS)[number]['resumo'],
  EstadoDoObjetivo
> = {
  'a regra como dado': 'alcançado',
  'a conta sempre aberta': 'em parte',
  'nada muda sem registro': 'no prazo',
  'cada um vê o que é seu': 'alcançado',
  'conferido com o cliente': 'no prazo',
}

export const OBJETIVOS_NO_SR1 = OBJETIVOS_ESPECIFICOS.map((o) => ({
  resumo: o.resumo,
  quando: o.quando.toLowerCase(),
  estado: ESTADO_DOS_OBJETIVOS[o.resumo],
}))

/** Slide 18: cada compromisso do Kick-off com o estado de hoje. */
export type EstadoDoCompromisso = 'feito' | 'em parte' | 'não feito'

export const ESTADO_DOS_COMPROMISSOS: Record<
  (typeof COMPROMISSOS_ATE_O_SR1)[number]['ciclo'],
  { estado: EstadoDoCompromisso; porque: string }
> = {
  s5: {
    estado: 'em parte',
    porque: 'o jeito de calcular entrou; os indicadores ainda são de teste',
  },
  s6: {
    estado: 'feito',
    porque: `as ${TELAS_NO_SR1.length} telas estão no ar`,
  },
  sr1: {
    estado: 'não feito',
    porque: 'a conferência com a secretaria ficou para a semana 11',
  },
}

export const COMPROMISSOS_NO_SR1 = COMPROMISSOS_ATE_O_SR1.map((c) => ({
  ...c,
  ...ESTADO_DOS_COMPROMISSOS[c.ciclo],
}))

/* -------------------------------------------------------------------------
   As partes da rubrica
------------------------------------------------------------------------- */

/** Os seis critérios de conteúdo da rubrica do SR1, na ordem e com o número dela. */
export const PARTES_SR1 = [
  { id: 'imersao', criterio: 1, nome: 'imersão no problema' },
  { id: 'ideacao', criterio: 2, nome: 'ideação' },
  { id: 'solucao', criterio: 3, nome: 'proposta de solução' },
  { id: 'processo', criterio: 4, nome: 'metodologia e processo' },
  { id: 'planejado', criterio: 5, nome: 'planejado x realizado' },
  { id: 'balanco', criterio: 6, nome: 'pontos fortes e melhorias' },
] as const

export type ParteDaRubrica = (typeof PARTES_SR1)[number]['id']
/** A capa e o roteiro abrem; o fechamento encerra. Nenhum dos dois é critério. */
export type ParteId = ParteDaRubrica | 'abertura' | 'encerramento'

/* -------------------------------------------------------------------------
   O contrato do slide
------------------------------------------------------------------------- */

export interface SlideSR1 {
  readonly id: string
  readonly numero: number
  /** A parte da rubrica a que o slide responde. O rodapé mostra. */
  readonly parte: ParteId
  /** Em minúsculas: a identidade baixa tudo. */
  readonly titulo: string
  /** A frase que acompanha o título. Uma só. */
  readonly apoio: string
  /** O que a tela mostra, em uma linha: serve a quem ensaia sem o site. */
  readonly visual: string
  readonly segundos: number
  readonly quemFala: IntegranteId
  /** O que DIZER, uma ideia por linha. Cabe nos segundos do slide. */
  readonly notas: readonly string[]
  /** O que RESPONDER se perguntarem. Fora do tempo; aparece junto das notas. */
  readonly perguntas?: readonly string[]
}

/**
 * 11:35 de fala, para uma banca que interrompe em 15:00.
 *
 * A margem é de propósito: troca de quem fala, a demonstração ao vivo e o
 * nervoso do dia comem tempo que a conta de palavras não vê. Ensaio que fecha
 * no limite estoura no dia.
 */
export const DURACAO_SR1_SEGUNDOS = 695

/** O limite da banca, das orientações oficiais do SR1. */
export const LIMITE_SR1_SEGUNDOS = 15 * 60

/** Palavras por segundo de uma fala calma, a mesma conta da AV1 de ML. */
export const PALAVRAS_POR_SEGUNDO = 2.6

/** O teto de palavras na tela por slide: autocontido, sem virar teleprompter. */
export const TETO_DE_PALAVRAS_SR1 = 90

/** O PDF, gerado por `npm run pitch-pdf -- sr1` a partir da rota. */
export const ARQUIVO_PDF_SR1 = '/sr1/pdf'

export const SLIDES_SR1 = [
  /* ---------------------------------------------------------------- abertura */
  {
    id: 'capa',
    numero: 1,
    parte: 'abertura',
    titulo: 'prumo',
    apoio: 'o cálculo da gratificação da saúde do recife, aberto para qualquer um conferir',
    visual: 'Wordmark, o SR1 com a data, a disciplina, a equipe inteira e o cliente.',
    segundos: 15,
    quemFala: 'gabriel',
    notas: [
      'Bom dia. Somos a Equipe 2, e este é o Prumo, o nosso projeto com a Secretaria de Saúde do Recife.',
      'Os sete falam hoje, e qualquer um de nós responde às perguntas no fim.',
    ],
  },
  {
    id: 'roteiro',
    numero: 2,
    parte: 'abertura',
    titulo: 'o caminho de hoje',
    apoio: 'a ordem da rubrica do sr1. o rodapé de cada slide diz em que parte ele está.',
    visual: 'As seis partes da rubrica, com os slides de cada uma.',
    segundos: 10,
    quemFala: 'gabriel',
    notas: [
      'Seguimos a ordem da rubrica: o problema, as ideias, a solução, o processo, o planejado contra o realizado e o nosso balanço.',
    ],
  },

  /* ------------------------------------------------ 1 · imersão no problema */
  {
    id: 'problema',
    numero: 3,
    parte: 'imersao',
    titulo: 'o problema: uma conta de dinheiro feita à mão',
    apoio:
      'a prefeitura paga um extra no salário de quem dirige uma unidade de saúde e bate as metas do mês.',
    visual: 'Onde o problema ocorre, as causas e as consequências, em três blocos.',
    segundos: 40,
    quemFala: 'gabriel',
    notas: [
      'O problema. A prefeitura do Recife paga um extra no salário de quem dirige uma unidade de saúde e bate as metas do mês. A regra está numa portaria de 2024.',
      `Acontece todo mês, na Secretaria de Saúde, para ${B.unidades} unidades em ${DISTRITOS_NA_BASE} distritos.`,
      'A causa: a regra está escrita, mas a conta é feita à mão, numa planilha que pouca gente sabe mexer.',
      'A consequência: erro difícil de achar, e quem recebe o dinheiro não consegue conferir a própria nota.',
    ],
    perguntas: [
      'Por que este problema: é um cliente real, com a dor escrita desde 2023, e uma tentativa anterior de automatizar a conta parou.',
      'Os números da rede vêm da base de desempenho que a Secretaria enviou em 23 de setembro, sem nenhuma pessoa.',
    ],
  },
  {
    id: 'pesquisa',
    numero: 4,
    parte: 'imersao',
    titulo: 'o que pesquisamos, e o que aprendemos',
    apoio: `${porExtenso(FONTES_SR1.length)} fontes, cada uma com data. a planilha do cliente corrigiu ${porExtenso(APRENDIZADOS_SR1.itens.length)} pontos do nosso modelo.`,
    visual: 'As cinco fontes em ordem de chegada, com a planilha em destaque, e os três aprendizados.',
    segundos: 40,
    quemFala: 'matheus',
    notas: [
      `Pesquisamos em ${porExtenso(FONTES_SR1.length)} fontes, cada uma com data: o caso da escola, a reunião com a Secretaria em 22 de agosto, a portaria, a planilha que eles usam e a base de desempenho.`,
      'A planilha foi a que mais ensinou. A gente fazia a média dos valores; ela dá nota a cada item e faz a média das notas.',
      'Quando faltava um número, a gente zerava. Ela tira da conta, e o peso sai junto, como manda o artigo 8º.',
    ],
    perguntas: [
      'A pesquisa ainda não tem entrevista com quem opera o processo: as personas vieram do caso e da reunião. A entrevista está marcada para a Semana 11, com roteiro pronto em docs/validacao.md.',
      `A Secretaria autorizou o uso da base por unidade, sem nome, CPF ou matrícula (ADR-044). São ${B.linhas} linhas; ${B.modeladas} unidades seguem a conta da portaria.`,
      `Sobre a conta de hoje, a Secretaria respondeu por escrito em 22 de setembro: ${CITACAO_DA_SECRETARIA.frase}.`,
    ],
  },
  {
    id: 'csd',
    numero: 5,
    parte: 'imersao',
    titulo: 'o que sabemos, o que supomos e o que falta saber',
    apoio: 'a matriz csd, atualizada em 25/09 com a planilha e a base da secretaria.',
    visual: 'As três colunas da matriz, com a contagem e dois exemplos de cada, e o que a pesquisa respondeu.',
    segundos: 25,
    quemFala: 'matheus',
    notas: [
      `A matriz de certezas, suposições e dúvidas foi atualizada em 25 de setembro: ${CSD_EM_25_09.certezas.length} certezas, cada uma com a fonte, ${CSD_EM_25_09.suposicoes.length} suposições declaradas e ${CSD_EM_25_09.duvidas.length} dúvidas, cada uma com a pergunta para a Secretaria.`,
      'A maior dúvida é quanto se paga em cada classe da nota.',
    ],
    perguntas: [
      'A matriz do Kick-off continua no site, com a data dela. A de 25 de setembro está no documento de síntese da pesquisa, no SR1.',
    ],
  },
  {
    id: 'usuarios',
    numero: 6,
    parte: 'imersao',
    titulo: 'quem usa: personas e mapa de empatia',
    apoio: 'as personas do caso, e o mapa de empatia da analista que fecha a conta.',
    visual: 'As três personas, três quadrantes do mapa de empatia e os quatro papéis que elas viraram.',
    segundos: 35,
    quemFala: 'matheus',
    notas: [
      `Criamos ${porExtenso(PESSOAS.length)} personas a partir do caso: a analista que fecha a conta, a gerente que manda os números e a coordenadora que recebe o valor.`,
      'O mapa de empatia é da analista. A frase dela resume o medo: se mexer numa fórmula, tem que conferir a planilha inteira de novo.',
      `Na reunião de 22 de agosto, essas pessoas viraram os ${porExtenso(Object.keys(PERFIS).length)} papéis do sistema.`,
    ],
    perguntas: [
      'As personas são personagens, não gente real: vieram dos papéis descritos no caso, sem entrevista. A entrevista com quem opera o processo está no plano da Semana 11.',
      'A segunda persona nasceu como gestor de área técnica. Depois da reunião de 22 de agosto, virou a gerente da unidade, porque é a unidade que manda os números.',
    ],
  },
  {
    id: 'existentes',
    numero: 7,
    parte: 'imersao',
    titulo: 'o que já existe: benchmarking e swot',
    apoio: 'nenhuma junta regra com versão, conta aberta e registro de quem mudou.',
    visual: 'As cinco soluções estudadas com o que falta a cada uma, e os quatro quadrantes da SWOT.',
    segundos: 35,
    quemFala: 'kerry',
    notas: [
      `Antes de construir, olhamos ${porExtenso(BENCHMARKING.length)} soluções: painéis públicos de indicadores, sistemas de metas do SUS, duas ferramentas de metas de empresa e a própria planilha de hoje.`,
      'Cada uma resolve um pedaço. Nenhuma junta regra com versão, conta aberta e registro de quem mudou.',
      'Na SWOT, a força é o cliente real, com a regra escrita. A fraqueza: ninguém da equipe conhecia o processo por dentro, e a portaria só chegou na quinta semana.',
    ],
    perguntas: [
      'O benchmarking compara tipos de solução, não produtos com nome. Está na Semana 2 do site, com o que cada uma serve e o que não serve.',
    ],
  },
  {
    id: 'objetivos',
    numero: 8,
    parte: 'imersao',
    titulo: 'os objetivos, e o que já alcançamos',
    apoio: `objetivo geral: ${OBJETIVO_GERAL_CURTO}`,
    visual: 'Os cinco objetivos específicos com o prazo e o estado de hoje, e o escopo em uma linha.',
    segundos: 25,
    quemFala: 'kerry',
    notas: [
      'O objetivo geral é tirar a conta da planilha e deixar cada nota aberta para qualquer um conferir.',
      'Dos cinco específicos, dois já foram alcançados e um está em parte. Os outros dois têm prazo pela frente: o registro de tudo, na Semana 9, e a conferência com a Secretaria, na Semana 11.',
    ],
    perguntas: [
      'O escopo mudou duas vezes: na reunião de 22 de agosto e com a planilha de 22 de setembro. O escopo revisado está na Semana 6 do site.',
      'A conta aberta está em parte porque o ranking do painel da gestão mostra a nota sem a conta. Levar a conta a toda tela que mostra nota está no backlog.',
    ],
  },

  /* ------------------------------------------------------------ 2 · ideação */
  {
    id: 'tecnicas',
    numero: 9,
    parte: 'ideacao',
    titulo: 'como geramos as ideias',
    apoio: `${porExtenso(TECNICAS_DE_IDEACAO.length)} técnicas na semana 3, com uma regra: somar antes de criticar.`,
    visual: 'As três técnicas, com o tempo e o que cada uma produziu, e o funil até a escolhida.',
    segundos: 30,
    quemFala: 'joao-pedro',
    notas: [
      `Na Semana 3 usamos ${porExtenso(TECNICAS_DE_IDEACAO.length)} técnicas. No brainwriting, cada um escreveu ideias em silêncio e passou a folha adiante, para ninguém ser puxado por quem fala primeiro.`,
      `No brainstorming, juntamos as ideias parecidas em ${porExtenso(ALTERNATIVAS.length)} alternativas. E no crazy 8s, cada um desenhou oito telas em oito minutos.`,
    ],
    perguntas: [
      'O site tem o roteiro das três técnicas e o resultado, as oito alternativas. As folhas e os desenhos da sessão ainda não foram publicados: é um item em aberto no nosso checklist.',
      'SCAMPER não foi usado. As três técnicas couberam numa sessão de menos de uma hora.',
    ],
  },
  {
    id: 'escolha',
    numero: 10,
    parte: 'ideacao',
    titulo: 'os critérios, e a ideia escolhida',
    apoio: 'nota de 1 a 5 em impacto, esforço e aderência ao órgão público.',
    visual: 'As oito alternativas com as três notas e o destino de cada uma, a escolhida em destaque.',
    segundos: 30,
    quemFala: 'rafael',
    notas: [
      'Cada alternativa recebeu nota de 1 a 5 em três critérios, fixados antes das ideias: impacto, esforço e aderência ao órgão público.',
      'Venceu o sistema web com a conta aberta: maior impacto e maior aderência. Ele ataca a causa, porque hoje a regra só existe em fórmula de planilha.',
      'A planilha melhorada ficou como ponto de comparação, e o modelo que prevê risco entrou dentro do sistema.',
    ],
  },
  {
    id: 'disciplinas',
    numero: 11,
    parte: 'ideacao',
    titulo: 'o que cada disciplina pôs no produto',
    apoio: 'as três lentes técnicas da matriz, e a de direito, que a equipe acrescentou.',
    visual: 'Quatro cartões, um por disciplina, com duas decisões concretas de cada uma.',
    segundos: 35,
    quemFala: 'rafael',
    notas: [
      'A ideia escolhida ganhou peças de cada disciplina.',
      `Segurança: o que não é seu responde como se não existisse, e listamos ${CONTAGENS_PITCH.ameacasStride} ameaças uma a uma.`,
      'Nuvem: o sistema roda na Vercel, sem servidor para manter, e o desenho em quatro níveis está no site.',
      'Aprendizado de máquina: três modelos sobre a base real da Secretaria mostram o que pesa na nota, sem fazer a conta.',
      'E Direito: pelo artigo 20 da lei de dados, nota que decide salário precisa ser explicada. Por isso a conta fica aberta.',
    ],
    perguntas: [
      `O classificador acerta ${porcentoInteiro(ACERTO)}, contra ${porcentoInteiro(ACERTO_DO_CHUTE)} do chute mais simples, porque aprende a própria conta da portaria. Por isso o modelo diz o que pesa, e não calcula nada.`,
      `O agrupamento separa ${GRUPOS} grupos de unidades, nunca de pessoas, com silhueta de ${decimal(SILHUETA, 2)}. A apresentação completa está em /ml.`,
      `Das ${CONTAGENS_PITCH.itensOwasp} falhas mais comuns da lista OWASP, ${CONTAGENS_PITCH.owaspParciais} ainda estão pela metade. O login do sistema é simulado.`,
      'O banco de dados existe desenhado, com as regras de acesso testadas num Postgres de verdade, mas está desligado: o sistema roda em memória para qualquer pessoa clonar e rodar sem senha.',
    ],
  },

  /* ------------------------------------------------ 3 · proposta de solução */
  {
    id: 'solucao',
    numero: 12,
    parte: 'solucao',
    titulo: 'a solução: do número à nota, com a conta aberta',
    apoio: 'um sistema web que faz a conta da portaria e mostra de onde veio cada número.',
    visual: 'O caminho de um mês em quatro passos, com o papel de quem faz cada um, e as contagens do sistema.',
    segundos: 35,
    quemFala: 'joao-henrique',
    notas: [
      'A solução é um sistema web que faz a conta da portaria e mostra de onde veio cada número.',
      'Todo mês, a unidade lança os números, o distrito confere e a coordenação fecha o mês. Então cada um vê a própria nota, com a conta inteira embaixo.',
      `São ${TELAS_NO_SR1.length} telas e ${Object.keys(PERFIS).length} papéis. A regra é um dado com número de versão, separado do motor que faz a conta.`,
    ],
    perguntas: [
      'Hoje a regra nova entra por código, como dado. Cadastrar indicador e regra pela tela é história do backlog que ainda não está pronta.',
    ],
  },
  {
    id: 'wireframes',
    numero: 13,
    parte: 'solucao',
    titulo: 'os protótipos de baixa fidelidade',
    apoio: 'quatro desenhos das telas centrais, sem texto de propósito. cada um corresponde a uma tela do sistema.',
    visual: 'Os quatro wireframes, um por tela, com a legenda de cada.',
    segundos: 20,
    quemFala: 'joao-henrique',
    notas: [
      'Estes são os protótipos de baixa fidelidade das quatro telas centrais: o lançamento, a nota com a conta, o painel e o resultado do gestor.',
      'Cada desenho corresponde a uma tela, que vocês veem funcionando agora.',
    ],
    perguntas: [
      'Os quatro desenhos foram feitos na semana do Kick-off, a partir das primeiras telas, e o site diz essa data. Os rascunhos em papel do crazy 8s não foram publicados.',
      'Barra cinza no lugar de texto é de propósito: a conversa é sobre onde cada coisa fica, não sobre a frase.',
    ],
  },
  {
    id: 'demo',
    numero: 14,
    parte: 'solucao',
    titulo: 'o sistema funcionando, ao vivo',
    apoio: 'dados de teste: nenhuma pessoa real.',
    visual: 'O sistema ao vivo, lançando julho. De reserva, a nota de junho com a conta aberta, calculada na hora.',
    segundos: 70,
    quemFala: 'joao-pedro',
    notas: [
      'Agora o sistema funcionando, ao vivo, com dados de teste.',
      'Primeiro, a unidade. Escolho a USF Canário e lanço um número de julho, dizendo de onde ele veio.',
      'Depois, a coordenação. O painel mostra quem já mandou e quem falta, e o mês avança uma etapa por vez, até fechar.',
      'Por fim, o resultado, com a conta inteira embaixo. Cada linha mostra o número, o alvo, a nota e quanto pesa.',
      'Um item ficou sem número e saiu da conta com o peso junto, como manda o artigo 8º. A última linha fecha a conta: qualquer pessoa refaz no papel.',
      `Se a rede cair, esta tela mostra junho, já fechado: ${notaFalada(JUNHO_V3)}, com a mesma conta aberta.`,
    ],
    perguntas: [
      'Quem mexe na tela não é quem fala: assim a demonstração não depende de uma pessoa só.',
      'O que um visitante lança fica na sessão dele. A demonstração de um não muda a tela de outro.',
    ],
  },
  {
    id: 'diferenciais',
    numero: 15,
    parte: 'solucao',
    titulo: 'por que esta solução: três diferenciais',
    apoio: 'o que nenhuma das soluções estudadas junta.',
    visual: 'Os três diferenciais, com a prova de cada um: a conta aberta, maio que não muda e a porta que não abre.',
    segundos: 30,
    quemFala: 'joao-henrique',
    notas: [
      'Três diferenciais, e nenhuma solução que estudamos junta os três.',
      'A conta aberta: qualquer pessoa refaz a nota no papel.',
      `A regra com versão: quando a regra mudou em setembro, maio continuou com ${notaFalada(MAIO_V2)}. Pela regra nova daria ${notaFalada(MAIO_V3)}, mas mês fechado não muda.`,
      'E cada papel só vê o que é seu. Quem manda o número não escolhe a meta.',
    ],
    perguntas: [
      'O login ainda é simulado: você escolhe o papel. Um teste percorre as oito telas contra os quatro papéis e falha se uma porta abrir para quem não devia.',
      'A resposta é "não encontrado" e nunca "proibido" de propósito: da porta, não dá para saber se a tela existe.',
      `Junho já usa a regra nova e dá ${notaFalada(JUNHO_V3)}. O motor tem ${TESTES_DO_MOTOR} testes só dele, e cada envio de código roda todos de novo.`,
    ],
  },

  /* --------------------------------------------- 4 · metodologia e processo */
  {
    id: 'processo',
    numero: 16,
    parte: 'processo',
    titulo: 'o ciclo de vida do projeto',
    apoio: 'o semestre em fases, com um registro por semana no site.',
    visual: 'As fases do semestre com as datas do cronograma, o SR1 em destaque, a rotina da semana e o backlog priorizado.',
    segundos: 35,
    quemFala: 'fernando',
    notas: [
      'O semestre anda em fases: imersão, ideação, proposta, kick-off, e a arquitetura com o protótipo. Hoje é o SR1. Depois vêm quatro sprints, a validação com o cliente e o SR2.',
      'Toda semana tem registro no site, com o que avançou, o que travou e quem fez. Toda decisão fica escrita com o porquê.',
      `O backlog tem ${BACKLOG.length} histórias de usuário, priorizadas pelo método MoSCoW. Das ${historias('M')} obrigatórias, ${historias('M', 'no_ar')} já estão no ar.`,
    ],
    perguntas: [
      'As sprints da Semana 7 à 10 começam pelo retorno desta banca. A ordem do backlog muda com ele.',
    ],
  },
  {
    id: 'equipe',
    numero: 17,
    parte: 'processo',
    titulo: 'papéis e responsabilidades',
    apoio: 'sete pessoas, cada uma dona de uma frente.',
    visual: 'Os sete integrantes, com o papel e as responsabilidades de cada um.',
    segundos: 30,
    quemFala: 'fernando',
    notas: [
      'Gabriel cuida do produto e das prioridades, Matheus da pesquisa, com o apoio do Kerry, João Henrique da arquitetura e da conta, João Pedro das telas, Rafael dos dados, e eu da qualidade e da documentação.',
      'Kerry entrou no Kick-off, e a frente própria dele está sendo combinada com a equipe.',
    ],
  },
  {
    id: 'ferramentas',
    numero: 18,
    parte: 'processo',
    titulo: 'ferramentas, o site e o drive',
    apoio: 'onde o trabalho acontece, e onde cada entrega fica.',
    visual: 'As ferramentas com o uso de cada uma, as oito seções do site no lugar do Google Site e o que a pasta do Drive guarda.',
    segundos: 30,
    quemFala: 'fernando',
    notas: [
      'O código e os testes ficam no GitHub, e cada envio roda os testes sozinho. O site roda na Vercel.',
      'O site faz o papel do Google Site: as oito seções do briefing e o diário de bordo de cada semana, com cada documento aberto ali mesmo.',
      'A pasta do Drive guarda os PDFs das apresentações.',
    ],
    perguntas: [
      'O Google Site foi trocado pelo site do projeto na Semana 1: cada versão fica guardada no Git, com a data.',
      'O uso de IA está registrado em /transparencia-ia, com o nome de quem conferiu cada uso.',
    ],
  },

  /* ---------------------------------------------- 5 · planejado x realizado */
  {
    id: 'planejado',
    numero: 19,
    parte: 'planejado',
    titulo: 'planejado x realizado: as entregas',
    apoio: 'o que cada fase pedia, o que foi entregue e quem respondeu.',
    visual: 'A tabela das fases até o SR1, com entregas, responsáveis e o que está em andamento.',
    segundos: 30,
    quemFala: 'gabriel',
    notas: [
      'Esta é a comparação do cronograma com o que entregamos, fase a fase, com quem respondeu por cada entrega.',
      `Até hoje o cronograma pedia ${PLANEJADAS_ATE_O_SR1} entregas. Entregamos ${ENTREGUES_ATE_O_SR1}, e as ${EM_ANDAMENTO_ATE_O_SR1} que faltam estão em andamento, escritas embaixo da tabela.`,
    ],
  },
  {
    id: 'avanco',
    numero: 20,
    parte: 'planejado',
    titulo: 'o avanço, e o estágio de hoje',
    apoio: 'protótipo navegável, com dados de teste. os percentuais saem do cronograma e do backlog.',
    visual: 'Três percentuais de avanço com a conta de cada um, e os três compromissos do Kick-off com o estado.',
    segundos: 25,
    quemFala: 'gabriel',
    notas: [
      `Estamos na semana ${SEMANA_DO_SR1} de ${SEMANAS_NO_SEMESTRE}, com ${AVANCO[1].numero} das entregas do semestre feitas, e ${AVANCO[2].numero} das histórias do backlog no ar.`,
      'Dos três compromissos do Kick-off, um foi feito, um saiu em parte e um não foi feito: a conferência com a Secretaria ficou para a Semana 11.',
    ],
    perguntas: [
      'No Kick-off também dissemos que o prazo de contestação entraria na regra 3. Não entrou: ficou para a Sprint 3, e a tela diz que ele ainda não existe.',
    ],
  },

  /* ------------------------------------------ 6 · pontos fortes e melhorias */
  {
    id: 'balanco',
    numero: 21,
    parte: 'balanco',
    titulo: 'pontos fortes, pontos de melhoria e riscos',
    apoio: 'do projeto e da equipe. a seta diz o que fazemos.',
    visual: 'Três colunas: pontos fortes, pontos de melhoria com o tratamento, e os três riscos maiores com o tratamento.',
    segundos: 40,
    quemFala: 'rafael',
    notas: [
      'Pontos fortes: um cliente real com regra escrita, o sistema no ar com as oito telas, e uma equipe com frentes separadas.',
      'Pontos de melhoria: a pesquisa ainda não tem entrevista, e vamos entrevistar na Semana 11. E o registro das entregas ficou concentrado em poucas pessoas: nas sprints, cada entrega tem um dono.',
      'O maior risco é o percentual pago em cada classe, que ainda é suposição. Vamos buscar o decreto e levar as perguntas por escrito.',
    ],
    perguntas: [
      'O registro de riscos inteiro está na Semana 6 do site, com probabilidade, impacto, mitigação e dono.',
      'Uma unidade que é única no distrito pode apontar quem a dirige. Isso está na análise de privacidade, e é uma pergunta para a Secretaria.',
      'O retorno desta banca entra por cima de tudo isso, na primeira sprint.',
    ],
  },

  /* ------------------------------------------------------------ encerramento */
  {
    id: 'fechamento',
    numero: 22,
    parte: 'encerramento',
    titulo: 'conclusão e próximos passos',
    apoio: 'do problema ao plano, em uma linha. obrigado.',
    visual: 'A linha do problema à solução e ao plano, as paradas até o SR2 com a data de cada uma, o endereço do site e a pergunta para a banca.',
    segundos: 30,
    quemFala: 'kerry',
    notas: [
      'Para fechar: o problema é uma regra que só existe em fórmula de planilha. A solução deixa a regra com versão e a conta aberta.',
      'O plano até o SR2: quatro sprints, e na Semana 11 a Secretaria confere a conta com a gente.',
      'Obrigado. Tudo está no site, e qualquer um de nós responde.',
    ],
  },
] as const satisfies readonly SlideSR1[]

export type SlideSR1Id = (typeof SLIDES_SR1)[number]['id']

/** A lista como o tipo largo, para quem só precisa do contrato. */
const LISTA = SLIDES_SR1 as readonly SlideSR1[]

/** O primeiro e o último slide de uma parte, na numeração do deck. */
export function slidesDaParte(parte: ParteId): readonly [number, number] {
  const numeros = LISTA.filter((s) => s.parte === parte).map((s) => s.numero)
  if (numeros.length === 0) throw new Error(`Parte sem slide: ${parte}`)
  return [numeros[0], numeros[numeros.length - 1]]
}

/** "slides 3 a 8", "slides 19 e 20", ou "slide 21" quando a parte tem um só. */
export function intervaloDaParte(parte: ParteId): string {
  const [primeiro, ultimo] = slidesDaParte(parte)
  if (primeiro === ultimo) return `slide ${primeiro}`
  return ultimo === primeiro + 1
    ? `slides ${primeiro} e ${ultimo}`
    : `slides ${primeiro} a ${ultimo}`
}

/** O que o rodapé diz da parte: o número do critério e o nome, ou nada. */
export function rotuloDaParte(parte: ParteId): string | null {
  if (parte === 'abertura') return null
  if (parte === 'encerramento') return 'encerramento'
  const achada = PARTES_SR1.find((p) => p.id === parte)
  return achada ? `${achada.criterio} · ${achada.nome}` : null
}

/* -------------------------------------------------------------------------
   O TEXTO DE CADA VISUAL

   Curto de propósito. O que explica mora nas `notas` do slide.
------------------------------------------------------------------------- */

/** Capa. */
export const PILULA_DA_CAPA_SR1 = 'sr1 · status report 1'

/** Slide 2: cada parte da rubrica com os slides dela. */
export const ROTEIRO_SR1 = PARTES_SR1.map((p) => ({
  ...p,
  slides: intervaloDaParte(p.id),
}))

/** Slide 3: onde, por quê e o que acontece. */
export const PROBLEMA_SR1 = {
  onde: {
    rotulo: 'onde ocorre',
    texto: `na secretaria de saúde do recife, todo mês: ${B.unidades} unidades em ${DISTRITOS_NA_BASE} distritos`,
  },
  causas: {
    rotulo: 'causas',
    itens: [
      'a regra está na portaria; a conta, numa planilha',
      'fórmula arrastada à mão, célula a célula',
      'pouca gente sabe fazer a conta',
    ],
  },
  consequencias: {
    rotulo: 'consequências',
    itens: [
      'erro difícil de achar',
      'quem recebe não confere a própria nota',
      'o processo para quando essas pessoas faltam',
    ],
  },
} as const

/** Slide 5: a matriz de 25/09, com a contagem e dois exemplos por coluna. */
export const CSD_SR1 = [
  { rotulo: 'certezas', itens: CSD_EM_25_09.certezas },
  { rotulo: 'suposições', itens: CSD_EM_25_09.suposicoes },
  { rotulo: 'dúvidas', itens: CSD_EM_25_09.duvidas },
].map((coluna) => ({
  rotulo: coluna.rotulo,
  total: coluna.itens.length,
  exemplos: coluna.itens.slice(0, 2).map((l) => l.item.toLowerCase()),
}))

/**
 * O que a pesquisa respondeu da matriz do Kick-off. A mesma conta da nota do
 * documento de síntese da pesquisa, no SR1: a dúvida do peso do art. 8º virou
 * certeza, e a suposição de que a planilha confirmaria o modelo caiu.
 */
export const CSD_RESPONDIDO = {
  rotulo: 'desde o kick-off',
  texto: 'uma dúvida virou certeza, e uma suposição caiu',
} as const

export const COLUNAS_DAS_FONTES = { fontes: 'as fontes', aprendizados: 'o que aprendemos' } as const

/** Slide 5: as personas são as do Kick-off; o mapa, o da Semana 2. */
export { PESSOAS }

export const ROTULO_DAS_PERSONAS = 'personas'
export const MAPA_NO_SR1 = MAPA_DE_EMPATIA.filter((q) =>
  ['Diz', 'Dores', 'Ganhos'].includes(q.termo),
)
export const ROTULO_DO_MAPA_SR1 = 'mapa de empatia'
export const ROTULO_DOS_PAPEIS = `no sistema, ${Object.keys(PERFIS).length} papéis`

/** Os papéis na ordem do processo: de quem coordena a quem manda o número. */
export const ORDEM_DOS_PAPEIS: readonly PerfilId[] = [
  'seab',
  'administrador',
  'gerente_distrital',
  'gerente_unidade',
]

export const NOME_DO_PAPEL: Record<PerfilId, string> = Object.fromEntries(
  Object.entries(PERFIS).map(([id, perfil]) => [id, perfil.rotulo.toLowerCase()]),
) as Record<PerfilId, string>

/** Slide 6: o benchmarking pela lacuna, e a SWOT pelo resumo. */
export const REFERENCIAS_SR1 = BENCHMARKING.map((r) => ({ nome: r.curto, lacuna: r.lacuna }))
export const QUADRANTES_SR1 = SWOT.map((q) => ({ titulo: q.titulo.toLowerCase(), curto: q.curto }))
export const COLUNAS_DOS_EXISTENTES = {
  benchmarking: `benchmarking: ${BENCHMARKING.length} soluções, e o que falta a cada uma`,
  swot: 'swot',
} as const

export const ESCOPO_SR1 = {
  rotulo: 'escopo de hoje',
  dentro: 'lançar os números, fazer a conta e mostrar cada nota com a conta aberta',
  fora: 'fora: folha de pagamento, login da prefeitura e dado de pessoa',
} as const

/** Slide 8: as técnicas, como a Semana 3 registrou. */
export const TECNICAS_SR1 = TECNICAS_DE_IDEACAO.map((t) => ({
  nome: t.nome.toLowerCase(),
  minutos: t.minutos,
  produto: t.produtoCurto,
}))
export const ROTULO_DOS_MINUTOS = 'min'
export const FUNIL_DA_IDEACAO = [
  { numero: ALTERNATIVAS.length, rotulo: 'alternativas' },
  { numero: 1, rotulo: 'escolhida' },
] as const

/** Slide 9: a matriz de decisão inteira. */
export const COLUNAS_DA_MATRIZ = {
  alternativa: 'alternativa',
  impacto: 'impacto',
  esforco: 'esforço',
  aderencia: 'aderência',
  destino: 'destino',
} as const
export const ALTERNATIVAS_SR1 = ALTERNATIVAS.map((a) => ({
  nome: a.curto,
  impacto: a.impacto,
  esforco: a.esforco,
  aderencia: a.aderencia,
  destino: a.situacao.toLowerCase(),
  escolhida: a.situacao === 'Escolhida',
}))
export const LEGENDA_DA_MATRIZ = 'esforço alto quer dizer mais trabalho'

/** Slide 10: o que cada disciplina decidiu no produto. */
export const DISCIPLINAS_SR1 = [
  {
    nome: 'segurança da informação',
    itens: [
      'o que não é seu responde "não encontrado" (404)',
      `${CONTAGENS_PITCH.ameacasStride} ameaças listadas (STRIDE)`,
    ],
  },
  {
    nome: 'arquitetura nativa em nuvem',
    itens: ['roda na vercel, sem servidor para manter', 'desenho em quatro níveis (C4)'],
  },
  {
    nome: 'aprendizado de máquina',
    itens: ['três modelos sobre a base da secretaria', 'sinalizam, nunca mudam nota'],
  },
  {
    nome: 'direito',
    itens: ['nota que decide salário se explica (LGPD, art. 20)', 'nenhuma pessoa no sistema'],
  },
] as const

/** Slide 11: o caminho de um mês, e quem faz cada passo. */
export const FLUXO_DO_MES = [
  { quem: NOME_DO_PAPEL.gerente_unidade, faz: 'lança os números do mês' },
  { quem: NOME_DO_PAPEL.gerente_distrital, faz: 'confere as unidades do distrito' },
  { quem: NOME_DO_PAPEL.seab, faz: 'fecha o mês e faz a conta' },
  { quem: 'cada um', faz: 'vê a própria nota com a conta aberta' },
] as const

export const CONTAGENS_DA_SOLUCAO = {
  telas: 'telas',
  papeis: 'papéis',
  regras: 'versões da regra',
} as const

/** Slide 12: as legendas são as do Kick-off. */
export { LEGENDAS_DO_WIREFRAME }

/** Slide 13: o rótulo da demonstração de reserva. */
export const ROTULO_DA_DEMO_SR1 = 'junho, já fechado · dados de teste, nenhuma pessoa real'
export const ENDERECO_DA_DEMO = '/sistema'

/** O nome da unidade vem da base, como no Kick-off: é dado, não texto nosso. */
export const NOME_DA_UNIDADE_DO_DECK =
  BASE.unidades.find((u) => u.id === UNIDADE_DO_DECK)?.nome ?? UNIDADE_DO_DECK

/** Slide 14: os três diferenciais, e a prova de cada um. */
export const DIFERENCIAIS_SR1 = [
  {
    id: 'conta',
    titulo: 'conta aberta',
    texto: 'qualquer pessoa refaz a nota no papel, linha por linha',
  },
  {
    id: 'versao',
    titulo: 'regra com versão',
    texto: 'mês fechado não muda quando a regra muda',
    numero: nota(MAIO_V2),
    legenda: `maio, pela regra de maio. pela regra nova, daria ${nota(MAIO_V3)}`,
  },
  {
    id: 'papeis',
    titulo: 'cada um vê o seu',
    texto: 'quem manda o número não escolhe a meta',
  },
] as const

export const REGRA_DA_PORTA = 'o que não é seu responde "não encontrado" (404), nunca "proibido"'

/** Slide 15: as fases do semestre. As datas saem do cronograma. */
export const FASES_DO_SEMESTRE: readonly {
  nome: string
  ciclos: readonly [CicloId, ...CicloId[]]
  atual?: true
}[] = [
  { nome: 'imersão', ciclos: ['s1', 's2'] },
  { nome: 'ideação', ciclos: ['s3'] },
  { nome: 'proposta', ciclos: ['s4'] },
  { nome: 'kick-off', ciclos: ['ko'] },
  { nome: 'protótipo', ciclos: ['s5', 's6'] },
  { nome: 'sr1', ciclos: ['sr1'], atual: true },
  { nome: 'sprints 1 a 4', ciclos: ['s7', 's8', 's9', 's10'] },
  { nome: 'validação', ciclos: ['s11'] },
  { nome: 'sr2', ciclos: ['s12', 'sr2'] },
]

export const ROTINA_DA_SEMANA = {
  rotulo: 'toda semana',
  itens: [
    'registro no site: o que avançou, o que travou, quem fez',
    'cada decisão escrita, com o porquê',
    'testes automáticos a cada envio ao github',
  ],
} as const

export const BACKLOG_SR1 = {
  rotulo: 'backlog priorizado (MoSCoW)',
  itens: [
    { numero: historias('M'), rotulo: 'obrigatórias', noAr: historias('M', 'no_ar') },
    { numero: historias('S'), rotulo: 'desejáveis', noAr: historias('S', 'no_ar') },
    { numero: historias('C'), rotulo: 'possíveis', noAr: historias('C', 'no_ar') },
  ],
  noAr: 'no ar',
} as const

/**
 * Slide 17: papel e responsabilidades. A responsabilidade é a frente de
 * `equipe.ts` dita em palavras simples: a frente original usa termos que o
 * teste de palavra difícil barra no palco.
 */
export const RESPONSABILIDADES_SR1: Record<IntegranteId, string> = {
  gabriel: 'escopo, backlog e contato com o cliente',
  matheus: 'personas, benchmarking e entrevistas',
  'joao-henrique': 'modelo de dados e motor da conta',
  'joao-pedro': 'telas e acessibilidade',
  rafael: 'dados e modelos de previsão',
  fernando: 'testes, documentação e LGPD',
  kerry: 'apoio ao benchmarking e à validação',
}

export const EQUIPE_SR1 = EQUIPE.map((i) => ({
  id: i.id,
  nome: nomeCurto(i.id),
  papel: i.papel.toLowerCase(),
  responsabilidades: RESPONSABILIDADES_SR1[i.id],
}))

export const COLUNAS_DA_EQUIPE = {
  nome: 'quem',
  papel: 'papel',
  responsabilidades: 'responsabilidades',
} as const

/** Slide 18: as ferramentas, o site e o Drive. */
export const FERRAMENTAS_SR1 = [
  { nome: 'github', para: 'código e testes a cada envio' },
  { nome: 'vercel', para: 'o site no ar' },
  { nome: 'jupyter', para: 'os cadernos de dados' },
  { nome: 'claude (IA)', para: 'cada uso registrado' },
  { nome: 'google drive', para: 'a pasta da equipe' },
] as const

export const SITE_SR1 = {
  rotulo: 'o site, no lugar do google site',
  diario: 'e o diário de bordo semanal',
} as const

export const DRIVE_SR1 = {
  rotulo: 'a pasta do drive',
  itens: ['os pdfs do kick-off e do sr1'],
} as const

export const ROTULO_DAS_FERRAMENTAS = 'ferramentas'

/** Slide 17: as colunas da tabela e o rótulo do que falta. */
export const COLUNAS_DO_PLANEJADO = {
  fase: 'fase',
  data: 'data',
  entregue: 'entregue',
  quem: 'responsáveis',
} as const
export const ROTULO_EM_ANDAMENTO = 'em andamento'

export const ROTULO_DOS_COMPROMISSOS = 'o que prometemos no kick-off'

/**
 * Slide 21: o balanço do projeto e da equipe. Os riscos são os três maiores
 * do registro da Semana 6; a melhoria da equipe sai do checklist, em que as
 * entregas até o SR1 ficaram registradas em nome de poucas pessoas.
 */
export const BALANCO_SR1 = {
  fortes: {
    rotulo: 'pontos fortes',
    itens: [
      'cliente real, com regra escrita',
      `as ${TELAS_NO_SR1.length} telas no ar`,
      'sete frentes, cada uma com dono',
    ],
  },
  melhorias: {
    rotulo: 'pontos de melhoria',
    itens: [
      { ponto: 'pesquisa sem entrevista', trato: 'entrevistar na semana 11' },
      { ponto: 'entregas em nome de poucos', trato: 'um dono por entrega nas sprints' },
      { ponto: 'perguntas sem resposta', trato: 'mandar por escrito, com prazo' },
    ],
  },
  riscos: {
    rotulo: 'riscos maiores',
    itens: [
      { ponto: 'percentual das classes sem fonte', trato: 'buscar o decreto' },
      { ponto: 'indicadores de teste', trato: 'trocar pelos 5 da portaria' },
      { ponto: 'agenda do cliente', trato: 'pedir já a data da semana 11' },
    ],
  },
} as const

/** Slide 20: as paradas até o SR2, lidas do cronograma, e o que cada uma entrega. */
export const PARADAS_ATE_O_SR2: readonly { ciclo: CicloId; entrega: string; destaque?: true }[] = [
  { ciclo: 's7', entrega: 'o retorno do sr1 aplicado' },
  { ciclo: 's8', entrega: 'os indicadores da portaria' },
  { ciclo: 's9', entrega: 'porte e prazo de contestação' },
  { ciclo: 's10', entrega: 'a conta testada com linhas reais' },
  { ciclo: 's11', entrega: 'a secretaria confere a conta', destaque: true },
  { ciclo: 's12', entrega: 'o material do sr2' },
  { ciclo: 'sr2', entrega: 'a entrega final' },
]

/** Slide 22: a relação que a rubrica pede, do problema à solução e ao plano. */
export const CONCLUSAO_SR1 = [
  { rotulo: 'o problema', texto: 'a regra só existe em fórmula de planilha' },
  { rotulo: 'a solução', texto: 'a regra com versão, e a conta aberta' },
  { rotulo: 'o plano', texto: 'os indicadores reais, e a secretaria confere a conta' },
] as const

export const PERGUNTA_FINAL = 'perguntas?'

export const ROTULO_SE_PERGUNTAREM_SR1 = 'se perguntarem'

/* -------------------------------------------------------------------------
   O que conta como texto de tela
------------------------------------------------------------------------- */

/**
 * Todo texto que o autor põe na tela, por slide, INCLUSIVE o que vem de outra
 * fonte (análises, equipe, papéis): o teto mede o que a banca lê, e não de
 * onde a palavra veio. Número puro não conta, porque não tem letra.
 */
export function textoNaTela(id: SlideSR1Id): readonly string[] {
  const slide = SLIDES_SR1.find((s) => s.id === id)
  if (!slide) throw new Error(`Slide desconhecido: ${id}`)
  const base = [slide.titulo, slide.apoio]

  switch (id) {
    case 'capa':
      return [slide.apoio, PILULA_DA_CAPA_SR1]
    case 'roteiro':
      return [...base, ...ROTEIRO_SR1.flatMap((p) => [p.nome, p.slides])]
    case 'problema':
      return [
        ...base,
        PROBLEMA_SR1.onde.rotulo,
        PROBLEMA_SR1.onde.texto,
        PROBLEMA_SR1.causas.rotulo,
        ...PROBLEMA_SR1.causas.itens,
        PROBLEMA_SR1.consequencias.rotulo,
        ...PROBLEMA_SR1.consequencias.itens,
      ]
    case 'pesquisa':
      return [
        ...base,
        COLUNAS_DAS_FONTES.fontes,
        ...FONTES_SR1.flatMap((f) => [f.quando, f.fonte]),
        COLUNAS_DAS_FONTES.aprendizados,
        ...APRENDIZADOS_SR1.itens.flatMap((a) => [a.antes, a.depois]),
      ]
    case 'csd':
      return [
        ...base,
        ...CSD_SR1.flatMap((c) => [c.rotulo, ...c.exemplos]),
        CSD_RESPONDIDO.rotulo,
        CSD_RESPONDIDO.texto,
      ]
    case 'usuarios':
      return [
        ...base,
        ROTULO_DAS_PERSONAS,
        ...PESSOAS.flatMap((p) => [p.quem, p.dor]),
        ROTULO_DO_MAPA_SR1,
        ...MAPA_NO_SR1.flatMap((q) => [q.termo, q.curto]),
        ROTULO_DOS_PAPEIS,
        ...ORDEM_DOS_PAPEIS.map((p) => NOME_DO_PAPEL[p]),
      ]
    case 'existentes':
      return [
        ...base,
        COLUNAS_DOS_EXISTENTES.benchmarking,
        ...REFERENCIAS_SR1.flatMap((r) => [r.nome, r.lacuna]),
        COLUNAS_DOS_EXISTENTES.swot,
        ...QUADRANTES_SR1.flatMap((q) => [q.titulo, q.curto]),
      ]
    case 'objetivos':
      return [
        ...base,
        ...OBJETIVOS_NO_SR1.flatMap((o) => [o.resumo, o.quando, o.estado]),
        ESCOPO_SR1.rotulo,
        ESCOPO_SR1.dentro,
        ESCOPO_SR1.fora,
      ]
    case 'tecnicas':
      return [
        ...base,
        ...TECNICAS_SR1.flatMap((t) => [t.nome, ROTULO_DOS_MINUTOS, t.produto]),
        ...FUNIL_DA_IDEACAO.map((f) => f.rotulo),
      ]
    case 'escolha':
      return [
        ...base,
        ...Object.values(COLUNAS_DA_MATRIZ),
        ...ALTERNATIVAS_SR1.flatMap((a) => [a.nome, a.destino]),
        LEGENDA_DA_MATRIZ,
      ]
    case 'disciplinas':
      return [...base, ...DISCIPLINAS_SR1.flatMap((d) => [d.nome, ...d.itens])]
    case 'solucao':
      return [
        ...base,
        ...FLUXO_DO_MES.flatMap((p) => [p.quem, p.faz]),
        ...Object.values(CONTAGENS_DA_SOLUCAO),
      ]
    case 'wireframes':
      return [...base, ...LEGENDAS_DO_WIREFRAME]
    case 'demo':
      // A frase de apoio aparece; a conta de reserva é a interface do
      // sistema, não texto nosso, e fica fora do teto como no Kick-off.
      return [...base, ROTULO_DA_DEMO_SR1, ENDERECO_DA_DEMO]
    case 'diferenciais':
      return [
        ...base,
        ...DIFERENCIAIS_SR1.flatMap((d) =>
          'legenda' in d ? [d.titulo, d.texto, d.legenda] : [d.titulo, d.texto],
        ),
        REGRA_DA_PORTA,
      ]
    case 'processo':
      return [
        ...base,
        ...FASES_DO_SEMESTRE.map((f) => f.nome),
        ROTINA_DA_SEMANA.rotulo,
        ...ROTINA_DA_SEMANA.itens,
        BACKLOG_SR1.rotulo,
        ...BACKLOG_SR1.itens.map((i) => i.rotulo),
        BACKLOG_SR1.noAr,
      ]
    case 'equipe':
      return [
        ...base,
        ...Object.values(COLUNAS_DA_EQUIPE),
        ...EQUIPE_SR1.flatMap((i) => [i.nome, i.papel, i.responsabilidades]),
      ]
    case 'ferramentas':
      return [
        ...base,
        ROTULO_DAS_FERRAMENTAS,
        ...FERRAMENTAS_SR1.flatMap((f) => [f.nome, f.para]),
        SITE_SR1.rotulo,
        ENDERECO_SITE,
        ...SECOES.map((secao) => secao.rotulo),
        SITE_SR1.diario,
        DRIVE_SR1.rotulo,
        ...DRIVE_SR1.itens,
      ]
    case 'planejado':
      return [
        ...base,
        ...Object.values(COLUNAS_DO_PLANEJADO),
        ...PLANEJADO_X_REALIZADO.flatMap((l) => [
          cicloPorId(l.ciclo).rotulo,
          ...l.responsaveis.map((r) => nomeCurto(r)),
        ]),
        ROTULO_EM_ANDAMENTO,
        ...PLANEJADO_X_REALIZADO.flatMap((l) => l.emAndamento),
      ]
    case 'avanco':
      return [
        ...base,
        ...AVANCO.flatMap((a) => [a.rotulo, a.conta]),
        ROTULO_DOS_COMPROMISSOS,
        ...COMPROMISSOS_NO_SR1.flatMap((c) => [c.compromisso, c.estado]),
      ]
    case 'balanco':
      return [
        ...base,
        BALANCO_SR1.fortes.rotulo,
        ...BALANCO_SR1.fortes.itens,
        BALANCO_SR1.melhorias.rotulo,
        ...BALANCO_SR1.melhorias.itens.flatMap((m) => [m.ponto, m.trato]),
        BALANCO_SR1.riscos.rotulo,
        ...BALANCO_SR1.riscos.itens.flatMap((r) => [r.ponto, r.trato]),
      ]
    case 'fechamento':
      return [
        ...base,
        ...CONCLUSAO_SR1.flatMap((c) => [c.rotulo, c.texto]),
        ...PARADAS_ATE_O_SR2.map((p) => p.entrega),
        PERGUNTA_FINAL,
      ]
    default:
      return base
  }
}

function contarPalavras(texto: string): number {
  return texto.split(/\s+/).filter((palavra) => /[a-zA-Zà-úÀ-Ú]/.test(palavra)).length
}

/** Quantas palavras aquele slide põe na tela. */
export function palavrasNaTela(id: SlideSR1Id): number {
  return contarPalavras(textoNaTela(id).join(' '))
}

/** Quantas palavras a fala daquele slide tem. */
export function palavrasFaladas(slide: SlideSR1): number {
  return slide.notas.join(' ').split(/\s+/).filter(Boolean).length
}

/** Em que segundo da apresentação o slide de índice `indice` começa. */
export function inicioDoSlide(indice: number): number {
  return LISTA.slice(0, indice).reduce((soma, slide) => soma + slide.segundos, 0)
}

/** Quanto tempo cada pessoa fala. */
export function tempoPorIntegranteSR1(): ReadonlyMap<IntegranteId, number> {
  const mapa = new Map<IntegranteId, number>()
  for (const slide of LISTA) {
    mapa.set(slide.quemFala, (mapa.get(slide.quemFala) ?? 0) + slide.segundos)
  }
  return mapa
}

/** A data do SR1, do cronograma. */
export const DATA_DO_SR1 = cicloPorId('sr1').data

export { formatarTempo }
