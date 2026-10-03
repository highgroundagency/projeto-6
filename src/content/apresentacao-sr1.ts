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
import { DADOS_PESSOAIS, REQUISITOS_DE_PRIVACIDADE, contarRequisitos } from '@/content/privacidade'
import { ENDERECO_SITE, OBJETIVOS_ESPECIFICOS, OBJETIVO_GERAL_CURTO } from '@/content/produto'
import { calcularAvaliacao } from '@/lib/calculo/motor'
import type { Avaliacao } from '@/lib/calculo/tipos'
import { CRONOGRAMA, cicloPorId, indiceDoCiclo, type CicloId } from '@/lib/cronograma'
import { formatarBR, formatarExtenso } from '@/lib/datas'
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

/**
 * O que ainda falta até o SR1, agrupado por quem responde, com o nome curto
 * que o SR1 usa. O rótulo do cronograma ("Brainwriting, Brainstorming e
 * Crazy 8's registrados"), solto na tela, sugere que a sessão não aconteceu;
 * o que falta é o registro dela.
 */
const NOME_SR1_DA_EVIDENCIA: Record<string, { tela: string; fala: string }> = {
  "Brainwriting, Brainstorming e Crazy 8's registrados": {
    tela: 'registro da ideação',
    fala: 'o registro da sessão de ideação',
  },
  'Pacote SR1': { tela: 'pacote do SR1', fala: 'o pacote deste SR1' },
  'Escopo maduro': { tela: 'escopo maduro', fala: 'o escopo maduro' },
  'Plano de correção de rota': {
    tela: 'plano de correção de rota',
    fala: 'o plano de correção de rota',
  },
}

function donoDa(ciclo: CicloId, evidencia: string): IntegranteId | null {
  return CHECKLIST.find((i) => i.ciclo === ciclo && i.evidencia === evidencia)?.responsavel ?? null
}

