import dados from '@/content/ml/apresentacao.json'
import resultados from '@/content/ml/resultados.json'
import { CITACAO_DA_SECRETARIA, decimal, DIVISOR_DAS_SEIS, enxuto } from '@/content/apresentacao-ml'
import type { IntegranteId } from '@/content/equipe'
import {
  COMPROMISSOS_ATE_O_SR1,
  CONTAGENS_PITCH,
  ETAPAS_DO_MES,
  formatarTempo,
} from '@/content/pitch'
import { calcularAvaliacao } from '@/lib/calculo/motor'
import type { Avaliacao } from '@/lib/calculo/tipos'
import { cicloPorId, indiceDoCiclo, type CicloId } from '@/lib/cronograma'
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
 * O KICK-OFF PROMETEU, O SR1 PRESTA CONTA. O deck do Kick-off apresentou o
 * problema e a ideia. Este mostra o que mudou desde então: a planilha do
 * cliente, a regra corrigida, o sistema rodando, e o que foi e o que não foi
 * cumprido. Ele NÃO repete quem sofre, SWOT, ideação e wireframes: já foram
 * avaliados e continuam no site.
 *
 * NENHUM NÚMERO DIGITADO. A nota de maio e de junho sai do motor de cálculo na
 * hora de montar o slide; a planilha, de `ml/apresentacao.json`; os modelos,
 * de `ml/resultados.json`; as contagens de segurança, de `CONTAGENS_PITCH`,
 * que o teste do Kick-off confere contra `docs/seguranca.md`. Se a fonte
 * mudar, a tela e a fala mudam junto.
 *
 * DUAS VERSÕES, UM DECK. O tempo do SR1 não foi confirmado: a diretriz do
 * Kick-off dizia cinco minutos e o professor liberou dez. A versão completa
 * fecha em 9:00; a curta, em 4:55, abre com `/sr1?versao=curta` e usa só os
 * slides com `curto`, dizendo só as primeiras `curto.notas` linhas da fala.
 * Os sete falam nas duas.
 *
 * Nomes aparecem aqui só como QUEM FALA. Nenhuma pessoa real aparece nos
 * dados: o sistema roda com dados de teste, e a base da Secretaria é por
 * unidade de saúde, sem nome, CPF ou matrícula (ADR-044).
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
 * Slide 6: a mesma unidade em três contas.
 *
 * Maio fechou pela versão 2 e continua com o número que publicou. Maio pela
 * versão 3 é a conta que NÃO foi feita, calculada aqui só para mostrar o
 * tamanho da mudança. Junho já usa a versão 3.
 */
export const TRES_CONTAS = [
  {
    id: 'maio-v2',
    rotulo: 'maio, pela regra de maio',
    versao: 'versão 2',
    avaliacao: avaliar('ciclo-2026-05', 'regra-v2'),
  },
  {
    id: 'maio-v3',
    rotulo: 'maio, se fosse pela regra nova',
    versao: 'versão 3',
    avaliacao: avaliar('ciclo-2026-05', 'regra-v3'),
  },
  {
    id: 'junho-v3',
    rotulo: 'junho, pela regra nova',
    versao: 'versão 3',
    avaliacao: avaliar('ciclo-2026-06', 'regra-v3'),
  },
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

/** Slide 7: a demonstração de reserva, com a conta de junho pela versão 3. */
export const DEMO_SR1 = { cicloId: 'ciclo-2026-06', avaliacao: JUNHO_V3 } as const

/** Telas que estão no ar no dia do SR1: as que o ciclo de cada uma já abriu. */
export const TELAS_NO_SR1 = FEATURES.filter(
  (f) => indiceDoCiclo(f.ciclo) <= indiceDoCiclo('sr1'),
)

/** Quantos testes o motor de cálculo tem. Conferido contra o arquivo no teste. */
export const TESTES_DO_MOTOR = 55

const CLASSIFICACAO = ML.modelos.find((m) => m.modelo === 'classificacao')
const REGRESSAO = ML.modelos.find((m) => m.modelo === 'regressao')
const AGRUPAMENTO = ML.modelos.find((m) => m.modelo === 'clustering')
if (!CLASSIFICACAO || !REGRESSAO || !AGRUPAMENTO) {
  throw new Error('resultados.json sem os três modelos')
}

const ACERTO = CLASSIFICACAO.metricas.acuracia as number
const ACERTO_DO_CHUTE = (CLASSIFICACAO.referencia as { acuracia: number }).acuracia
const R2 = REGRESSAO.metricas.r2 as number
const GRUPOS = AGRUPAMENTO.metricas.k as number
const SILHUETA = AGRUPAMENTO.metricas.silhueta as number

/** 0,54 vira 54%, que é como se diz em voz alta. */
function porcentoInteiro(fracao: number): string {
  return `${Math.round(fracao * 100)}%`
}

const DIVISOR = enxuto(DIVISOR_DAS_SEIS, 1)

/* -------------------------------------------------------------------------
   O contrato do slide
------------------------------------------------------------------------- */

export interface VersaoCurta {
  /** Quanto o slide dura na versão de cinco minutos. */
  readonly segundos: number
  /** Quantas linhas da fala entram: sempre as primeiras. */
  readonly notas: number
}

export interface SlideSR1 {
  readonly id: string
  readonly numero: number
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
  /** Presença na versão de cinco minutos. Ausente: o slide sai dela. */
  readonly curto?: VersaoCurta
}

/**
 * 9:00, dentro dos dez minutos que o professor liberou no Kick-off.
 *
 * Ninguém confirmou ainda o tempo do SR1. Se forem cinco minutos, a versão
 * curta fecha em 4:55, com os sete falando entre 30 segundos e pouco mais de
 * um minuto cada. A margem é de propósito nas duas: ensaio que fecha no
 * limite estoura no dia.
 */
export const DURACAO_SR1_SEGUNDOS = 540
export const DURACAO_SR1_CURTA_SEGUNDOS = 295

/** Palavras por segundo de uma fala calma, a mesma conta da AV1 de ML. */
export const PALAVRAS_POR_SEGUNDO = 2.6

/** O teto de palavras na tela por slide, o mesmo do Kick-off. */
export const TETO_DE_PALAVRAS_SR1 = 70

/** O PDF de reserva, gerado por `npm run pitch-pdf -- sr1` a partir da rota. */
export const ARQUIVO_PDF_SR1 = '/sr1/pdf'

/** A rota da versão curta. */
export const ROTA_CURTA_SR1 = '/sr1?versao=curta'

export const SLIDES_SR1 = [
  {
    id: 'capa',
    numero: 1,
    titulo: 'prumo',
    apoio: 'o cálculo da gratificação, aberto para qualquer um conferir',
    visual: 'Wordmark, a pílula do SR1 e os nomes da equipe inteira.',
    segundos: 15,
    quemFala: 'gabriel',
    notas: [
      'Bom dia. Somos a Equipe 2, e este é o Prumo. O cliente é a Secretaria de Saúde do Recife.',
      'Hoje os sete falam, e qualquer um de nós responde qualquer pergunta no fim.',
    ],
    curto: { segundos: 10, notas: 1 },
  },
  {
    id: 'roteiro',
    numero: 2,
    titulo: 'o caminho de hoje',
    apoio: 'do que a planilha mostrou ao que vem até o sr2.',
    visual: 'As seis paradas do roteiro, numeradas.',
    segundos: 10,
    quemFala: 'fernando',
    notas: [
      'Seis paradas: o problema, a planilha do cliente, o sistema rodando, como sabemos que está certo, o que prometemos e o que vem.',
    ],
  },
  {
    id: 'problema',
    numero: 3,
    titulo: 'todo mês, uma conta feita à mão',
    apoio: 'A regra está num documento oficial. A conta está numa planilha.',
    visual: 'O caminho do dinheiro em cinco passos, e a frase da Secretaria sobre como a conta é feita.',
    segundos: 30,
    quemFala: 'gabriel',
    notas: [
      'Quem dirige uma unidade de saúde no Recife recebe um extra no salário quando bate as metas do mês.',
      'A regra está numa portaria. A conta é feita numa planilha, e é aí que o processo quebra.',
      'Não é impressão nossa: perguntamos à Secretaria como a conta é feita hoje. A resposta foi esta da tela.',
    ],
    perguntas: [
      'A frase veio da Secretaria em 22 de setembro, junto com a planilha. Está registrada no repositório, com a data.',
    ],
    curto: { segundos: 25, notas: 3 },
  },
  {
    id: 'planilha',
    numero: 4,
    titulo: 'a planilha deles, por dentro',
    apoio: 'a base de desempenho da Secretaria: uma linha por unidade, sem dado de pessoa.',
    visual: 'O funil de linhas até as unidades que seguem a regra, e três achados da leitura.',
    segundos: 40,
    quemFala: 'matheus',
    notas: [
      'A Secretaria autorizou o uso da base de desempenho dela. É uma linha por unidade de saúde, sem nome, CPF ou matrícula.',
      `São ${B.linhas} linhas. Tirando as linhas de distrito, sobram ${B.unidades} unidades de saúde.`,
      `${B.modeladas} seguem a conta da portaria. ${B.fora_da_regra}, de dois tipos que a portaria não nomeia, seguem outra: a soma dos pontos dividida por ${DIVISOR}.`,
      `E ${dados.inconsistencias.colunas_numericas_como_texto} colunas de número estão guardadas como texto. É o retrato de uma conta mantida à mão.`,
    ],
    perguntas: [
      'O arquivo está em ml/data, com autorização da Secretaria registrada na ADR-044. Um teste varre o arquivo linha a linha atrás de CPF, e-mail e telefone.',
      'NDI e SAE não estão entre os sete tipos da portaria. A gente não sabe ainda se a conta diferente é regra ou erro: é uma das perguntas para a Secretaria.',
    ],
    curto: { segundos: 35, notas: 3 },
  },
  {
    id: 'erros',
    numero: 5,
    titulo: 'três coisas que a gente tinha errado',
    apoio: 'no kick-off, dissemos que parte da conta era aposta nossa. a planilha respondeu.',
    visual: 'Três linhas, cada uma com o que a gente fazia e o que a planilha faz, e os tipos de unidade.',
    segundos: 40,
    quemFala: 'kerry',
    notas: [
      'No Kick-off a gente disse que parte da conta era aposta nossa. A planilha respondeu três apostas.',
      'A gente fazia a média dos valores. A planilha dá nota a cada item primeiro e faz a média das notas.',
      'Quando faltava um número, a gente zerava. A planilha tira da conta, e o peso sai junto, como manda o artigo 8º.',
      'E a nota é de 0 a 1, não de 0 a 10. Os tipos de unidade também estavam errados: são os sete da portaria.',
    ],
    perguntas: [
      'A planilha mostrou mais duas coisas: tem item em que passar do alvo também perde ponto, e numerador maior que denominador é erro, não nota cheia.',
    ],
    curto: { segundos: 30, notas: 3 },
  },
  {
    id: 'regra',
    numero: 6,
    titulo: 'a regra mudou, e maio não',
    apoio: 'a correção entrou como regra nova, com número de versão. mês fechado não muda.',
    visual: 'A mesma unidade de teste em três contas: maio pela versão 2, maio pela versão 3 e junho pela versão 3.',
    segundos: 40,
    quemFala: 'joao-henrique',
    notas: [
      'A correção entrou como uma regra nova, a versão 3, guardada como dado. O motor aprendeu o jeito novo sem esquecer o antigo.',
      `Maio fechou pela versão 2 e continua dando ${notaFalada(MAIO_V2)}. Pela regra nova, maio daria ${notaFalada(MAIO_V3)}.`,
      `Mas mês fechado não muda quando a regra muda. Junho já usa a versão 3, e dá ${notaFalada(JUNHO_V3)}.`,
      'Era para isso que a regra virou dado: a primeira mudança grande aconteceu sem tocar em resultado publicado.',
    ],
    perguntas: [
      'A classe de cada nota (satisfatório, excelente) vem da planilha. O percentual pago em cada classe ainda é suposição nossa: ele está num decreto que a gente ainda não tem.',
      'Os indicadores do sistema ainda são de teste. O que entrou foi o jeito de calcular, que vale para qualquer indicador.',
    ],
    curto: { segundos: 30, notas: 3 },
  },
  {
    id: 'demo',
    numero: 7,
    titulo: 'do número à nota, ao vivo',
    apoio: 'o sistema rodando agora, com dados de teste.',
    visual: 'O sistema ao vivo. De reserva, a nota de junho com a conta aberta, calculada na hora.',
    segundos: 105,
    quemFala: 'joao-pedro',
    notas: [
      'Agora o sistema, ao vivo. Tudo o que aparece são dados de teste: nenhuma pessoa real.',
      'Primeiro, a unidade. Escolho uma unidade de exemplo e lanço os números do mês. Cada número diz de onde veio.',
      'Depois, a coordenação. O painel mostra quem já mandou e quem falta, e o mês avança uma etapa por vez.',
      `Por fim, o resultado. A nota de junho da USF Canário é ${notaFalada(JUNHO_V3)}, e embaixo está a conta inteira.`,
      'Cada linha mostra o número que a unidade mandou, o alvo, a nota que ele ganhou e quanto pesa.',
      'A última linha fecha a conta na frente de todo mundo. Qualquer pessoa refaz no papel.',
      'Se a rede cair, esta tela é a mesma conta, parada. E o PDF de reserva tem ela também.',
    ],
    perguntas: [
      'Quem mexe na tela não é quem fala: assim a demonstração não depende de uma pessoa só.',
      'O que um visitante lança fica na sessão dele. A demonstração de um não muda a tela de outro.',
    ],
    curto: { segundos: 80, notas: 6 },
  },
  {
    id: 'papeis',
    numero: 8,
    titulo: 'cada um vê o que é seu',
    apoio: 'quem manda o número não escolhe a meta.',
    visual: 'Os quatro papéis e quantas telas cada um enxerga.',
    segundos: 20,
    quemFala: 'joao-pedro',
    notas: [
      'São quatro papéis, e cada um só enxerga as telas dele. Quem manda o número não escolhe a meta.',
      'O que não é seu, para o sistema, não existe: a página responde que não foi encontrada.',
    ],
    perguntas: [
      'O login ainda é simulado: você escolhe o papel. Um teste percorre as oito telas contra os quatro papéis e falha se uma porta abrir para quem não devia.',
      'A resposta é "não encontrado" e nunca "proibido" de propósito: da porta, não dá para saber se a tela existe.',
    ],
  },
  {
    id: 'arquitetura',
    numero: 9,
    titulo: 'o prumo em quatro zooms',
    apoio: 'do contexto ao código, no padrão C4. o desenho inteiro está no site.',
    visual: 'Os quatro níveis do C4, com o motor de cálculo em destaque e o endereço da página.',
    segundos: 30,
    quemFala: 'joao-henrique',
    notas: [
      'Desenhamos o sistema em quatro níveis de zoom, no padrão C4. O desenho inteiro está na página de arquitetura do site.',
      'O ponto que importa: o motor de cálculo não lê relógio, rede nem banco. Recebe números e devolve a nota com a conta.',
      'E um teste lê o código e falha se alguém fizer o motor olhar para fora.',
    ],
    perguntas: [
      'O banco de dados existe desenhado, com as regras de acesso testadas num Postgres de verdade, mas está desligado: o sistema roda em memória para qualquer pessoa clonar e rodar sem senha.',
    ],
  },
  {
    id: 'confianca',
    numero: 10,
    titulo: 'como sabemos que a conta está certa',
    apoio: 'teste automático a cada mudança, e mês fechado que continua dando o mesmo número.',
    visual: 'Três contagens: testes do motor, versões da regra guardadas e meses fechados.',
    segundos: 35,
    quemFala: 'fernando',
    notas: [
      `Primeiro, ${TESTES_DO_MOTOR} testes só para o motor, cobrindo as bordas de cada faixa e o arredondamento.`,
      `Segundo, as ${BASE.regras.length} versões da regra continuam guardadas, e cada mês aponta para a que usou.`,
      'Terceiro, cada envio de código ao repositório roda todos os testes de novo, sozinho.',
      'O que falta: conferir a nossa conta contra linhas reais da planilha. Está na correção de rota.',
    ],
    perguntas: [
      'O motor é uma função pura: mesma entrada, mesmo número, em qualquer dia. Recalcular fevereiro em dezembro dá o número de fevereiro.',
      'A checagem automática também prova que conteúdo de semana futura não aparece no site antes da hora.',
    ],
    curto: { segundos: 30, notas: 3 },
  },
  {
    id: 'ml',
    numero: 11,
    titulo: 'a base de verdade, com aprendizado de máquina',
    apoio: `três modelos sobre as ${B.modeladas} unidades. eles mostram o que pesa, não fazem a conta.`,
    visual: 'Os três modelos, cada um com o número principal e a referência ao lado.',
    segundos: 35,
    quemFala: 'rafael',
    notas: [
      `Na disciplina de aprendizado de máquina, usamos a base da Secretaria: as ${B.modeladas} unidades que seguem a regra.`,
      `O classificador acerta ${porcentoInteiro(ACERTO)}, e o chute mais simples acerta ${porcentoInteiro(ACERTO_DO_CHUTE)}. Ele acerta porque aprende a própria conta da portaria.`,
      'Por isso o modelo diz o que mais pesa, e não calcula nada. Nenhum resultado dele entra na gratificação.',
      'O sistema continua com dados de teste. A base real fica nos cadernos.',
    ],
    perguntas: [
      'A apresentação completa de aprendizado de máquina está na página ml do site, com o PDF.',
      `O agrupamento separa ${GRUPOS} grupos de unidades, nunca de pessoas, com silhueta de ${decimal(SILHUETA, 2)}.`,
    ],
  },
  {
    id: 'riscos',
    numero: 12,
    titulo: 'o que pode dar errado, dito antes',
    apoio: 'login de faz de conta, banco desligado, e parte da regra ainda é suposição.',
    visual: 'Os quatro riscos maiores, e as contagens de segurança.',
    segundos: 30,
    quemFala: 'rafael',
    notas: [
      'A gente prefere dizer o que falta antes que alguém pergunte. O registro de riscos inteiro está no site.',
      'O maior: o percentual pago em cada classe ainda é suposição. Ele está num decreto que a gente não tem.',
      'Os indicadores ainda são de teste, e o prazo para contestar a nota ainda não existe.',
    ],
    perguntas: [
      `Em segurança, ${CONTAGENS_PITCH.ameacasStride} ameaças listadas uma a uma (STRIDE) e as ${CONTAGENS_PITCH.itensOwasp} falhas mais comuns conferidas (OWASP), ${CONTAGENS_PITCH.owaspParciais} ainda pela metade.`,
      'Uma unidade que é única no distrito pode apontar quem a dirige. Isso está na análise de privacidade, e é uma pergunta para a Secretaria.',
    ],
    curto: { segundos: 30, notas: 3 },
  },
  {
    id: 'prometido',
    numero: 13,
    titulo: 'o que prometemos, e o que fizemos',
    apoio: 'os três compromissos do kick-off, cada um com o estado de hoje.',
    visual: 'Os três compromissos do Kick-off, com quem puxou, o estado e o porquê.',
    segundos: 35,
    quemFala: 'gabriel',
    notas: [
      'No Kick-off prometemos três coisas até hoje, com data e nome. Vamos prestar contas.',
      `As telas estão no ar: as ${TELAS_NO_SR1.length}.`,
      'A regra oficial entrou em parte: o jeito de calcular da planilha está no sistema, mas os indicadores ainda são de teste.',
      'E a conferência com a Secretaria não aconteceu. As perguntas estão escritas, e a conferência da conta ficou para a Semana 11.',
    ],
    curto: { segundos: 15, notas: 2 },
  },
  {
    id: 'rota',
    numero: 14,
    titulo: 'a correção de rota',
    apoio: 'o que a planilha mudou nas quatro sprints, e o que continua fora.',
    visual: 'O que entra nas sprints por causa da planilha, e o que fica para depois.',
    segundos: 30,
    quemFala: 'matheus',
    notas: [
      'A planilha mudou o plano. Entram os indicadores reais da portaria, o porte das unidades e o prazo de contestação.',
      'Entra também conferir a nossa conta contra linhas reais da planilha, com as perguntas que decidem a regra.',
      'Folha de pagamento, login da prefeitura e dado de pessoa continuam fora. O estado de cada história está no site.',
    ],
    perguntas: [
      'O retorno desta banca entra por cima de tudo isso, na primeira sprint.',
    ],
  },
  {
    id: 'sr2',
    numero: 15,
    titulo: 'até o sr2',
    apoio: 'quatro sprints, uma semana com o cliente e a entrega final.',
    visual: 'As sete paradas até o SR2, com a data de cada uma e a validação em destaque.',
    segundos: 25,
    quemFala: 'kerry',
    notas: [
      'Daqui até o SR2 são quatro sprints, uma semana de validação com o cliente e a entrega final.',
      'A semana que mais importa é a da validação: é quando a Secretaria confere se a nossa conta bate com a dela.',
    ],
  },
  {
    id: 'fechamento',
    numero: 16,
    titulo: 'prumo',
    apoio: 'o registro, os documentos, o sistema e esta apresentação estão no ar.',
    visual: 'Wordmark, o endereço do site e a pergunta para a banca.',
    segundos: 20,
    quemFala: 'gabriel',
    notas: [
      'Obrigado. Tudo o que mostramos está no site, e qualquer um de nós responde.',
      'O site tem um índice no topo com as oito seções, na ordem em que vocês pediram.',
    ],
    curto: { segundos: 10, notas: 1 },
  },
] as const satisfies readonly SlideSR1[]

export type SlideSR1Id = (typeof SLIDES_SR1)[number]['id']

/** Os slides da versão de cinco minutos, na mesma ordem. */
export const SLIDES_SR1_CURTA: readonly SlideSR1[] = (SLIDES_SR1 as readonly SlideSR1[]).filter(
  (slide) => slide.curto,
)

export type Versao = 'completa' | 'curta'

export function slidesDaVersao(versao: Versao): readonly SlideSR1[] {
  return versao === 'curta' ? SLIDES_SR1_CURTA : (SLIDES_SR1 as readonly SlideSR1[])
}

/** Quanto o slide dura naquela versão. */
export function segundosNaVersao(slide: SlideSR1, versao: Versao): number {
  return versao === 'curta' ? (slide.curto?.segundos ?? 0) : slide.segundos
}

/** O que se diz naquele slide, naquela versão. */
export function notasNaVersao(slide: SlideSR1, versao: Versao): readonly string[] {
  return versao === 'curta' ? slide.notas.slice(0, slide.curto?.notas ?? 0) : slide.notas
}

/* -------------------------------------------------------------------------
   O TEXTO DE CADA VISUAL

   Curto de propósito. O que explica mora nas `notas` do slide.
------------------------------------------------------------------------- */

/** Capa. */
export const PILULA_DA_CAPA_SR1 = 'sr1'

/** Slide 2: as seis paradas. */
export const ROTEIRO_SR1 = [
  'o problema',
  'a planilha do cliente',
  'o sistema rodando',
  'como sabemos que está certo',
  'o que prometemos',
  'até o sr2',
] as const

/** Slide 3: o caminho do dinheiro é o do Kick-off, e a frase é da Secretaria. */
export { ETAPAS_DO_MES, CITACAO_DA_SECRETARIA }

/** Slide 4: o funil e os achados. */
export const FUNIL_SR1 = [
  { numero: B.linhas, rotulo: 'linhas na base' },
  { numero: B.unidades, rotulo: 'unidades de saúde', motivo: 'sem as linhas de distrito' },
  { numero: B.modeladas, rotulo: 'seguem a conta da portaria', motivo: `${B.fora_da_regra} seguem outra` },
] as const

export const ACHADOS_DA_PLANILHA = [
  {
    numero: B.fora_da_regra,
    texto: `unidades (${B.familias_fora_da_regra.join(' e ')}) com outra conta: pontos ÷ ${DIVISOR}`,
  },
  {
    numero: dados.inconsistencias.colunas_numericas_como_texto,
    texto: 'colunas de número guardadas como texto',
  },
  {
    numero: dados.inconsistencias.metas_escritas_de_dois_jeitos.length,
    texto: 'metas escritas de dois jeitos, como 20 e 2000%',
  },
] as const

export const ROTULO_DA_BASE = 'dado de unidade, autorizado pela Secretaria; nenhuma pessoa'

/** Slide 5: o que a gente fazia, o que a planilha faz. */
export const TRES_ERROS = [
  { antes: 'média dos valores', depois: 'média das notas' },
  { antes: 'faltou número, zera', depois: 'faltou número, sai da conta com o peso' },
  { antes: 'nota de 0 a 10', depois: 'nota de 0 a 1' },
] as const

export const COLUNAS_DOS_ERROS = { antes: 'a gente fazia', depois: 'a planilha faz' } as const

export const TIPOS_DE_UNIDADE = {
  antes: 'eram 4 tipos de unidade, dois inventados',
  depois: `são os ${BASE.tiposUnidade.length} da portaria`,
} as const

/** Slide 6: o rótulo de cada coluna da comparação. */
export const ROTULO_DA_UNIDADE_DO_DECK = 'dados de teste'

/** O nome da unidade vem da base, como no Kick-off: é dado, não texto nosso. */
export const NOME_DA_UNIDADE_DO_DECK =
  BASE.unidades.find((u) => u.id === UNIDADE_DO_DECK)?.nome ?? UNIDADE_DO_DECK

/** Slide 7: o rótulo da demonstração de reserva. */
export const ROTULO_DA_DEMO_SR1 = 'junho · dados de teste, nenhuma pessoa real'
export const ENDERECO_DA_DEMO = '/sistema'

/** Slide 8: os quatro papéis, na ordem da equipe do sistema. */
export const ORDEM_DOS_PAPEIS: readonly PerfilId[] = [
  'seab',
  'administrador',
  'gerente_distrital',
  'gerente_unidade',
]

export function telasDoPapel(perfil: PerfilId): number {
  return TELAS_NO_SR1.filter((f) => (f.perfis as readonly PerfilId[]).includes(perfil)).length
}

export const NOME_DO_PAPEL: Record<PerfilId, string> = Object.fromEntries(
  Object.entries(PERFIS).map(([id, perfil]) => [id, perfil.rotulo.toLowerCase()]),
) as Record<PerfilId, string>

export const ROTULO_DAS_TELAS = 'telas'
export const REGRA_DA_PORTA = 'o que não é seu responde "não encontrado" (404), nunca "proibido"'

/** Slide 9: os quatro níveis do C4. */
export const NIVEIS_C4 = [
  { nivel: 'contexto', mostra: 'quem usa o prumo, e com quem ele conversa' },
  { nivel: 'contêineres', mostra: 'o site, as telas e onde os dados moram' },
  { nivel: 'componentes', mostra: 'as rotas, a camada de dados e o motor' },
  { nivel: 'código', mostra: 'as peças do cálculo por dentro' },
] as const

export const DESTAQUE_DO_MOTOR = 'o motor de cálculo não lê relógio, rede nem banco'
export const ENDERECO_DA_ARQUITETURA = '/arquitetura'

/** Slide 10: as três contagens. O número vem da fonte; aqui, só as palavras. */
export const ROTULOS_DA_CONFIANCA = {
  testes: 'testes só do motor',
  testesLegenda: 'bordas de cada faixa e arredondamento',
  regras: 'versões da regra guardadas',
  regrasLegenda: 'cada mês aponta para a que usou',
  meses: 'meses fechados',
  mesesLegenda: 'o número não muda quando a regra muda',
} as const

export const FALTA_NA_CONFIANCA = 'falta: conferir a conta contra linhas reais da planilha'

/** Slide 11: os três modelos. */
export const MODELOS_SR1 = [
  {
    id: 'classificacao',
    tarefa: 'fica abaixo de 90%?',
    numero: porcentoInteiro(ACERTO),
    rotulo: 'de acerto',
    referencia: `o chute simples acerta ${porcentoInteiro(ACERTO_DO_CHUTE)}`,
  },
  {
    id: 'regressao',
    tarefa: 'que resultado esperar?',
    numero: decimal(R2, 2),
    rotulo: 'do resultado explicado (R²)',
    referencia: 'soma com peso das mesmas notas',
  },
  {
    id: 'agrupamento',
    tarefa: 'quem se parece com quem?',
    numero: String(GRUPOS),
    rotulo: 'grupos de unidades',
    referencia: `silhueta de ${decimal(SILHUETA, 2)}`,
  },
] as const

export const LIMITE_DOS_MODELOS = 'nenhum resultado de modelo entra no cálculo da gratificação'
export const ENDERECO_DO_ML = '/ml'

/** Slide 12: os quatro riscos maiores. O registro inteiro está na Semana 6. */
export const RISCOS_SR1 = [
  'o percentual de cada classe depende de um decreto que não temos',
  'os indicadores do sistema ainda são de teste',
  'o prazo para contestar a nota ainda não existe',
  'unidade única no distrito pode apontar quem a dirige',
] as const

export const ROTULOS_DA_SEGURANCA = {
  stride: 'ameaças listadas (STRIDE)',
  owasp: `falhas comuns conferidas (OWASP), ${CONTAGENS_PITCH.owaspParciais} pela metade`,
} as const

/** Slide 13: cada compromisso do Kick-off com o estado de hoje. */
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
    porque: 'as perguntas estão escritas; a conferência ficou para a semana 11',
  },
}