/** "a, b e c": a lista dita em português. */
function listaFalada(itens: readonly string[]): string {
  return itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`
}

interface GrupoEmAndamento {
  readonly dono: IntegranteId | null
  /** Sem artigo, para caber na linha. */
  readonly itens: readonly string[]
  readonly falados: readonly string[]
}

export const EM_ANDAMENTO_SR1: readonly GrupoEmAndamento[] = (() => {
  const grupos = new Map<IntegranteId | null, { itens: string[]; falados: string[] }>()
  for (const linha of PLANEJADO_X_REALIZADO) {
    for (const evidencia of linha.emAndamento) {
      const dono = donoDa(linha.ciclo, evidencia)
      const nome = NOME_SR1_DA_EVIDENCIA[evidencia] ?? {
        tela: evidencia.toLowerCase(),
        fala: evidencia.toLowerCase(),
      }
      const grupo = grupos.get(dono) ?? { itens: [], falados: [] }
      grupo.itens.push(nome.tela)
      grupo.falados.push(nome.fala)
      grupos.set(dono, grupo)
    }
  }
  return [...grupos].map(([dono, g]) => ({ dono, ...g }))
})()

/** Quem fala o slide 19. A fala diz "comigo" quando o dono é ele mesmo. */
export const QUEM_FALA_O_PLANEJADO: IntegranteId = 'gabriel'

/**
 * A mesma lista, na fala: "com o João Pedro, o registro da sessão de ideação;
 * e comigo, o pacote deste SR1". O dono vem antes, para a frase não soar como
 * "o João Pedro e o pacote".
 */
const EM_ANDAMENTO_FALADO = EM_ANDAMENTO_SR1.map(({ dono, falados }) => {
  const quem = !dono
    ? ''
    : dono === QUEM_FALA_O_PLANEJADO
      ? 'comigo, '
      : `com o ${nomeCurto(dono)}, `
  return quem + listaFalada(falados)
}).join('; e ')

/**
 * Slide 19: quem não aparece na tabela, e por quê. Calculado: quem está na
 * equipe e não responde por nenhuma entrega do cronograma. Quando todos
 * aparecerem, o apoio volta a descrever a tabela.
 */
const FRENTE_FORA_DA_TABELA: Partial<Record<IntegranteId, string>> = {
  rafael: 'aprendizado de máquina',
  kerry: 'apoio à pesquisa',
}
export const FORA_DA_TABELA = EQUIPE.filter(
  (i) => !PLANEJADO_X_REALIZADO.some((l) => l.responsaveis.includes(i.id)),
).map((i) => ({ id: i.id, frente: FRENTE_FORA_DA_TABELA[i.id] }))

const APOIO_DO_PLANEJADO =
  FORA_DA_TABELA.length === 0
    ? 'o que cada fase pedia, o que foi entregue e quem respondeu.'
    : `fora da tabela: ${listaFalada(
        FORA_DA_TABELA.map(({ id, frente }) =>
          frente ? `${nomeCurto(id)} (${frente})` : nomeCurto(id),
        ),
      )}.`

const PLANEJADAS_ATE_O_SR1 = PLANEJADO_X_REALIZADO.reduce((s, l) => s + l.planejadas, 0)
const ENTREGUES_ATE_O_SR1 = PLANEJADO_X_REALIZADO.reduce((s, l) => s + l.entregues, 0)
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

/**
 * "Coordenação da SEAB" vira "coordenação da SEAB": a frase começa em
 * minúscula, como a identidade pede, e o nome próprio e a sigla ficam.
 */
function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1)
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
    conta: `${ENTREGUES_NO_SEMESTRE} de ${PLANEJADAS_NO_SEMESTRE}; o plano pedia ${porcento(PLANEJADAS_ATE_O_SR1, PLANEJADAS_NO_SEMESTRE)} na metade do calendário`,
  },
  {
    id: 'historias',
    numero: porcento(HISTORIAS_NO_AR, BACKLOG.length),
    rotulo: 'das histórias do backlog no ar',
    conta: `${HISTORIAS_NO_AR} de ${BACKLOG.length} histórias`,
  },
] as const

/** Número por extenso, como se diz no palco: "cinco fontes", "oito alternativas". */
/** "24 de outubro": a data do ciclo, dita sem o ano, lida do cronograma. */
function dataFalada(id: CicloId): string {
  return formatarExtenso(cicloPorId(id).data).replace(/ de \d{4}$/, '')
}

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
  { quando: 'semana 1', fonte: 'o case da CESAR com a SESAU' },
  { quando: '22/08', fonte: 'reunião com a Secretaria' },
  { quando: '05/09', fonte: 'a Portaria 001/2024' },
  { quando: '22/09', fonte: 'a planilha que a Secretaria usa' },
  { quando: '23/09', fonte: 'a base de desempenho por unidade' },
] as const

export const APRENDIZADOS_SR1 = {
  itens: [
    { antes: 'indicador preenchido direto', depois: 'cada item medido' },
    { antes: 'média dos valores', depois: 'média das notas' },
    { antes: 'faltou número, zera', depois: 'sai da conta com o peso' },
    { antes: 'nota de 0 a 10', depois: 'nota de 0 a 1 por item' },
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
  'a regra como dado': 'em parte',
  'a conta sempre aberta': 'em parte',
  'nada muda sem registro': 'no prazo',
  'cada um vê o que é seu': 'alcançado',
  'conferido com o cliente': 'no prazo',
}

/** Slide 8: o próximo passo de cada objetivo, ou o que já está no ar. Vazio quando o estado basta. */
export const PROXIMO_DO_OBJETIVO: Partial<Record<(typeof OBJETIVOS_ESPECIFICOS)[number]['resumo'], string>> = {
  'a regra como dado': 'falta: cadastrar pela tela',
  'a conta sempre aberta': 'falta: a conta no ranking',
  'nada muda sem registro': 'trilha já no ar',
  'conferido com o cliente': 'falta: pedir a data',
}

export const OBJETIVOS_NO_SR1 = OBJETIVOS_ESPECIFICOS.map((o) => ({
  resumo: o.resumo,
  quando: o.quando.toLowerCase(),
  estado: ESTADO_DOS_OBJETIVOS[o.resumo],
  proximo: PROXIMO_DO_OBJETIVO[o.resumo],
}))

/** Slide 18: cada compromisso do Kick-off com o estado de hoje. */
export type EstadoDoCompromisso = 'feito' | 'em parte' | 'não feito'

/** "24/10": a data do ciclo na tela, lida do cronograma. */
function dataCurta(id: CicloId): string {
  return formatarBR(cicloPorId(id).data).slice(0, 5)
}

/**
 * `agora` é o cronograma atualizado de cada compromisso, na tela: o que ficou
 * e para quando foi. A data nova sai do cronograma, nunca daqui.
 */
export const ESTADO_DOS_COMPROMISSOS: Record<
  (typeof COMPROMISSOS_ATE_O_SR1)[number]['ciclo'],
  { estado: EstadoDoCompromisso; porque: string; agora: string }
> = {
  s5: {
    estado: 'em parte',
    porque: 'o jeito de calcular entrou; os indicadores ainda são de teste',
    agora: `os 5 indicadores da portaria em ${dataCurta('s8')}`,
  },
  s6: {
    estado: 'feito',
    porque: `as ${TELAS_NO_SR1.length} telas estão no ar`,
    agora: `as ${TELAS_NO_SR1.length} telas no ar`,
  },
  sr1: {
    estado: 'não feito',
    porque: 'as perguntas 4 e 6 a 13 para a Secretaria seguem em aberto',
    agora: `passou para ${dataCurta('s11')}; perguntas em aberto`,
  },
}

export const COMPROMISSOS_NO_SR1 = COMPROMISSOS_ATE_O_SR1.map((c) => ({
  ...c,
  // O texto é o do Kick-off, que fica como foi apresentado; aqui o nome do
  // órgão vai com maiúscula, como no resto do deck do SR1.
  compromisso: c.compromisso.replace(/\bsecretaria\b/, 'Secretaria'),
  ...ESTADO_DOS_COMPROMISSOS[c.ciclo],
  dono: nomeCurto(c.quem),
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
 * 11:59 de fala, para uma banca que interrompe em 15:00.
 *
 * A margem é de propósito: troca de quem fala, a demonstração ao vivo e o
 * nervoso do dia comem tempo que a conta de palavras não vê. Ensaio que fecha
 * no limite estoura no dia.
 */
export const DURACAO_SR1_SEGUNDOS = 719

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
    apoio: 'o cálculo da gratificação da saúde do Recife, aberto para qualquer um conferir',
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
    apoio: 'a ordem da rubrica do SR1. o rodapé de cada slide diz em que parte ele está.',
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
      'A causa: a regra está escrita, mas a conta é feita à mão, numa planilha em que pouca gente sabe mexer.',
      `A consequência: na planilha real, ${porExtenso(B.fora_da_regra)} unidades seguem uma conta que a portaria não traz. E quem recebe o dinheiro não consegue conferir a própria nota.`,
    ],
    perguntas: [
      'Por que este problema: é um cliente real, com a dor escrita desde 2023, e uma tentativa anterior de automatizar a conta parou.',
      'Os números da rede vêm da base de desempenho que a Secretaria enviou em 23 de setembro, sem nome, CPF ou matrícula. Em 39 das 90 combinações de tipo e distrito há uma unidade só; isso está na análise de privacidade.',
      `As ${porExtenso(B.fora_da_regra)} são ${B.familias_fora_da_regra.join(' e ')}, ${porExtenso(B.familias_fora_da_regra.length)} tipos que a portaria não nomeia. Não sabemos se é regra provisória ou erro: é pergunta para a SEAB, e está na matriz CSD. Na aba de pesos há outro caso: uma coluna de peso diferente da portaria, e não sabemos quem decidiu nem até quando vale.`,
    ],
  },
  {
    id: 'pesquisa',
    numero: 4,
    parte: 'imersao',
    titulo: 'o que pesquisamos e o que aprendemos',
    apoio: `${porExtenso(FONTES_SR1.length)} fontes, cada uma com data. a reunião e a planilha corrigiram ${porExtenso(APRENDIZADOS_SR1.itens.length)} pontos do nosso modelo.`,
    visual: 'As cinco fontes em ordem de chegada, com a planilha em destaque, e os três aprendizados.',
    segundos: 40,
    quemFala: 'matheus',
    notas: [
      `Pesquisamos em ${porExtenso(FONTES_SR1.length)} fontes, cada uma com data: o caso da escola, a reunião com a Secretaria em 22 de agosto, a portaria, a planilha que a Secretaria usa e a base de desempenho.`,
      'A reunião mostrou que a unidade preenche cada item medido, e não o indicador. A planilha foi a que mais ensinou: a gente fazia a média dos valores; ela dá nota a cada item e faz a média das notas.',
      'Quando faltava um número, a gente zerava. Ela tira da conta, e o peso sai junto, como manda o artigo 8º.',
    ],
    perguntas: [
      'A pesquisa ainda não tem entrevista com quem opera o processo: as personas vieram do caso e da reunião. A entrevista está prevista para a Semana 11, com roteiro pronto em docs/validacao.md; a data ainda vai ser pedida à Secretaria.',
      `A Secretaria autorizou o uso da base por unidade na lente de aprendizado de máquina (ADR-044), ainda sem documento escrito: a autorização por escrito é a pergunta 13. São ${B.linhas} linhas; ${B.modeladas} unidades seguem a conta da portaria.`,
      `Sobre a conta de hoje, a Secretaria respondeu por escrito em 22 de setembro: ${CITACAO_DA_SECRETARIA.frase}.`,
    ],
  },
  {
    id: 'csd',
    numero: 5,
    parte: 'imersao',
    titulo: 'o que sabemos, supomos e falta saber',
    apoio: 'a matriz CSD, atualizada em 25/09 com a planilha e a base da Secretaria.',
    visual: 'As três colunas da matriz, com a contagem e dois exemplos de cada, e o que a pesquisa respondeu.',
    segundos: 25,
    quemFala: 'matheus',
    notas: [
      `A matriz de certezas, suposições e dúvidas foi atualizada em 25 de setembro: ${CSD_EM_25_09.certezas.length} certezas, cada uma com a fonte, ${CSD_EM_25_09.suposicoes.length} suposições declaradas e ${CSD_EM_25_09.duvidas.length} dúvidas, cada uma com a pergunta para a Secretaria.`,
      'A maior dúvida é quanto se paga em cada classe da nota.',
      'Desde o Kick-off, a dúvida do indicador sem número virou certeza, e a planilha corrigiu o nosso modelo.',
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
    apoio: 'personas do caso e o mapa da analista que fecha a conta.',
    visual: 'As três personas, três quadrantes do mapa de empatia e os quatro papéis que elas viraram.',
    segundos: 35,
    quemFala: 'matheus',
    notas: [
      `Criamos ${porExtenso(PESSOAS.length)} personas a partir do caso: a analista que fecha a conta, a gerente que manda os números e a coordenadora avaliada, que recebe o extra.`,
      'O mapa de empatia é da analista. A frase dela resume o medo: se mexer numa fórmula, tem que conferir a planilha inteira de novo.',
      `Na reunião de 22 de agosto, o cliente deu nome aos ${porExtenso(Object.keys(PERFIS).length)} papéis do sistema; a gerente e a avaliada viraram o gerente de unidade.`,
    ],
    perguntas: [
      'As personas são personagens, não gente real: vieram dos papéis descritos no caso, sem entrevista. A entrevista com quem opera o processo está no plano da Semana 11.',
      'A segunda persona nasceu como gestor de área técnica. Depois da reunião de 22 de agosto, virou a gerente da unidade, porque é a unidade que manda os números.',
      'O rascunho das personas foi feito com IA a partir do caso e conferido pela equipe, sem entrevista. Está no registro de uso de IA.',
    ],
  },
  {
    id: 'existentes',
    numero: 7,
    parte: 'imersao',
    titulo: 'o que já existe: benchmarking e SWOT',
    apoio: 'nenhuma solução junta regra com versão, conta aberta e registro de quem mudou.',
    visual: 'As cinco soluções estudadas com o que falta a cada uma, e os quatro quadrantes da SWOT.',
    segundos: 35,
    quemFala: 'kerry',
    notas: [
      `Antes de construir, olhamos ${porExtenso(BENCHMARKING.length)} soluções: painéis públicos de indicadores, sistemas de metas do SUS, duas ferramentas de metas de empresa e a própria planilha de hoje.`,
      'Cada uma resolve um pedaço. Nenhuma junta regra com versão, conta aberta e registro de quem mudou.',
      'Na SWOT, a força é o cliente real, com a regra escrita. A fraqueza: ninguém da equipe conhecia o processo por dentro, e a portaria só chegou em 5 de setembro.',
    ],
    perguntas: [
      'O benchmarking compara tipos de solução, não produtos com nome. Ele e a SWOT estão na Semana 2 do site, e a SWOT foi revista em setembro, quando a portaria chegou e o Kerry entrou.',
    ],
  },
  {
    id: 'objetivos',
    numero: 8,
    parte: 'imersao',
    titulo: 'os objetivos e o que já alcançamos',
    apoio: `objetivo geral: ${OBJETIVO_GERAL_CURTO}`,
    visual: 'Os cinco objetivos específicos com o prazo, o estado de hoje e o que falta, e o fora do escopo em uma linha.',
    segundos: 35,
    quemFala: 'kerry',
    notas: [
      'O objetivo geral: tirar a conta da planilha e deixar cada nota aberta para conferir.',
      `Dos cinco específicos, um foi alcançado e dois estão em parte: a regra já tem versão, mas ainda muda por código, e o ranking mostra a nota sem a conta. Os outros dois vencem em ${dataFalada('s9')} e ${dataFalada('s11')}.`,
      'Próximos passos: cadastrar a regra pela tela, levar a conta ao ranking e pedir a data da Semana 11.',
      'O escopo foi revisto na Semana 6, com a portaria e a planilha.',
    ],
    perguntas: [
      'O escopo da Semana 4 foi revisto depois da portaria, de 5 de setembro, e da planilha, de 22 de setembro. A revisão está na Semana 6 do site.',
      'A regra com versão funciona: maio não mudou quando a regra mudou. Mas a versão 3 pediu código novo no motor, e cadastrar a regra pela tela está no backlog.',
      'A conta aberta está em parte porque o ranking do painel da gestão mostra a nota sem a conta. Levar a conta a toda tela que mostra nota está no backlog.',
      'Cada um vê o que é seu na permissão: cada tela confere o papel no servidor e responde 404. O login é simulado, e o da prefeitura está fora do escopo.',
      'Por isso, no documento de privacy by design, o requisito de acesso por área está em parte: sem login real, o próprio distrito é escolhido no seletor.',
      'As metas de entrega da Semana 2 também têm estado: o motor com testes dos casos-limite saiu até a Semana 6, e o protótipo navegável está no ar. O ciclo inteiro com histórico, a entrevista da Semana 11 e o SR2 estão no prazo.',
    ],
  },

  /* ------------------------------------------------------------ 2 · ideação */
  {
    id: 'tecnicas',
    numero: 9,
    parte: 'ideacao',
    titulo: 'como geramos as ideias',
    apoio: `${porExtenso(TECNICAS_DE_IDEACAO.length)} técnicas na semana 3, com uma regra: somar antes de criticar.`,
    visual: 'As três técnicas, com o tempo, como cada uma funciona e o que produziu, e o funil até a escolhida.',
    segundos: 30,
    quemFala: 'joao-pedro',
    notas: [
      `Na Semana 3 seguimos um roteiro de ${porExtenso(TECNICAS_DE_IDEACAO.length)} técnicas. No brainwriting, cada um escreve em silêncio e passa a folha adiante, para ninguém ser puxado por quem fala primeiro.`,
      `No brainstorming, as ideias parecidas viraram ${porExtenso(ALTERNATIVAS.length)} alternativas. No crazy 8s, cada um rascunha oito telas em oito minutos.`,
      'Publicamos o roteiro e as alternativas. As folhas, ainda não.',
    ],
    perguntas: [
      'O site tem o roteiro das três técnicas e o resultado, as oito alternativas. As folhas e os desenhos da sessão ainda não foram publicados: é um item em aberto no nosso checklist.',
      "SCAMPER não foi usado: a matriz da disciplina pedia, na Semana 3, brainwriting, brainstorming e crazy 8's, e seguimos essas três.",
    ],
  },
  {
    id: 'escolha',
    numero: 10,
    parte: 'ideacao',
    titulo: 'os critérios e a ideia escolhida',
    apoio: 'nota de 1 a 5 em impacto, esforço (5 = mais trabalho) e aderência ao órgão público.',
    visual: 'As oito alternativas com as três notas e o destino de cada uma, a escolhida em destaque.',
    segundos: 30,
    quemFala: 'rafael',
    notas: [
      'Cada alternativa levou nota de 1 a 5 em três critérios, fixados antes das ideias.',
      'Venceu o sistema web com a conta aberta: maior impacto, e maior aderência, porque a regra tem versão e mês fechado não muda. Ele ataca a causa: hoje a conta só existe em fórmula de planilha.',
      'A planilha travada ficou como linha de base. A ideia do modelo virou a tela de analytics, que aponta onde olhar sem mudar nota.',
    ],
    perguntas: [
      'Não somamos as notas. O esforço 4 foi aceito porque cabe em fatias: lançamento, conta e conta aberta até o SR1, e o resto nas sprints.',
      'A lista de risco da tela de analytics é uma média simples, sem modelo. Os modelos rodam sobre a base da Secretaria e mostram o que pesa na nota.',
      'Aderência é sobreviver no órgão: pregão, portaria nova e troca de equipe. Na Semana 3, a razão escrita foi mudar a regra pela tela, e isso ainda está no backlog. O que já funciona é a versão: a regra 3 entrou e maio não mudou.',
    ],
  },
  {
    id: 'disciplinas',
    numero: 11,
    parte: 'ideacao',
    titulo: 'o que cada disciplina pôs no produto',
    apoio: 'como cada lente moldou a ideia escolhida: as três da matriz e direito.',
    visual: 'Quatro cartões, um por disciplina, com as decisões concretas de cada uma; o de direito traz a base legal e a Atividade 2.',
    segundos: 44,
    quemFala: 'rafael',
    notas: [
      'A ideia escolhida ganhou peças de cada disciplina.',
      `Segurança: o que não é seu responde como se não existisse, e listamos ${CONTAGENS_PITCH.ameacasStride} ameaças.`,
      'Nuvem: o sistema roda na Vercel, sem servidor para manter.',
      'Aprendizado de máquina: três modelos sobre a base real da Secretaria mostram o que pesa na nota, sem fazer a conta.',
      'E Direito: pelo artigo 20 da LGPD, a nota que decide o salário de alguém precisa ser explicada. Por isso a conta fica aberta. A base legal é a política pública, não o consentimento.',
      `Na Atividade 2 de Direito, mapeamos ${porExtenso(DADOS_PESSOAIS.length)} dados pessoais e ${porExtenso(REQUISITOS_DE_PRIVACIDADE.length)} riscos de privacidade, cada um com requisito e teste. O que falta virou backlog.`,
    ],
    perguntas: [
      `O classificador acerta ${porcentoInteiro(ACERTO)}, contra ${porcentoInteiro(ACERTO_DO_CHUTE)} do chute mais simples, porque aprende a própria conta da portaria. Por isso o modelo diz o que pesa, e não calcula nada.`,
      `O agrupamento separa ${GRUPOS} grupos de unidades, nunca de pessoas, com silhueta de ${decimal(SILHUETA, 2)}. A apresentação completa está em /ml.`,
      `Dos ${CONTAGENS_PITCH.itensOwasp} riscos da lista OWASP Top 10, ${CONTAGENS_PITCH.owaspParciais} ainda estão cobertos só pela metade. O login do sistema é simulado.`,
      'O banco já está projetado, com as regras de acesso testadas num Postgres de verdade, mas ainda com os papéis de antes da reunião de 22 de agosto, e está desligado: o sistema roda em memória para qualquer pessoa clonar e rodar sem senha.',
      'O desenho do sistema em quatro níveis (C4) está na página de arquitetura do site.',
      'A base legal é o artigo 7º, inciso III, lido com o artigo 23: o Poder Público executando uma política pública. Não é consentimento, que seria frágil numa relação de trabalho.',
      `Dos ${REQUISITOS_DE_PRIVACIDADE.length} requisitos de privacidade, ${contarRequisitos('no MVP')} já valem no sistema, ${contarRequisitos('em parte')} valem em parte, ${contarRequisitos('no backlog')} estão no backlog e ${contarRequisitos('na implantação')} dependem de infraestrutura real. A tabela está no documento de privacy by design do SR1, no site.`,
      'Um exemplo de dado sensível por inferência: a licença médica que justifica uma meta perdida revela saúde. No sistema, o único lugar em que isso pode entrar é o texto da contestação, e o formulário avisa para não escrever.',
      'O PDF da Atividade 2 cita a Portaria 05 de 2023, que foi revogada pela 001 de 2024. O site já cita a vigente.',
      'O artigo 20 vale mesmo com a CAM decidindo? A nota sai de uma conta automática, e quem recebe precisa conseguir conferir. Na Atividade 2, a conta aberta atende aos direitos do titular do artigo 18, e o artigo 20 aparece no modelo: nenhuma saída de modelo entra na nota, e a decisão continua humana e contestável.',
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
      'Todo mês, a unidade lança os números, o distrito confere, e a coordenação da SEAB, que conduz a avaliação na Secretaria, fecha o mês. Então cada gerente vê a própria nota, com a conta inteira embaixo.',
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
    apoio: 'quatro desenhos de três telas centrais, propositalmente sem texto. os nomes são os do menu.',
    visual: 'Os quatro wireframes, um por tela, com a legenda de cada.',
    segundos: 20,
    // Quem fala o 13 segue no 14: o João Henrique ganha os 20 segundos para
    // abrir o sistema, e os wireframes são entrega do João Pedro no checklist.
    quemFala: 'joao-pedro',
    notas: [
      'Estes são os protótipos de baixa fidelidade de três telas centrais: o lançamento, o painel da SEAB e o meu resultado, que tem dois desenhos.',
      'Cada desenho fixa uma decisão: a conta fica embaixo da nota, e o painel mostra quem falta.',
      'Vocês veem as telas funcionando agora.',
    ],
    perguntas: [
      'Os desenhos foram gerados com IA na semana do Kick-off, a partir das telas que já existiam, e conferidos pelo Gabriel. O site diz essa data, e os rascunhos em papel do crazy 8s não foram publicados.',
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
      'Primeiro, a unidade. Escolhemos a USF Canário e lançamos um número de julho, dizendo de onde ele veio.',
      'Depois, a coordenação. O painel mostra quem já mandou e quem falta, e o mês avança uma etapa por vez, até fechar.',
      'Por fim, o resultado, com a conta inteira embaixo. Cada linha mostra o número, o alvo, a nota e quanto pesa.',
      'Um item ficou sem número e saiu da conta com o peso junto, como faz a planilha da Secretaria. A última linha fecha a conta: qualquer pessoa refaz no papel.',
    ],
    perguntas: [
      `Na reserva, depois de "vou mostrar o mês que já fechamos": esta tela mostra junho, já fechado, ${notaFalada(JUNHO_V3)}, com a mesma conta aberta.`,
      'Não há banco ligado: o que um visitante lança fica num diário assinado no próprio navegador, e cada tela refaz a conta a partir dele. Fechou o navegador, some. O banco está projetado e desligado.',
      'Quem mexe na tela não é quem fala: assim a demonstração não depende de uma pessoa só.',
      'O que um visitante lança fica na sessão dele. A demonstração de um não muda a tela de outro.',
      'O percentual de cada classe está no Decreto 36.482/2023, que ainda buscamos. No sistema ele é suposição nossa; o nome da classe vem da planilha. Vale também para o percentual que aparece em julho, ao vivo.',
      'Se a demonstração cair na reserva de junho, a frase do item sem número não vale: em junho os cinco itens têm número.',
    ],
  },
  {
    id: 'diferenciais',
    numero: 15,
    parte: 'solucao',
    titulo: 'por que esta solução: três diferenciais',
    apoio: 'o que nenhuma das soluções estudadas junta.',
    visual: 'Os três diferenciais, cada um com o problema de hoje que resolve, e maio que não muda.',
    segundos: 30,
    quemFala: 'joao-henrique',
    notas: [
      'Três diferenciais: nenhuma solução que estudamos junta os três. Cada um ataca um problema de hoje.',
      'A conta aberta: qualquer pessoa refaz a nota no papel.',
      `A regra com versão: a regra nova vale a partir de junho, e maio continuou com ${notaFalada(MAIO_V2)}. Pela regra nova daria ${notaFalada(MAIO_V3)}, mas mês fechado não muda.`,
      'E o registro de quem mudou: corrigir não apaga, e o valor antigo fica na trilha de auditoria, com quem fez e quando.',
    ],
    perguntas: [
      'O registro já está no ar: lançamento, correção e avanço de etapa vão para a trilha de auditoria, com o antes e o depois. Refazer qualquer contestação passo a passo é o objetivo do slide 8, e fecha na Semana 9.',
      'A trilha só recebe linha nova: não há caminho para apagar. No protótipo, isso depende de toda escrita passar pela mesma camada; no banco projetado, um gatilho garante o mesmo.',
      'Cada papel só vê o que é seu: é o objetivo alcançado do slide 8, e quem manda o número não escolhe a meta. O login ainda é simulado, e um teste percorre as oito telas contra os quatro papéis.',
      'A resposta é “não encontrado” e nunca “proibido” de propósito: da porta, não dá para saber se a tela existe.',
      `Escrevemos a regra 3 em setembro, com a planilha do cliente, valendo a partir de junho. Quando ela entrou, junho ainda estava aberto na base de teste; os meses até maio, já fechados, não mudaram. Junho dá ${notaFalada(JUNHO_V3)}. O motor tem ${TESTES_DO_MOTOR} testes só dele, e cada envio de código roda todos de novo.`,
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
      'Hoje é o SR1. Depois vêm quatro sprints de uma semana, cada uma puxada pela ordem do backlog, a validação com a Secretaria e o SR2.',
      'Toda semana tem registro no site, com o que avançou, o que travou e quem fez. Toda decisão fica escrita com o porquê.',
      `O backlog tem ${BACKLOG.length} histórias, priorizadas por MoSCoW. Das ${historias('M')} obrigatórias, ${historias('M', 'no_ar')} estão no ar, como lançar cada item e abrir a conta. O plano era ter todas hoje; as que faltam são as de configurar pela tela.`,
    ],
    perguntas: [
      'As sprints da Semana 7 à 10 começam pelo retorno desta banca. A ordem do backlog muda com ele.',
      `Por que há desejáveis no ar antes de todas as obrigatórias: algumas vieram junto de uma obrigatória, como publicar o mês, que é a última etapa do mesmo botão que avança a etapa. As ${historias('M') - historias('M', 'no_ar')} obrigatórias que faltam são todas de configuração pela tela da SEAB, e entram nas sprints, na ordem que o retorno desta banca pedir.`,
    ],
  },
  {
    id: 'equipe',
    numero: 17,
    parte: 'processo',
    titulo: 'papéis e responsabilidades',
    apoio: 'seis frentes com dono; o Kerry apoia a pesquisa.',
    visual: 'Os sete integrantes, com o papel e as responsabilidades de cada um.',
    segundos: 30,
    quemFala: 'fernando',
    notas: [
      'Gabriel cuida do produto e das prioridades, Matheus da pesquisa, com o apoio do Kerry, João Henrique da arquitetura e da conta, João Pedro das telas, Rafael dos dados, e eu da qualidade e da documentação.',
      'Kerry entrou no Kick-off e apoia o Matheus na pesquisa e na validação.',
    ],
  },
  {
    id: 'ferramentas',
    numero: 18,
    parte: 'processo',
    titulo: 'ferramentas, o site e o Drive',
    apoio: 'onde o trabalho acontece e onde cada entrega fica.',
    visual: 'As ferramentas com o uso de cada uma, as oito seções do site no lugar do Google Site e o que a pasta do Drive guarda.',
    segundos: 30,
    quemFala: 'fernando',
    notas: [
      'O código e os testes ficam no GitHub, e cada envio roda os testes sozinho. O site roda na Vercel.',
      'O site faz o papel do Google Site: as oito seções do briefing e o diário de bordo de cada semana, com cada documento aberto ali mesmo.',
      'A pasta do Drive recebe o PDF de cada apresentação.',
    ],
    perguntas: [
      'Trocamos o Google Site pelo site do projeto na Semana 1, com as mesmas oito seções, e cada versão fica guardada no Git, com a data. Se a banca preferir, espelhamos no Drive.',
      'O uso de IA está em /transparencia-ia, com quem conferiu cada uso. Até aqui o Gabriel conferiu todos; dividir isso entra nas sprints.',
    ],
  },

  /* ---------------------------------------------- 5 · planejado x realizado */
  {
    id: 'planejado',
    numero: 19,
    parte: 'planejado',
    titulo: 'planejado x realizado: as entregas',
    apoio: APOIO_DO_PLANEJADO,
    visual: 'A tabela das fases até o SR1, com entregas, responsáveis e o que está em andamento.',
    segundos: 35,
    quemFala: 'gabriel',
    notas: [
      `Até hoje o cronograma pedia ${PLANEJADAS_ATE_O_SR1} entregas, e entregamos ${ENTREGUES_ATE_O_SR1}. As que faltam estão na linha de baixo: ${EM_ANDAMENTO_FALADO}. O escopo espera respostas da Secretaria; o plano, já no site, fecha com o retorno desta banca.`,
      'Rafael e Kerry não aparecem porque a tabela só conta o cronograma de Projeto: o Rafael responde pela lente de aprendizado de máquina, e o Kerry apoia a pesquisa.',
    ],
    perguntas: [
      'O Rafael responde pela lente de aprendizado de máquina, que tem calendário e avaliação próprios: a AV1 foi em 30 de setembro, e os slides estão em /ml.',
      'O Kerry entrou no Kick-off, em 12 de setembro, sem frente própria: ele apoia a pesquisa do Matheus.',
      'Por que um nome se repete em quase toda linha: as entregas ficaram registradas no nome de poucos, e esse é o ponto de melhoria do slide 21.',
    ],
  },
  {
    id: 'avanco',
    numero: 20,
    parte: 'planejado',
    titulo: 'o avanço e o estágio de hoje',
    apoio: 'estágio: protótipo navegável, com dados de teste.',
    visual: 'Três percentuais de avanço com a conta de cada um, e os três compromissos do Kick-off com o estado.',
    segundos: 25,
    quemFala: 'gabriel',
    notas: [
      `Na metade do semestre, temos ${AVANCO[1].numero} das entregas, contra ${porcento(PLANEJADAS_ATE_O_SR1, PLANEJADAS_NO_SEMESTRE)} no plano, e ${AVANCO[2].numero} das histórias no ar.`,
      `No cronograma atualizado, dos três compromissos do Kick-off, um foi feito e um saiu em parte: os indicadores oficiais entram em ${dataFalada('s8')}. O terceiro não saiu: a conferência com a Secretaria depende de perguntas ainda em aberto, e passou para ${dataFalada('s11')}.`,
    ],
    perguntas: [
      'Por que a conferência não saiu: as perguntas 4 e 6 a 13 para a Secretaria seguem em aberto, e sem elas a regra não tem como ser conferida. O motivo e o ajuste de cada desvio estão no documento de correção de rota, no registro do SR1.',
      `${dataFalada('s11')} é a Semana 11 do nosso cronograma, e a Secretaria ainda não confirmou a data. Pedir a data é o tratamento do risco de agenda, no slide 21.`,
      'No Kick-off também dissemos que o prazo de contestação entraria na regra 3. Não entrou: ficou para a Sprint 3, e a tela diz que ele ainda não existe.',
    ],
  },

  /* ------------------------------------------ 6 · pontos fortes e melhorias */
  {
    id: 'balanco',
    numero: 21,
    parte: 'balanco',
    titulo: 'pontos fortes, melhorias e riscos',
    apoio: 'do projeto e da equipe. a seta diz como tratamos.',
    visual: 'Três colunas: pontos fortes, pontos de melhoria com o tratamento, e os três riscos maiores com o tratamento.',
    segundos: 40,
    quemFala: 'rafael',
    notas: [
      'Pontos fortes: um cliente real com regra escrita, o sistema no ar com as oito telas, e uma equipe com seis frentes separadas.',
      'Pontos de melhoria: a pesquisa ainda não tem entrevista, e vamos entrevistar na Semana 11. E o registro das entregas ficou no nome de poucas pessoas: nas sprints, cada um registra a própria entrega.',
      'O maior risco é o percentual pago em cada classe, que ainda é dúvida: está num decreto que não temos. O Matheus busca o decreto, o João Henrique troca os indicadores pelos cinco da portaria, e o Gabriel pede já a data da Semana 11.',
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
    apoio: 'do problema ao plano.',
    visual: 'A linha do problema à solução e ao plano, as paradas até o SR2 com a data de cada uma, o endereço do site e a pergunta para a banca.',
    segundos: 30,
    quemFala: 'kerry',
    notas: [
      'Para fechar: a regra está na portaria, mas a conta só existe em fórmula de planilha. A solução deixa a regra com versão e a conta aberta.',
      `Próximos passos: em ${dataFalada('s7')}, aplicar o retorno desta banca; em ${dataFalada('s8')}, os cinco indicadores da portaria; e, na Semana 11, conferir a conta com a Secretaria.`,
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
export const PILULA_DA_CAPA_SR1 = 'SR1 · status report 1'

/** Slide 2: cada parte da rubrica com os slides dela. */
export const ROTEIRO_SR1 = PARTES_SR1.map((p) => ({
  ...p,
  slides: intervaloDaParte(p.id),
}))

/** Slide 3: onde, por quê e o que acontece. */
export const PROBLEMA_SR1 = {
  onde: {
    rotulo: 'onde ocorre',
    texto: `na Secretaria de Saúde do Recife, todo mês: ${B.unidades} unidades em ${DISTRITOS_NA_BASE} distritos`,
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
      `${B.fora_da_regra} unidades numa conta que a portaria não traz`,
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
  exemplos: coluna.itens.slice(0, 2).map((l) => minusculaInicial(l.item)),
}))

/**
 * O que a pesquisa respondeu da matriz do Kick-off. A mesma conta da nota do
 * documento de síntese da pesquisa, no SR1: a dúvida do peso do art. 8º virou
 * certeza, e a suposição de que a planilha confirmaria o modelo caiu.
 */
export const CSD_RESPONDIDO = {
  rotulo: 'desde o kick-off',
  texto: 'a dúvida do indicador sem número virou certeza; a planilha corrigiu o modelo',
} as const

export const COLUNAS_DAS_FONTES = { fontes: 'as fontes', aprendizados: 'o que aprendemos' } as const

/** Slide 5: as personas são as do Kick-off; o mapa, o da Semana 2. */
/**
 * A terceira persona é "a coordenadora" no Kick-off. No SR1 ela divide a tela
 * com a coordenação da SEAB, que fecha o mês e não recebe nada: aqui ela é a
 * coordenadora avaliada, como no documento da Semana 2.
 */
const NOME_SR1_DA_PERSONA: Record<string, string> = { 'a coordenadora': 'a coordenadora avaliada' }
export const PESSOAS_SR1 = PESSOAS.map((p) => ({ ...p, quem: NOME_SR1_DA_PERSONA[p.quem] ?? p.quem }))

export const ROTULO_DAS_PERSONAS = 'personas'
export const MAPA_NO_SR1 = MAPA_DE_EMPATIA.filter((q) =>
  ['Diz', 'Dores', 'Ganhos'].includes(q.termo),
)
export const ROTULO_DO_MAPA_SR1 = 'mapa de empatia: 3 de 6 quadrantes'
export const ROTULO_DOS_PAPEIS = `no sistema, ${Object.keys(PERFIS).length} papéis`

/** Os papéis na ordem do processo: de quem coordena a quem manda o número. */
export const ORDEM_DOS_PAPEIS: readonly PerfilId[] = [
  'seab',
  'administrador',
  'gerente_distrital',
  'gerente_unidade',
]

export const NOME_DO_PAPEL: Record<PerfilId, string> = Object.fromEntries(
  Object.entries(PERFIS).map(([id, perfil]) => [id, minusculaInicial(perfil.rotulo)]),
) as Record<PerfilId, string>

/** Slide 6: o benchmarking pela lacuna, e a SWOT pelo resumo. */
export const REFERENCIAS_SR1 = BENCHMARKING.map((r) => ({ nome: r.curto, lacuna: r.lacuna }))
/**
 * O resumo do quadrante de oportunidades é do Kick-off ("já tentaram, e
 * parou"), e lido sozinho no PDF parece fraqueza. No SR1 ele diz a
 * oportunidade; o Kick-off, que está fechado, continua com o dele.
 */
const RESUMO_SR1_DO_QUADRANTE: Record<string, string> = {
  Oportunidades: 'a demanda existe: já tentaram antes',
  // A fraqueza é da equipe, como a fala diz. "A portaria chegou tarde" é de
  // fora, e lida no PDF parecia ameaça.
  Fraquezas: 'ninguém conhecia o processo',
}
export const QUADRANTES_SR1 = SWOT.map((q) => ({
  titulo: q.titulo.toLowerCase(),
  curto: RESUMO_SR1_DO_QUADRANTE[q.titulo] ?? q.curto,
}))
export const COLUNAS_DOS_EXISTENTES = {
  benchmarking: `benchmarking de ${BENCHMARKING.length} tipos: o que falta a cada um`,
  swot: 'SWOT',
} as const

export const ESCOPO_SR1 = {
  fora: 'fora do escopo: folha de pagamento, login da prefeitura e dado pessoal real',
} as const

/** Slide 8: as técnicas, como a Semana 3 registrou. */
/**
 * O que cada técnica deixou, dito como está registrado. O resumo do Kick-off
 * ("18 ideias no papel") é a previsão do roteiro, e a sessão não tem as folhas
 * publicadas; no SR1 a tela diz só o que dá para abrir.
 */
const PRODUTO_SR1_DA_TECNICA: Record<string, string> = {
  Brainwriting: 'ideias escritas antes da conversa',
  Brainstorming: `${porExtenso(ALTERNATIVAS.length)} alternativas`,
  "Crazy 8's": 'rascunhos, ainda não publicados',
}

/** Como cada técnica funciona, numa linha: a rubrica pede como as ideias foram geradas. */
const COMO_SR1_DA_TECNICA: Record<string, string> = {
  Brainwriting: 'cada um escreve em silêncio e passa a folha',
  Brainstorming: 'a conversa junta as ideias parecidas em grupos',
  "Crazy 8's": 'oito telas em oito minutos, cada um sozinho',
}

export const TECNICAS_SR1 = TECNICAS_DE_IDEACAO.map((t) => ({
  nome: t.nome.toLowerCase(),
  minutos: t.minutos,
  como: COMO_SR1_DA_TECNICA[t.nome] ?? t.como,
  produto: PRODUTO_SR1_DA_TECNICA[t.nome] ?? t.produtoCurto,
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
export const LEGENDA_DA_MATRIZ = {
  rotulo: 'por quê',
  texto: 'impacto: ataca a causa · esforço: alto, mas cabe em fatias · aderência: portaria nova não muda mês fechado',
} as const

/** Slide 10: o que cada disciplina decidiu no produto. */
export const DISCIPLINAS_SR1 = [
  {
    nome: 'segurança da informação',
    itens: [
      'o que não é seu responde “não encontrado” (404)',
      `${CONTAGENS_PITCH.ameacasStride} ameaças listadas (STRIDE)`,
    ],
  },
  {
    nome: 'arquitetura nativa na nuvem',
    itens: ['roda na Vercel, sem servidor para manter', 'desenho em quatro níveis (C4)'],
  },
  {
    nome: 'aprendizado de máquina',
    itens: ['três modelos sobre a base da Secretaria', 'sinalizam, nunca mudam nota'],
  },
  {
    nome: 'direito',
    itens: [
      'nota que decide salário precisa ser explicada (LGPD, art. 20)',
      'base legal: política pública, não consentimento (art. 7º, III)',
      `Atividade 2: ${DADOS_PESSOAIS.length} dados pessoais, ${REQUISITOS_DE_PRIVACIDADE.length} riscos com requisito e teste`,
    ],
  },
] as const

/** Slide 11: o caminho de um mês, e quem faz cada passo. */
export const FLUXO_DO_MES = [
  { quem: NOME_DO_PAPEL.gerente_unidade, faz: 'lança os números do mês' },
  { quem: NOME_DO_PAPEL.gerente_distrital, faz: 'confere as unidades do distrito' },
  { quem: NOME_DO_PAPEL.seab, faz: 'fecha o mês e faz a conta' },
  { quem: 'cada gerente', faz: 'vê a própria nota com a conta aberta' },
] as const

export const CONTAGENS_DA_SOLUCAO = {
  telas: 'telas',
  papeis: 'papéis',
  regras: 'versões da regra',
} as const

/** Slide 12: o que ainda está em desenvolvimento, dito na tela. */
export const AINDA_NAO_SR1 = {
  rotulo: 'ainda não',
  texto: 'abrir o mês e cadastrar a regra pela tela, indicadores reais, login real',
} as const

/**
 * Slide 13: as legendas usam o nome das telas no menu, para a banca ligar o
 * desenho à tela da demonstração. As do Kick-off ficam com o Kick-off.
 */
export const LEGENDAS_DO_WIREFRAME_SR1 = [
  'lançamento da unidade',
  'meu resultado: a conta',
  'painel da SEAB',
  'meu resultado: os meses',
] as const satisfies { length: (typeof LEGENDAS_DO_WIREFRAME)['length'] }

/**
 * A decisão que cada desenho fixa, na mesma ordem das legendas. O wireframe
 * existe para mostrar a decisão de layout, e o PDF é lido sem a fala.
 */
export const DECISOES_DO_WIREFRAME_SR1 = [
  'um campo para cada item medido',
  'a nota em cima, a conta inteira embaixo',
  'cada unidade numa linha, e quem falta em destaque',
  'o mês escolhido ao lado dos anteriores',
] as const satisfies { length: (typeof LEGENDAS_DO_WIREFRAME)['length'] }

/**
 * Slide 14: a linha que troca o "recebe 80% da gratificação" do cartão. O
 * percentual de cada classe está no Decreto 36.482/2023, que a equipe ainda
 * não tem: no sistema ele é suposição nossa, e o PDF não pode mostrá-lo como
 * regra.
 */
export const PERCENTUAL_A_CONFIRMAR = 'percentual a confirmar no Decreto 36.482/2023'

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
    contra: 'quem recebe não confere a própria nota',
  },
  {
    id: 'versao',
    titulo: 'regra com versão',
    texto: 'mês fechado não muda quando a regra muda',
    contra: 'fórmula arrastada à mão, célula a célula',
    numero: nota(MAIO_V2),
    legenda: `maio, pela regra de maio. pela regra nova, daria ${nota(MAIO_V3)}`,
  },
  {
    id: 'registro',
    titulo: 'registro de quem mudou',
    texto: 'corrigir não apaga: o valor antigo fica na trilha de auditoria',
    contra: 'a planilha não guarda quem mudou o quê',
  },
] as const

/** "hoje", e não "contra": lido no PDF, "contra" parecia a desvantagem do diferencial. */
export const ROTULO_DO_CONTRA = 'hoje'

/** Slide 15: as fases do semestre. As datas saem do cronograma. */
export const FASES_DO_SEMESTRE: readonly {
  nome: string
  ciclos: readonly [CicloId, ...CicloId[]]
  /** A atividade da fase, numa linha: a rubrica pede fases E atividades. */
  faz: string
  atual?: true
}[] = [
  { nome: 'imersão', ciclos: ['s1', 's2'], faz: 'pesquisa, personas, SWOT' },
  { nome: 'ideação', ciclos: ['s3'], faz: 'técnicas e alternativas' },
  { nome: 'proposta', ciclos: ['s4'], faz: 'escopo e backlog' },
  { nome: 'kick-off', ciclos: ['ko'], faz: 'pitch e wireframes' },
  { nome: 'protótipo', ciclos: ['s5', 's6'], faz: 'arquitetura e 8 telas' },
  { nome: 'SR1', ciclos: ['sr1'], faz: 'hoje', atual: true },
  { nome: 'sprints 1 a 4', ciclos: ['s7', 's8', 's9', 's10'], faz: 'indicadores oficiais e contestação' },
  { nome: 'validação', ciclos: ['s11'], faz: 'a Secretaria confere' },
  { nome: 'SR2', ciclos: ['s12', 'sr2'], faz: 'entrega final' },
]

export const ROTINA_DA_SEMANA = {
  rotulo: 'toda semana',
  itens: [
    'registro no site: o que avançou, o que travou, quem fez',
    'cada decisão escrita, com o porquê',
  ],
} as const

/**
 * `metodo` fica fora do rótulo porque o rótulo é caixa alta: "MOSCOW" se lia
 * como o nome da cidade. `primeiras` diz as histórias que já começaram, com o
 * nome delas: a rubrica pede o início do desenvolvimento.
 */
export const BACKLOG_SR1 = {
  rotulo: 'backlog priorizado',
  metodo: '(MoSCoW)',
  primeiras: 'já no ar: lançar, abrir a conta, fechar o mês',
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

/** O papel dito como no resto do deck: "aprendizado de máquina", como no slide 11. */
const PAPEL_SR1: Partial<Record<IntegranteId, string>> = {
  'joao-henrique': 'arquitetura e back-end',
  rafael: 'dados e aprendizado de máquina',
}

export const EQUIPE_SR1 = EQUIPE.map((i) => ({
  id: i.id,
  nome: nomeCurto(i.id),
  papel: PAPEL_SR1[i.id] ?? minusculaInicial(i.papel),
  responsabilidades: RESPONSABILIDADES_SR1[i.id],
}))

export const COLUNAS_DA_EQUIPE = {
  nome: 'quem',
  papel: 'papel',
  responsabilidades: 'responsabilidades',
} as const

/** Slide 18: as ferramentas, o site e o Drive. */
export const FERRAMENTAS_SR1 = [
  { nome: 'GitHub', para: 'código e testes a cada envio' },
  { nome: 'Vercel', para: 'o site no ar' },
  { nome: 'Jupyter', para: 'os cadernos de dados' },
  { nome: 'Claude (IA)', para: 'cada uso registrado' },
  { nome: 'Google Drive', para: 'a pasta da equipe' },
] as const

export const SITE_SR1 = {
  rotulo: 'o site, no lugar do Google Site',
  diario: 'e o diário de bordo semanal',
} as const

export const DRIVE_SR1 = {
  rotulo: 'a pasta do Drive',
  itens: ['recebe o PDF de cada apresentação'],
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

export const ROTULO_DOS_COMPROMISSOS = 'cronograma atualizado: compromissos do kick-off'

/**
 * Slide 21: o balanço do projeto e da equipe. Os riscos são os três maiores
 * do registro da Semana 6; a melhoria da equipe sai do checklist, em que as
 * entregas até o SR1 ficaram registradas em nome de poucas pessoas.
 */
export const BALANCO_SR1 = {
  fortes: {
    rotulo: 'avanços e pontos fortes',
    itens: [
      'cliente real, com regra escrita',
      `as ${TELAS_NO_SR1.length} telas no ar`,
      'seis frentes, cada uma com dono',
    ],
  },
  melhorias: {
    rotulo: 'dificuldades e melhorias',
    itens: [
      { ponto: 'pesquisa sem entrevista', trato: 'entrevistar na semana 11' },
      { ponto: 'entregas em nome de poucos', trato: 'cada um registra a própria entrega' },
      { ponto: 'perguntas sem resposta', trato: 'mandar por escrito, com prazo' },
    ],
  },
  riscos: {
    rotulo: 'três riscos',
    itens: [
      { ponto: 'percentual das classes sem o decreto', trato: 'buscar o decreto' },
      { ponto: 'indicadores de teste', trato: 'trocar pelos 5 da portaria' },
      { ponto: 'agenda do cliente', trato: 'pedir já a data da semana 11' },
    ],
  },
} as const

/** Slide 20: as paradas até o SR2, lidas do cronograma, e o que cada uma entrega. */
export const PARADAS_ATE_O_SR2: readonly { ciclo: CicloId; entrega: string; destaque?: true }[] = [
  { ciclo: 's7', entrega: 'o retorno do SR1 aplicado' },
  { ciclo: 's8', entrega: 'os indicadores da portaria' },
  { ciclo: 's9', entrega: 'porte e prazo de contestação' },
  { ciclo: 's10', entrega: 'a conta testada com linhas reais' },
  { ciclo: 's11', entrega: 'a Secretaria confere a conta', destaque: true },
  { ciclo: 's12', entrega: 'o material do SR2' },
  { ciclo: 'sr2', entrega: 'a entrega final' },
]

/** Slide 22: a relação que a rubrica pede, do problema à solução e ao plano. */
export const CONCLUSAO_SR1 = [
  { rotulo: 'o problema', texto: 'a conta só existe em fórmula de planilha' },
  { rotulo: 'a solução', texto: 'a regra com versão e a conta aberta' },
  { rotulo: 'o plano', texto: 'os indicadores reais e a conta conferida pela Secretaria' },
] as const

export const PERGUNTA_FINAL = 'obrigado. perguntas?'

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
        ...PESSOAS_SR1.flatMap((p) => [p.quem, p.dor]),
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
        ...OBJETIVOS_NO_SR1.flatMap((o) => [o.resumo, o.quando, o.estado, ...(o.proximo ? [o.proximo] : [])]),
        ESCOPO_SR1.fora,
      ]
    case 'tecnicas':
      return [
        ...base,
        ...TECNICAS_SR1.flatMap((t) => [t.nome, ROTULO_DOS_MINUTOS, t.como, t.produto]),
        ...FUNIL_DA_IDEACAO.map((f) => f.rotulo),
      ]
    case 'escolha':
      return [
        ...base,
        ...Object.values(COLUNAS_DA_MATRIZ),
        ...ALTERNATIVAS_SR1.flatMap((a) => [a.nome, a.destino]),
        LEGENDA_DA_MATRIZ.rotulo,
        LEGENDA_DA_MATRIZ.texto,
      ]
    case 'disciplinas':
      return [...base, ...DISCIPLINAS_SR1.flatMap((d) => [d.nome, ...d.itens])]
    case 'solucao':
      return [
        ...base,
        ...FLUXO_DO_MES.flatMap((p) => [p.quem, p.faz]),
        ...Object.values(CONTAGENS_DA_SOLUCAO),
        AINDA_NAO_SR1.rotulo,
        AINDA_NAO_SR1.texto,
      ]
    case 'wireframes':
      return [...base, ...LEGENDAS_DO_WIREFRAME_SR1, ...DECISOES_DO_WIREFRAME_SR1]
    case 'demo':
      // A frase de apoio aparece; a conta de reserva é a interface do
      // sistema, não texto nosso, e fica fora do teto como no Kick-off.
      return [...base, ROTULO_DA_DEMO_SR1, ENDERECO_DA_DEMO, PERCENTUAL_A_CONFIRMAR]
    case 'diferenciais':
      return [
        ...base,
        ...DIFERENCIAIS_SR1.flatMap((d) => [
          d.titulo,
          d.texto,
          ...('contra' in d ? [ROTULO_DO_CONTRA, d.contra] : []),
          ...('legenda' in d ? [d.legenda] : []),
        ]),
      ]
    case 'processo':
      return [
        ...base,
        ...FASES_DO_SEMESTRE.flatMap((f) => [f.nome, f.faz]),
        ROTINA_DA_SEMANA.rotulo,
        ...ROTINA_DA_SEMANA.itens,
        BACKLOG_SR1.rotulo,
        BACKLOG_SR1.metodo,
        ...BACKLOG_SR1.itens.map((i) => i.rotulo),
        BACKLOG_SR1.noAr,
        BACKLOG_SR1.primeiras,
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
        ...EM_ANDAMENTO_SR1.flatMap((g) => [...g.itens, ...(g.dono ? [nomeCurto(g.dono)] : [])]),
      ]
    case 'avanco':
      return [
        ...base,
        ...AVANCO.flatMap((a) => [a.rotulo, a.conta]),
        ROTULO_DOS_COMPROMISSOS,
        ...COMPROMISSOS_NO_SR1.flatMap((c) => [c.compromisso, c.estado, c.dono, c.agora]),
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