export const COMPROMISSOS_NO_SR1 = COMPROMISSOS_ATE_O_SR1.map((c) => ({
  ...c,
  ...ESTADO_DOS_COMPROMISSOS[c.ciclo],
}))

/** Slide 14: o que entra e o que fica para depois. */
export const CORRECAO_DE_ROTA = {
  entra: [
    'os 5 indicadores da portaria',
    'o porte de cada unidade',
    'o prazo para contestar a nota',
    'os cortes das classes, quando a secretaria responder',
    'a conta testada com linhas reais da base',
  ],
  depois: ['a folha de pagamento', 'o login da prefeitura', 'dado de pessoa no sistema'],
} as const

export const COLUNAS_DA_ROTA = { entra: 'entra nas sprints', depois: 'continua fora' } as const

/** Slide 15: as paradas até o SR2, lidas do cronograma, e o que cada uma entrega. */
export const PARADAS_ATE_O_SR2: readonly { ciclo: CicloId; entrega: string; destaque?: true }[] = [
  { ciclo: 's7', entrega: 'o retorno do sr1 aplicado' },
  { ciclo: 's8', entrega: 'os indicadores da portaria' },
  { ciclo: 's9', entrega: 'porte e prazo de contestação' },
  { ciclo: 's10', entrega: 'a conta testada com linhas reais' },
  { ciclo: 's11', entrega: 'a secretaria confere a conta', destaque: true },
  { ciclo: 's12', entrega: 'o material do sr2' },
  { ciclo: 'sr2', entrega: 'a entrega final' },
]

export const ROTULO_SE_PERGUNTAREM_SR1 = 'se perguntarem'

/* -------------------------------------------------------------------------
   O que conta como texto de tela
------------------------------------------------------------------------- */

/**
 * Todo texto que o autor põe na tela, por slide. Número vindo da fonte e nome
 * de papel lido de `features.ts` ficam de fora da conta de palavras só quando
 * são dado; rótulo escrito aqui conta sempre.
 */
export function textoNaTela(id: SlideSR1Id): readonly string[] {
  const slide = SLIDES_SR1.find((s) => s.id === id)
  if (!slide) throw new Error(`Slide desconhecido: ${id}`)
  const base = [slide.titulo, slide.apoio]

  switch (id) {
    case 'capa':
      return [slide.apoio, PILULA_DA_CAPA_SR1]
    case 'roteiro':
      return [...base, ...ROTEIRO_SR1]
    case 'problema':
      return [
        ...base,
        ...ETAPAS_DO_MES.flatMap((e) => (e.quebra ? [e.quem, e.oQue, 'aqui quebra'] : [e.quem, e.oQue])),
        CITACAO_DA_SECRETARIA.frase,
        CITACAO_DA_SECRETARIA.fonte,
      ]
    case 'planilha':
      return [
        ...base,
        ...FUNIL_SR1.flatMap((f) => ('motivo' in f ? [f.rotulo, f.motivo] : [f.rotulo])),
        ...ACHADOS_DA_PLANILHA.map((a) => a.texto),
      ]
    case 'erros':
      return [
        ...base,
        COLUNAS_DOS_ERROS.antes,
        COLUNAS_DOS_ERROS.depois,
        ...TRES_ERROS.flatMap((e) => [e.antes, e.depois]),
        TIPOS_DE_UNIDADE.antes,
        TIPOS_DE_UNIDADE.depois,
      ]
    case 'regra':
      return [
        ...base,
        ROTULO_DA_UNIDADE_DO_DECK,
        ...TRES_CONTAS.flatMap((c) => [c.rotulo, c.versao, classe(c.avaliacao)]),
      ]
    case 'demo':
      // A frase de apoio aparece; a conta de reserva é a interface do
      // sistema, não texto nosso, e fica fora do teto como no Kick-off.
      return [...base, ROTULO_DA_DEMO_SR1, ENDERECO_DA_DEMO]
    case 'papeis':
      return [
        ...base,
        ...ORDEM_DOS_PAPEIS.map((p) => NOME_DO_PAPEL[p]),
        ROTULO_DAS_TELAS,
        REGRA_DA_PORTA,
      ]
    case 'arquitetura':
      return [
        ...base,
        ...NIVEIS_C4.flatMap((n) => [n.nivel, n.mostra]),
        DESTAQUE_DO_MOTOR,
        ENDERECO_DA_ARQUITETURA,
      ]
    case 'confianca':
      return [...base, ...Object.values(ROTULOS_DA_CONFIANCA), FALTA_NA_CONFIANCA]
    case 'ml':
      return [
        ...base,
        ...MODELOS_SR1.flatMap((m) => [m.tarefa, m.rotulo, m.referencia]),
        LIMITE_DOS_MODELOS,
        ENDERECO_DO_ML,
      ]
    case 'riscos':
      return [...base, ...RISCOS_SR1, ...Object.values(ROTULOS_DA_SEGURANCA)]
    case 'prometido':
      return [
        ...base,
        ...COMPROMISSOS_NO_SR1.flatMap((c) => [c.compromisso, c.estado, c.porque]),
      ]
    case 'rota':
      return [
        ...base,
        COLUNAS_DA_ROTA.entra,
        COLUNAS_DA_ROTA.depois,
        ...CORRECAO_DE_ROTA.entra,
        ...CORRECAO_DE_ROTA.depois,
      ]
    case 'sr2':
      return [...base, ...PARADAS_ATE_O_SR2.map((p) => p.entrega)]
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

/** Quantas palavras a fala daquele slide tem, naquela versão. */
export function palavrasFaladas(slide: SlideSR1, versao: Versao = 'completa'): number {
  return notasNaVersao(slide, versao).join(' ').split(/\s+/).filter(Boolean).length
}

/** Em que segundo da apresentação o slide de índice `indice` começa, naquela versão. */
export function inicioNaVersao(indice: number, versao: Versao): number {
  return slidesDaVersao(versao)
    .slice(0, indice)
    .reduce((soma, slide) => soma + segundosNaVersao(slide, versao), 0)
}

/** Quanto tempo cada pessoa fala, naquela versão. */
export function tempoPorIntegranteSR1(versao: Versao): ReadonlyMap<IntegranteId, number> {
  const mapa = new Map<IntegranteId, number>()
  for (const slide of slidesDaVersao(versao)) {
    mapa.set(slide.quemFala, (mapa.get(slide.quemFala) ?? 0) + segundosNaVersao(slide, versao))
  }
  return mapa
}

/** A data do SR1, do cronograma. */
export const DATA_DO_SR1 = cicloPorId('sr1').data

export { formatarTempo }
