import { formatarTempo } from '@/content/pitch'
import dados from '@/content/ml/apresentacao.json'
import resultados from '@/content/ml/resultados.json'
import { MARCOS_PARALELOS } from '@/lib/cronograma'
// Só o tipo: `lib/ml.ts` é server-only, e este arquivo também roda nos scripts.
import type { ResultadosML } from '@/lib/ml'

/**
 * A APRESENTAÇÃO DA AV1 DE MACHINE LEARNING, como dado.
 *
 * O mesmo desenho do pitch do Kick-off (`pitch.ts`): a rota `/ml` renderiza
 * estes slides, `apresentacao-ml.test.ts` conta as palavras de cada um e
 * confere que nenhum número dito no palco diverge do que os cadernos
 * imprimiram. O componente escolhe a forma do visual; as palavras vêm daqui.
 *
 * A ORDEM É A DA AVALIAÇÃO. As cinco etapas que a disciplina cobra (problema,
 * dataset, EDA, tratamento, feature engineering) aparecem na mesma sequência e
 * com o número da etapa no alto de cada slide, para quem avalia conferir item a
 * item sem procurar.
 *
 * TODO NÚMERO SAI DE UM JSON: `ml/apresentacao.json`, que o caderno 07 grava
 * repetindo as contas dos cadernos 01 e 02 (mais algumas conferências que ele
 * declara), e `ml/resultados.json`, que o caderno 06 grava. Nenhum número da
 * análise está digitado à mão aqui: se ela mudar e os cadernos rodarem de novo,
 * a tela e a fala mudam junto.
 *
 * DUAS BASES, DITAS EM VOZ ALTA. A exploração (slides 9 a 12) roda nas 196
 * unidades, como o caderno 01; do slide 14 em diante saem as seis NDI e SAE, e
 * a conta passa às 190 modeladas. O mesmo par de colunas dá números diferentes
 * nas duas, e a fala sempre diz em qual está. A revisão de 23/09 achou isso
 * escondido e é a razão de existirem os campos "sem as seis" no JSON.
 *
 * AS NOTAS SÃO PARA QUEM NÃO É DE DADOS, E CABEM NO TEMPO. `notas` é o que se
 * diz, e o teste confere que cabe nos segundos do slide a uma fala calma.
 * `perguntas` é o que se responde se a professora perguntar: não entra no
 * tempo, aparece nas notas com a tecla `n` e no roteiro impresso.
 *
 * Nenhum dado de pessoa: a menor coisa que aparece aqui é a unidade de saúde,
 * pelo tipo e pelo distrito.
 */

/* -------------------------------------------------------------------------
   Formatação: a tela fala português
------------------------------------------------------------------------- */

/** 0,79 em vez de 0.79, e o sinal de menos tipográfico em vez do hífen. */
export function decimal(valor: number, casas = 2): string {
  const texto = Math.abs(valor).toFixed(casas).replace('.', ',')
  return valor < 0 && Number(texto.replace(',', '.')) !== 0 ? `−${texto}` : texto
}

/** 0,5 e 1,89 em vez de 0,500 e 1,890: até três casas, sem zero sobrando. */
export function enxuto(valor: number, casas = 3): string {
  return decimal(valor, casas).replace(/(,\d*?)0+$/, '$1').replace(/,$/, '')
}

/** 63.440 em vez de 63440. */
export function milhar(valor: number): string {
  return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** 53,2%. */
export function porcento(parte: number, todo: number, casas = 1): string {
  return `${decimal((parte / todo) * 100, casas)}%`
}

/** "NDI e SAE", "USF, UBT e UCIS". */
function lista(itens: readonly string[]): string {
  return itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`
}

/* -------------------------------------------------------------------------
   Os números que o texto cita, tirados dos JSON uma vez só
------------------------------------------------------------------------- */

const B = dados.base
const AV1 = MARCOS_PARALELOS.find((m) => m.trilha === 'ml' && m.rotulo === 'ML: AV1')
const ENTREGA_FINAL = MARCOS_PARALELOS.find(
  (m) => m.trilha === 'ml' && m.rotulo === 'ML: entrega final',
)
if (!AV1 || !ENTREGA_FINAL) throw new Error('Marcos de ML ausentes em cronograma.ts')

/** A data da AV1, do cronograma (regra 2 da casa: data só mora lá). */
export const DATA_DA_AV1 = AV1.data
export const DATA_DA_ENTREGA_FINAL = ENTREGA_FINAL.data

function distribuicaoDe(coluna: string) {
  const achada = dados.distribuicao.find((d) => d.coluna === coluna)
  if (!achada) throw new Error(`Distribuição ausente: ${coluna}`)
  return achada
}

function correlacaoFeature(coluna: string) {
  const achada = dados.correlacao_features.find((c) => c.coluna === coluna)
  if (!achada) throw new Error(`Correlação ausente: ${coluna}`)
  return achada
}

function escalaDe(coluna: string) {
  const achada = dados.codificacao.escala.find((e) => e.coluna === coluna)
  if (!achada) throw new Error(`Escala ausente: ${coluna}`)
  return achada
}

function modelo(id: string) {
  const achado = (resultados as ResultadosML).modelos.find((m) => m.modelo === id)
  if (!achado) throw new Error(`Modelo ausente em resultados.json: ${id}`)
  return achado
}

const IND1 = distribuicaoDe('ind1')
const IND2 = distribuicaoDe('ind2')
const IND3 = distribuicaoDe('ind3')
const IND4 = distribuicaoDe('ind4')
const GERAL = distribuicaoDe('geral')
const MATRIZ = dados.correlacao.matriz
const CORR_IND3_196 = MATRIZ[2][4]
const CORR_OUTRAS_196 = [MATRIZ[0][4], MATRIZ[1][4], MATRIZ[3][4]]
const CORR_IND3_190 = correlacaoFeature('ind3').com_geral_exata

/** As seis linhas fora da regra e o que elas têm em comum. */
export const LINHAS_FORA = dados.linhas_fora_da_regra
/** A soma dos pontos dividida pelo lançado, igual nas seis (o teste confere). */
export const DIVISOR_DAS_SEIS = LINHAS_FORA[0].soma_dos_pontos_sobre_lancado
const PESO_80 = LINHAS_FORA.filter((l) => l.peso_do_ind3_nos_pontos === 0.8)
const PESO_20 = LINHAS_FORA.filter((l) => l.peso_do_ind3_nos_pontos === 0.2)
const FAMILIAS_FORA = lista(B.familias_fora_da_regra)

const OUTLIERS_GERAL = dados.outliers.find((o) => o.coluna === 'geral')
if (!OUTLIERS_GERAL) throw new Error('Outliers do geral ausentes')
const FORA_POR_FAMILIA = dados.outliers_geral_por_familia as Record<string, number>
const FORA_MAC = FORA_POR_FAMILIA.MAC ?? 0
const FORA_DAS_SEIS = B.familias_fora_da_regra.reduce((soma, f) => soma + (FORA_POR_FAMILIA[f] ?? 0), 0)
const FORA_OUTRAS = Object.keys(FORA_POR_FAMILIA).filter(
  (f) => f !== 'MAC' && !B.familias_fora_da_regra.includes(f),
)
const FORA_OUTRAS_N = FORA_OUTRAS.reduce((soma, f) => soma + FORA_POR_FAMILIA[f], 0)

const LINHAS_DS_COM_VIRGULA = (
  dados.inconsistencias.linhas_com_virgula_de_milhar as Record<string, number>
).DS
const FAMILIA_MAC = dados.por_familia.find((f) => f.grupo === 'MAC')
if (!FAMILIA_MAC) throw new Error('Família MAC ausente')
const MEDIANAS_DISTRITO = dados.por_distrito.map((d) => d.mediana)
const CONTAGENS = B.papeis
  .filter((p) => p.papel === 'Quantidade atendida' || p.papel === 'Total avaliado')
  .reduce((soma, p) => soma + p.colunas, 0)
const NOTAS_NA_ORDEM = dados.correlacao_features.filter((c) => !c.nova).map((c) => c.coluna)
const PRODUTO_34 = correlacaoFeature('ind3_x_ind4')
const IND1_CLASSE = correlacaoFeature('ind1')
const TAXA_CLASSE = correlacaoFeature('taxa_ind1')

const CLASSIFICACAO = modelo('classificacao')
const REGRESSAO = modelo('regressao')
const AGRUPAMENTO = modelo('clustering')

/* -------------------------------------------------------------------------
   Os slides
------------------------------------------------------------------------- */

/** As cinco etapas da avaliação, na ordem e com o nome que a disciplina usa. */
export const ETAPAS = {
  1: 'entendimento do problema',
  2: 'detalhamento do dataset',
  3: 'análise exploratória (EDA)',
  4: 'tratamento e pré-processamento',
  5: 'feature engineering',
} as const

export type NumeroDaEtapa = keyof typeof ETAPAS

/** O rótulo no alto de cada slide: "etapa 3 · análise exploratória (EDA)". */
export const ROTULO_DA_ETAPA = 'etapa'

export interface SlideML {
  readonly id: string
  readonly numero: number
  /** A etapa da avaliação que o slide cumpre. Capa, roteiro e fechamento não têm. */
  readonly etapa: NumeroDaEtapa | null
  /** Em minúsculas: a identidade baixa tudo. */
  readonly titulo: string
  /** A frase que acompanha o título. Uma só. */
  readonly apoio: string
  /** O que a tela mostra, em uma linha: serve a quem ensaia sem o site. */
  readonly visual: string
  readonly segundos: number
  /** O que DIZER, uma ideia por linha. Cabe nos segundos do slide. */
  readonly notas: readonly string[]
  /** O que RESPONDER se perguntarem. Fora do tempo; aparece junto das notas. */
  readonly perguntas?: readonly string[]
}

/**
 * Doze minutos e vinte e cinco segundos, medidos pela fala e não chutados.
 *
 * A primeira versão dizia 11:05 e a fala somava 2.084 palavras, uns 14 minutos
 * a um ritmo calmo. Agora o teste confere, slide a slide, que as notas cabem
 * nos segundos a 2,6 palavras por segundo (pouco mais de 150 por minuto), e o
 * total é a soma. A disciplina não fixou o tempo da AV1. Se a professora pedir
 * menos, saem primeiro o roteiro, o de inconsistências e o de insights: a fala
 * dos vizinhos já cobre o que eles dizem.
 */
export const DURACAO_ML_SEGUNDOS = 745

/** Palavras por segundo de uma fala calma, que ninguém precisa acelerar. */
export const PALAVRAS_POR_SEGUNDO = 2.6

/** O PDF de reserva, gerado por `npm run pitch-pdf -- ml` a partir da rota. */
export const ARQUIVO_PDF_ML = '/ml/pdf'

/**
 * Teto de palavras POR SLIDE, contando título, apoio e todo rótulo que o autor
 * escreveu. Não conta número, nome de coluna do dataset nem eixo de gráfico,
 * que são dado e não texto.
 *
 * É mais alto que o do Kick-off (70) de propósito: aqui a banca é técnica e
 * cobra o nome da técnica e a justificativa na tela. O que não subiu foi a
 * regra: a explicação mora na nota, não no slide.
 */
export const TETO_DE_PALAVRAS_ML = 90

const [PATAMAR_BAIXO, PATAMAR_ALTO] = GERAL.degraus
const [IND1_MEIO, IND1_TRES_QUARTOS] = IND1.degraus

export const SLIDES_ML = [
  {
    id: 'capa',
    numero: 1,
    etapa: null,
    titulo: 'prumo',
    apoio: 'a planilha da gratificação da saúde do Recife, lida com aprendizado de máquina',
    visual: 'Wordmark, a pílula da AV1 e os nomes do grupo da disciplina.',
    segundos: 25,
    notas: [
      'Somos o grupo da AV1. O trabalho parte do Prumo, o projeto que refaz a conta da gratificação por desempenho da Secretaria de Saúde do Recife.',
      'Vamos mostrar as cinco primeiras etapas, na ordem que a avaliação pede.',
      'A base é a planilha real da Secretaria, cedida com autorização e sem nenhum dado de pessoa: a menor coisa que aparece é a unidade de saúde.',
    ],
  },
  {
    id: 'roteiro',
    numero: 2,
    etapa: null,
    titulo: 'o caminho de hoje',
    apoio: 'as cinco etapas da avaliação, cada uma com os números da planilha',
    visual: 'As cinco etapas numeradas, lado a lado.',
    segundos: 10,
    notas: [
      'São cinco paradas, na ordem dos critérios da AV1: problema, dataset, exploração, tratamento e features novas.',
      'Feature é cada coluna que o modelo recebe como entrada.',
    ],
    perguntas: [
      'Se perguntarem de onde vêm os números: das contas dos cadernos 01 e 02. O caderno 07 repete essas contas para desenhar os gráficos e acrescenta algumas conferências, como o que as seis linhas fora da regra têm em comum. O caderno 07 diz quais são.',
    ],
  },
  {
    id: 'contexto',
    numero: 3,
    etapa: 1,
    titulo: 'uma planilha decide a gratificação',
    apoio:
      'cada unidade de saúde ganha nota em quatro indicadores, e o resultado geral é a soma com peso',
    visual: 'A faixa dos quatro pesos (20, 20, 20, 40), a conta escrita e a frase da Secretaria.',
    segundos: 30,
    notas: [
      'A Secretaria paga uma gratificação às equipes das unidades de saúde conforme o desempenho. A regra está na Portaria Conjunta 001 de 2024.',
      'Cada unidade recebe nota em quatro indicadores. Os três primeiros pesam 20% cada, e o desempenho da unidade pesa 40%. O resultado geral é essa soma com peso.',
      'Quando perguntamos como a conta é feita hoje, a resposta foi: é tudo manual, via PROCV e afins.',
    ],
  },
  {
    id: 'objetivo',
    numero: 4,
    etapa: 1,
    titulo: 'o que o modelo responde',
    apoio:
      'objetivo: descobrir o que separa as unidades que ficam abaixo de 90%, e quais unidades se parecem',
    visual: 'Três cartões: classificar, prever o número e agrupar, cada um com o alvo.',
    segundos: 35,
    notas: [
      'O objetivo não é substituir a conta da portaria. É mostrar o que separa as unidades que ficam abaixo de 90%, e quais se parecem.',
      'Classificar é responder sim ou não: a unidade fica abaixo de 90%? O alvo é a coluna abaixo_90. Regressão é prever o número, o resultado geral. Agrupar é juntar parecidas sem resposta certa definida antes, por isso não tem alvo.',
      `Por que 90%: quase todas as USF param em ${enxuto(PATAMAR_BAIXO.valor)} ou em ${enxuto(PATAMAR_ALTO.valor)}, e o corte de 90% separa os dois patamares.`,
    ],
    perguntas: [
      `Se perguntarem o que separa os dois patamares: na USF as outras notas são quase iguais para todas. O que leva de ${enxuto(PATAMAR_BAIXO.valor)} a ${enxuto(PATAMAR_ALTO.valor)} é o ind1 subir de ${enxuto(IND1_MEIO.valor)} para ${enxuto(IND1_TRES_QUARTOS.valor)}, que vale 0,2 vezes a diferença. O corte fica logo acima do patamar de baixo.`,
    ],
  },
  {
    id: 'uso',
    numero: 5,
    etapa: 1,
    titulo: 'para que serve a resposta',
    apoio: 'quatro usos para a gestão da Secretaria, e um limite que não se negocia',
    visual: 'Quatro cartões de uso e, embaixo, o limite.',
    segundos: 35,
    notas: [
      'Primeiro, prioridade: a gestão vê primeiro quem fica abaixo de 90% e qual indicador deixa a unidade ali.',
      'Segundo: o modelo mostra em que indicadores as unidades de fato se diferenciam. Quanto cada ponto rende, a portaria já diz.',
      `Terceiro, e esse já aconteceu antes de qualquer modelo: refazer a conta da portaria e comparar com o lançado achou ${B.fora_da_regra} linhas que seguem outra conta.`,
      'Quarto: o agrupamento compara cada unidade com as parecidas. E o limite: nada disso entra na conta da gratificação.',
    ],
    perguntas: [
      'Se perguntarem como o modelo antecipa o risco antes de fechar o mês: nesta base, não antecipa. As notas usadas são as do mês já fechado e não há coluna de data. Antecipar pediria lançamentos parciais, que a base não tem.',
    ],
  },
  {
    id: 'origem',
    numero: 6,
    etapa: 2,
    titulo: 'a planilha real, como chegou',
    apoio:
      'enviada pela Secretaria com autorização e sem nenhum dado de pessoa: uma linha por unidade de saúde, mais as dos distritos',
    visual: 'O funil de linhas: 244, 196, 190, com o motivo de cada corte, e a ficha do arquivo.',
    segundos: 35,
    notas: [
      'A origem é a planilha de desempenho da Secretaria, exportada em CSV. Entrou com autorização registrada e foi varrida atrás de CPF, e-mail e telefone antes de qualquer análise: não tem nenhum.',
      `São ${B.linhas} linhas e ${B.colunas} colunas, um retrato de um período só.`,
      `${B.linhas_distrito} linhas são dos próprios distritos, ${B.linhas_distrito_por_distrito[0]} por distrito, avaliadas com outra versão dos indicadores: saem. Sobram ${B.unidades} unidades.`,
      `As ${B.fora_da_regra} ${FAMILIAS_FORA} seguem outra conta, que o slide 14 mostra, e também saem. Ficam ${B.modeladas} para os modelos.`,
    ],
  },
  {
    id: 'colunas',
    numero: 7,
    etapa: 2,
    titulo: `${B.colunas} colunas, sete papéis`,
    apoio: 'o começo do nome diz o que a coluna guarda; os números chegam como texto, com % e vírgula',
    visual: 'Barras com as colunas de cada papel e, ao lado, os tipos antes e depois da conversão.',
    segundos: 35,
    notas: [
      'Cada coluna tem nome no padrão papel e indicador. O papel diz o que ela guarda: meta, nota, numerador, denominador, valor lançado, nota consolidada e o resultado geral.',
      `Na leitura crua o pandas acha ${B.tipos_na_leitura.texto} colunas de texto. Duas são texto de verdade, o tipo e o distrito; as outras ${dados.inconsistencias.colunas_numericas_como_texto} são número guardado com porcento e vírgula.`,
      `Depois da conversão ficam ${B.categoricas.length} categóricas nominais e ${B.numericas} numéricas. Delas, ${CONTAGENS} são contagens, então discretas, e ${dados.inconsistencias.colunas_constantes} são constantes nas unidades.`,
    ],
    perguntas: [
      'Se perguntarem pelo indicador 5: ele está na planilha, mas não entra na conta do resultado da unidade. A conta da portaria fecha só com os quatro primeiros.',
    ],
  },
  {
    id: 'tabela',
    numero: 8,
    etapa: 2,
    titulo: 'a tabela que o modelo lê',
    apoio: 'as notas dos quatro indicadores, três categóricas e dois alvos tirados do resultado geral',
    visual: 'A ficha das colunas modeladas, com o tipo de cada uma, e a barra das duas classes.',
    segundos: 35,
    notas: [
      'A tabela modelada fica com poucas colunas: o tipo de unidade, a família, que é a primeira palavra do tipo, o distrito, as quatro notas e o resultado geral.',
      'Tipo, família e distrito são categóricas nominais, sem ordem. O ind1 e o ind2 são discretos, andam por faixa; o ind3, o ind4 e o resultado são numéricos.',
      `Os alvos: o resultado geral para a regressão, e abaixo_90 para a classificação. Nas ${B.modeladas}, são ${dados.classes.noventa_ou_mais} com 90% ou mais e ${dados.classes.abaixo_de_90} abaixo, quase equilibradas.`,
    ],
    perguntas: [
      `Se perguntarem por que o caderno 01 mostra ${porcento(dados.classes_196.noventa_ou_mais, B.unidades, 0)} e ${porcento(dados.classes_196.abaixo_de_90, B.unidades, 0)}: ele conta as ${B.unidades} unidades, antes de tirar as seis ${FAMILIAS_FORA}.`,
      `Se perguntarem por que ${B.tipos_nas_modeladas} tipos e não ${B.categoricas[0].valores}: saíram DS, NDI e SAE.`,
      'Se perguntarem pela separação estratificada: treino e teste mantêm a mesma proporção das duas classes. O peso de classe dá mais importância à classe menor no treino; aqui quase não muda nada, porque as classes estão quase iguais.',
    ],
  },
  {
    id: 'distribuicao',
    numero: 9,
    etapa: 3,
    titulo: 'as notas andam em degraus',
    apoio: `cada indicador vira nota por faixa, então poucos valores se repetem muito nas ${B.unidades} unidades`,
    visual: 'Cinco histogramas, um por nota, com a assimetria e o valor mais comum.',
    segundos: 40,
    notas: [
      `Estes são os histogramas das ${B.unidades} unidades, com a assimetria embaixo: perto de zero é curva equilibrada, longe de zero a cauda puxa para um lado.`,
      `Quase nada é curva. O ind2 vale ${enxuto(IND2.degraus[0].valor)} em ${IND2.degraus[0].unidades} unidades, o ind3 vale ${enxuto(IND3.degraus[0].valor)} em ${IND3.degraus[0].unidades}, o ind4 vale ${enxuto(IND4.degraus[0].valor)} em ${IND4.degraus[0].unidades}.`,
      `O resultado se concentra em ${enxuto(PATAMAR_BAIXO.valor)} e ${enxuto(PATAMAR_ALTO.valor)}, com cauda longa à direita: assimetria de ${decimal(GERAL.assimetria)}. A cauda vem das MAC 1 e 2 e das seis ${FAMILIAS_FORA} do slide 14; sem essas seis, a assimetria cai para ${decimal(dados.assimetria_geral_modeladas)}.`,
    ],
    perguntas: [
      `Se perguntarem por que o ind3 passa de 1: é o valor que a planilha lança, ${enxuto(IND3.degraus[0].valor * 100)}% ou ${enxuto(IND3.degraus[1].valor * 100)}%. Os cadernos usam como vem, com a meta em 1.`,
    ],
  },
  {
    id: 'grupos',
    numero: 10,
    etapa: 3,
    titulo: 'o tipo separa, o distrito não',
    apoio: 'resultado geral por família de unidade e por distrito sanitário, com a linha dos 90%',
    visual: 'Dois conjuntos de caixas (boxplot), família e distrito, na mesma escala, com o corte de 90%.',
    segundos: 45,
    notas: [
      'Cada linha é um grupo. A caixa vai do primeiro ao terceiro quartil e o traço é a mediana. O tamanho da caixa se chama IQR; os pontos soltos estão a mais de uma vez e meia esse tamanho para fora da caixa. A linha laranja é o corte de 90%.',
      `Por família, as caixas mudam de lugar: a MAC vai de ${decimal(Math.min(FAMILIA_MAC.bigode_baixo, ...FAMILIA_MAC.fora))} a ${decimal(Math.max(FAMILIA_MAC.bigode_alto, ...FAMILIA_MAC.fora))}. ${FAMILIAS_FORA}, com asterisco, são as seis linhas do slide 14.`,
      `Por distrito, as medianas ficam todas entre ${enxuto(Math.min(...MEDIANAS_DISTRITO))} e ${enxuto(Math.max(...MEDIANAS_DISTRITO))}. As caixas do I e do III se esticam para cima por causa das MAC. O tipo explica o resultado; o distrito, quase nada.`,
    ],
  },
  {
    id: 'correlacao',
    numero: 11,
    etapa: 3,
    titulo: 'o ind3 anda junto com o resultado',
    apoio: `correlação entre as notas nas ${B.unidades} unidades, e as colunas cruas mais ligadas ao resultado geral`,
    visual: 'O mapa de calor 5 por 5 das notas e as barras das colunas cruas, com o valor sem as seis ao lado.',
    segundos: 50,
    notas: [
      'Correlação vai de menos 1 a 1: perto de 1 as duas sobem juntas, perto de menos 1 uma sobe quando a outra desce, perto de zero não há relação em linha reta.',
      `O ind3, satisfação do usuário, tem ${decimal(CORR_IND3_196)} com o resultado; os outros três ficam entre ${decimal(Math.min(...CORR_OUTRAS_196))} e ${decimal(Math.max(...CORR_OUTRAS_196))}. Entre si as notas quase não se correlacionam: nenhuma repete a outra.`,
      `À direita, as colunas cruas mais ligadas ao resultado, e na última coluna o mesmo número sem as seis ${FAMILIAS_FORA}. Os blocos do ind4 e o indicador 5 só aparecem por causa delas: sem elas, caem para perto de zero.`,
      `As features novas partem das notas que lideram sem as seis: ${lista(NOTAS_NA_ORDEM.slice(0, 3))}.`,
    ],
    perguntas: [
      'Se perguntarem pelos pontos do ind3 no topo: são a nota vezes 0,2, e repetem uma coluna que já está na tabela. Ficam acima da nota só por causa das cinco linhas com peso 80%.',
      `Se perguntarem por que o ind3 pesa tanto se o ind4 tem 40%: é a nota que mais varia. Nas ${B.modeladas}, 0,2 vezes um desvio de ${decimal(escalaDe('ind3').desvio)} pesa mais que 0,4 vezes o desvio de ${decimal(escalaDe('ind4').desvio)} do ind4.`,
    ],
  },
  {
    id: 'faltantes',
    numero: 12,
    etapa: 3,
    titulo: 'nada falta, e quase todo outlier é tipo',
    apoio: `0% de ausentes nas ${milhar(B.celulas)} células; o IQR marca sobretudo os tipos que pontuam diferente`,
    visual: 'O mapa de ausentes inteiro limpo e as barras de outliers por nota, com a divisão por família.',
    segundos: 40,
    notas: [
      `Nenhuma célula vazia: zero ausentes nas ${milhar(B.celulas)} células, 0% em cada coluna, antes e depois de converter texto em número.`,
      'A regra do IQR, a do slide anterior, marca muita gente porque as notas andam em degraus. No ind2 e no ind3 quase todas têm o mesmo valor, o IQR dá zero, e qualquer valor diferente vira outlier.',
      `No resultado geral são ${OUTLIERS_GERAL.unidades}: ${FORA_MAC} MAC, que pontuam de outro jeito e ficam; as ${FORA_DAS_SEIS} ${FAMILIAS_FORA} do slide 14, que saem; e ${FORA_OUTRAS_N} ${lista(FORA_OUTRAS)} com nota real, que ficam.`,
    ],
    perguntas: [
      'Se perguntarem por que não tirar os outliers: são tipos de unidade reais, não erro de medida. Nas features a árvore não se incomoda com eles; no alvo da regressão, que usa erro ao quadrado, o erro das MAC vai ser olhado à parte.',
    ],
  },
  {
    id: 'inconsistencias',
    numero: 13,
    etapa: 3,
    titulo: 'o que o olho não pega',
    apoio: 'problemas da planilha que a conversão precisou resolver antes de qualquer conta',
    visual: 'Seis cartões, cada um com o tamanho do problema em número grande.',
    segundos: 40,
    notas: [
      `A planilha foi feita para gente ler. ${dados.inconsistencias.colunas_numericas_como_texto} colunas de número chegam como texto, por causa do porcento e da vírgula.`,
      `Em ${dados.inconsistencias.colunas_fracao_e_percentual} delas o porcento aparece em umas linhas e não em outras. Na maioria é a linha de distrito escrevendo contagem como porcentagem; só em ${dados.inconsistencias.mistura_dentro_das_unidades} a mistura acontece dentro das unidades. Entre elas, ${dados.inconsistencias.metas_escritas_de_dois_jeitos.length} metas escritas de dois jeitos, como 20 e 2000%.`,
      `As quatro últimas colunas são os pontos, a nota vezes o peso. ${dados.inconsistencias.pontos_com_nome_repetido} repetem o nome da nota; o ind4 só vem assim, e é dividido por 0,4 para virar nota.`,
    ],
  },
  {
    id: 'fora-da-regra',
    numero: 14,
    etapa: 3,
    titulo: 'seis linhas seguem outra conta',
    apoio:
      'cada ponto é uma unidade: o resultado que os pesos da portaria dão, contra o que a planilha lançou',
    visual: 'A dispersão esperado contra lançado, com a diagonal, e a tabela das seis unidades fora dela.',
    segundos: 50,
    notas: [
      `Pela portaria, o resultado é 0,2 vezes cada um dos três primeiros indicadores mais 0,4 vezes o quarto. Refizemos a conta nas ${B.unidades} unidades.`,
      `${B.modeladas} caem em cima da diagonal: a conta fecha. ${B.fora_da_regra} não, em laranja, e são todas as ${FAMILIAS_FORA} da base.`,
      `Nas seis, o lançado é a soma dos pontos dividida por ${enxuto(DIVISOR_DAS_SEIS, 1)}, sempre. Em ${PESO_80.length} delas o ind3 entra nos pontos com peso 80% em vez de 20%; ${lista(PESO_20.map((l) => `na ${l.tipo} do distrito ${l.distrito}`))}, com 20%.`,
      'É um padrão, não um erro solto: ou essas unidades têm regra própria que não achamos na portaria, ou é erro. Isso vai para a Secretaria. Até lá, saem da modelagem.',
    ],
  },
  {
    id: 'insights',
    numero: 15,
    etapa: 3,
    titulo: 'o que a exploração ensinou',
    apoio: 'seis achados e o que cada um mudou depois',
    visual: 'Seis cartões numerados: o achado e a consequência.',
    segundos: 15,
    notas: [
      'Em resumo, seis achados, e cada um virou uma decisão.',
      'O mais forte é o quinto: a exploração achou sozinha seis linhas que seguem outra conta, e isso virou pergunta para a Secretaria.',
    ],
  },
  {
    id: 'tratamento',
    numero: 16,
    etapa: 4,
    titulo: 'cada problema, uma decisão',
    apoio: 'o que a planilha recebeu antes de qualquer modelo, e por quê',
    visual: 'Uma tabela de três colunas: problema, decisão e justificativa.',
    segundos: 30,
    notas: [
      'Primeiro, o tipo de dado: uma função tira o porcento e a vírgula de milhar e divide por 100 quando tinha porcento. As colunas viram número e nenhum ausente aparece.',
      'Ausentes: nenhum. O caderno deixa a mediana do tipo de unidade como rede, para uma planilha futura com buraco. Duplicados: nenhuma linha repetida.',
      `Os outliers que são tipo real ficam. Saem as ${B.linhas_distrito} linhas de distrito e as ${B.fora_da_regra} ${FAMILIAS_FORA}. Resultado: ${B.modeladas} unidades.`,
    ],
    perguntas: [
      'Se perguntarem pelas colunas de nome repetido: são os pontos, e serviram de conferência. Pontos divididos pela nota dão 0,2 no indicador 1, que é o peso da portaria.',
    ],
  },
  {
    id: 'codificacao',
    numero: 17,
    etapa: 4,
    titulo: 'como a categoria vira número',
    apoio: 'one-hot onde não há ordem, código onde a árvore dá conta, número onde a ordem é real',
    visual: 'Três cartões de encoding, a padronização e as caixas das MAC por nível.',
    segundos: 50,
    notas: [
      'Família e distrito viram one-hot: uma coluna de 0 e 1 para cada valor. O distrito vem em algarismo romano, mas o I não é menor que o II; label encoding inventaria essa ordem.',
      `O tipo tem ${dados.codificacao.label_encoding.valores} valores nas ${B.modeladas} unidades. Label encoding guarda tudo numa coluna e serve porque os modelos são de árvore, que decidem por perguntas em sequência e não leem o código como distância.`,
      'O número do tipo é ordinal dentro da família. O gráfico mostra: as MAC 1 e 2 ficam todas acima de 1; as MAC 3 e 4, todas abaixo do corte de 90%.',
      'Padronização só no K-Means, que junta as unidades mais próximas e por isso mede distância.',
    ],
    perguntas: [
      `Se perguntarem por que o tipo pode ter código e o distrito não: com ${dados.codificacao.one_hot[1].valores} valores o one-hot sai barato; com ${dados.codificacao.label_encoding.valores}, muitos com uma unidade só, ele gera colunas quase vazias. A árvore separa o código em faixas, então a ordem falsa custa alguns cortes a mais, não um erro.`,
      'Se perguntarem pelo nível 0: é o marcador dos tipos sem número, como CAPS e UBT. O nível só tem ordem dentro da família, e a família em one-hot deixa a árvore separar esses casos.',
      'Se perguntarem pela padronização num modelo supervisionado: a escala seria ajustada só no treino, para a média do teste não vazar.',
    ],
  },
  {
    id: 'features',
    numero: 18,
    etapa: 5,
    titulo: 'seis features novas',
    apoio: 'todas partem das notas mais ligadas ao resultado; nenhuma usa a coluna do resultado geral',
    visual: 'Ficha das seis features: como se calcula, por quê, a distribuição e a assimetria.',
    segundos: 60,
    notas: [
      `As features novas partem das notas que lideram sem as seis linhas, ${lista(NOTAS_NA_ORDEM.slice(0, 3))}, e dos lançamentos por trás delas.`,
      'A taxa do ind1 é a versão contínua dele: a nota só vale 0, 0,5 ou 0,75, e a taxa mostra quão perto a unidade está de mudar de degrau.',
      'O produto do ind3 pelo ind4 marca quem vai bem nas duas. O ind3 abaixo da meta é o que derruba as MAC 3 e 4.',
      'A feature indicadores na meta conta quantas notas chegam a 100%; o desvio mede quão desigual a unidade é; e a média dos blocos do ind4 enxerga variação que a nota final esconde, porque o ind4 da USF é sempre 0,8.',
      'Nenhuma usa a coluna do resultado. Mas o resultado é a soma das notas, então o modelo vai reaprender a regra, e o último slide assume isso.',
    ],
    perguntas: [
      'Se perguntarem se o ind3 abaixo da meta repete o tipo: sim, nesta base ela coincide com ser MAC 3 ou 4. Fica porque é barata para a árvore, e sai se atrapalhar.',
      'Se perguntarem pelo desvio: o ind3 está em outra escala, então na prática o desvio repete o ind3. Para a entrega final, a ideia é calcular o desvio sobre as notas divididas pela meta.',
    ],
  },
  {
    id: 'eda-features',
    numero: 19,
    etapa: 5,
    titulo: 'o que as features novas acrescentam',
    apoio: `nas ${B.modeladas} modeladas, a correlação de cada coluna com o resultado geral e com a classe abaixo de 90%`,
    visual: 'Barras divergentes das dez colunas nos dois alvos, a redundância e as três descartadas.',
    segundos: 50,
    notas: [
      `Agora nas ${B.modeladas} modeladas, sem as seis linhas. Por isso o ind3 aparece com ${decimal(CORR_IND3_190)}, e não ${decimal(CORR_IND3_196)} como no slide 11.`,
      `O produto ind3 por ind4 é a coluna mais ligada ao resultado, ${decimal(PRODUTO_34.com_geral_exata)}. Para a classe, a taxa do ind1 fica logo atrás do ind1: ${decimal(TAXA_CLASSE.com_abaixo_de_90_exata)} contra ${decimal(IND1_CLASSE.com_abaixo_de_90_exata)}. Negativo aqui é bom: quanto maior, menor a chance de ficar abaixo.`,
      'Redundância: desvio e produto andam quase juntos com o ind3. Para prever, a árvore aguenta; para ler a importância, ela se divide entre as parecidas.',
      'Três candidatas saíram: o log do ind4, que quase não muda a assimetria; o subindicador 2.3, do qual o ind2 é função direta; e o porte, sem relação linear com o resultado.',
    ],
  },
  {
    id: 'fechamento',
    numero: 20,
    etapa: null,
    titulo: 'o que levar daqui',
    apoio: 'três destaques, o que vem depois e onde está cada entrega',
    visual: 'Três destaques, os próximos passos, onde ler cada entrega e perguntas.',
    segundos: 35,
    notas: [
      'Três coisas para levar. Primeira: a exploração achou sozinha seis linhas que seguem outra conta, e isso virou pergunta para a Secretaria.',
      'Segunda: como o resultado é soma das notas, qualquer modelo vai aprender a regra e ter métrica alta. A gente diz isso, em vez de vender previsão.',
      'Terceira: o ind3 é o que mais varia no resultado geral, e o ind1 é o que mais separa quem fica abaixo de 90%. Os próximos passos já estão nos cadernos 3 a 6.',
    ],
    perguntas: [
      `Se perguntarem pelos resultados: a classificação acerta as ${CLASSIFICACAO.metricas.amostras_teste} unidades do teste, F1 de ${enxuto(CLASSIFICACAO.metricas.f1 ?? 0, 2)}, contra ${porcento(CLASSIFICACAO.referencia.acuracia ?? 0, 1, 0)} de acerto de quem chuta sempre a classe maior. A regressão erra em média ${enxuto(REGRESSAO.metricas.mae ?? 0, 3)}, contra ${enxuto(REGRESSAO.referencia.mae ?? 0, 2)} de prever a média. O K-Means acha ${AGRUPAMENTO.metricas.k} grupos, com silhueta de ${enxuto(AGRUPAMENTO.metricas.silhueta ?? 0, 2)}.`,
      `Se perguntarem o que o modelo diz que mais pesa: na classificação, o desvio entre os indicadores vem primeiro e o ind1 em segundo; nas USF o desvio só muda quando o ind1 muda, então contam a mesma história. Na regressão, o ind3 pesa ${porcento(REGRESSAO.metricas.importancias?.[0]?.peso ?? 0, 1, 0)}.`,
      'Se perguntarem por que F1: o erro que importa é deixar passar uma unidade abaixo de 90%, e o F1 junta precisão e recall dessa classe. Com as classes quase equilibradas, acurácia e F1 contam a mesma história, e os cadernos mostram as duas.',
      'Se perguntarem se tirar as seis é esconder dado: não. Elas estão documentadas e viraram achado; só não ensinam o modelo porque seguem outra conta.',
      'Se perguntarem se a métrica alta é vazamento: nenhuma feature usa a coluna do resultado, mas o resultado é feito das notas. Por isso o objetivo é explicar o que separa as unidades, não prever.',
    ],
  },
] as const satisfies readonly SlideML[]

export type SlideMLId = (typeof SLIDES_ML)[number]['id']

/* -------------------------------------------------------------------------
   O TEXTO DE CADA VISUAL

   Curto de propósito. O que explica mora nas `notas` do slide.
------------------------------------------------------------------------- */

/** Capa: o grupo da DISCIPLINA, que não é o mesmo da equipe do projeto. */
export const PILULA_DA_CAPA = 'av1 · machine learning'

/**
 * Quem assina a AV1, na ordem da capa que o grupo mandou para a professora.
 *
 * NÃO É `EQUIPE`: o grupo de machine learning junta a equipe do Prumo com
 * colegas de fora dela, e inventar a lista a partir de `equipe.ts` tiraria
 * gente que fez o trabalho. Nomes de quem assina, nunca de quem aparece nos
 * dados: os dados não têm pessoa nenhuma.
 */
export const GRUPO_DA_DISCIPLINA = [
  'João Pedro Mamede Dias',
  'João Henrique Micucci',
  'Matheus Lustosa',
  'Rafael Serpa',
  'Fernando Fernandez',
  'Gabriel Tenório',
  'Cláudio Alves',
  'Kerry Muniz',
  'Guilherme Cardozo',
] as const

/** Slide 2: as cinco paradas, com o nome curto que a fala usa. */
export const ROTEIRO_ML = [
  'o problema',
  'o dataset',
  'a exploração (EDA)',
  'o tratamento',
  'as features novas',
] as const

/** Slide 3: os quatro indicadores da portaria, com o peso de cada um. */
export const INDICADORES_ML = [
  { id: 'ind1', nome: 'medicamentos e material', peso: 20 },
  { id: 'ind2', nome: 'gestão do trabalho', peso: 20 },
  { id: 'ind3', nome: 'satisfação do usuário', peso: 20 },
  { id: 'ind4', nome: 'desempenho da unidade', peso: 40 },
] as const

export const FORMULA_DO_RESULTADO =
  'resultado geral = 0,2 × ind1 + 0,2 × ind2 + 0,2 × ind3 + 0,4 × ind4'

export const CITACAO_DA_SECRETARIA = {
  frase: 'é tudo manual, via procv e afins',
  fonte: 'a secretaria, sobre como a conta é feita hoje',
} as const

/** Slide 4: as três tarefas, cada uma com o alvo. */
export const TAREFAS_ML = [
  {
    tarefa: 'classificar',
    pergunta: 'a unidade fica abaixo de 90%?',
    alvo: 'abaixo_90',
    tipoDoAlvo: 'binário: 1 ou 0',
  },
  {
    tarefa: 'prever o número (regressão)',
    pergunta: 'que resultado geral esperar?',
    alvo: 'geral',
    tipoDoAlvo: 'contínuo',
  },
  {
    tarefa: 'agrupar',
    pergunta: 'quais unidades se parecem?',
    alvo: 'sem alvo',
    tipoDoAlvo: 'não supervisionado',
  },
] as const

export const ROTULO_DO_ALVO = 'alvo (target)'

/** Slide 5: os usos e o limite. */
export const USOS_ML = [
  { titulo: 'priorizar', texto: 'ver primeiro quem fica abaixo de 90%, e por quê' },
  { titulo: 'mostrar o que separa', texto: 'em que indicadores as unidades se diferenciam' },
  { titulo: 'achar conta que não fecha', texto: 'o que a regra espera contra o que foi lançado' },
  { titulo: 'comparar parecidos', texto: 'cada unidade contra as do mesmo grupo' },
] as const

export const LIMITE_ML =
  'nenhum resultado do modelo entra no cálculo da gratificação, e o agrupamento é de unidades, nunca de pessoas'

/** Slide 6: o funil de linhas e a ficha da origem. */
export const FUNIL_ML = [
  { numero: B.linhas, rotulo: 'linhas na planilha', motivo: `${B.colunas} colunas cada` },
  {
    numero: B.unidades,
    rotulo: 'unidades de saúde',
    motivo: `saem ${B.linhas_distrito} linhas de distrito (DS), ${B.linhas_distrito_por_distrito[0]} por distrito`,
  },
  {
    numero: B.modeladas,
    rotulo: 'unidades modeladas',
    motivo: `saem as ${B.fora_da_regra} ${FAMILIAS_FORA}, que seguem outra conta`,
  },
] as const

export const FICHA_DA_ORIGEM = [
  { rotulo: 'arquivo', valor: 'ml/data/base nova completa.csv' },
  { rotulo: 'codificação', valor: 'cp1252' },
  { rotulo: 'período', valor: 'um retrato só, sem coluna de data' },
  { rotulo: 'autorização', valor: 'da Secretaria, registrada na ADR-044' },
  { rotulo: 'dado de pessoa', valor: 'nenhum: sem nome, CPF ou matrícula' },
] as const

/** Slide 7: o que cada papel de coluna guarda. A chave é o começo do nome. */
export const PAPEIS_DAS_COLUNAS: Readonly<Record<string, string>> = {
  Meta: 'meta da portaria',
  Desempenho: 'nota do subindicador',
  'Quantidade atendida': 'numerador, contagem',
  'Total avaliado': 'denominador, contagem',
  'Valor informado': 'valor lançado',
  'Desempenho consolidado': 'nota do indicador ou bloco',
  'Desempenho geral': 'resultado final: o alvo',
}

export const ROTULOS_DOS_TIPOS = {
  leitura: 'na leitura crua',
  depois: 'depois da conversão',
  texto: 'texto',
  inteiro: 'inteiro',
  decimal: 'decimal',
  categoricas: 'categóricas nominais',
  numericas: 'numéricas',
  contagens: `delas, ${CONTAGENS} contagens: discretas`,
} as const

/** Slide 8: a ficha das colunas modeladas. */
export const COLUNAS_MODELADAS = [
  {
    coluna: 'tipo',
    tipo: 'categórica nominal',
    papel: `${B.tipos_nas_modeladas} tipos nas ${B.modeladas} unidades`,
  },
  { coluna: 'familia', tipo: 'categórica nominal', papel: B.familias_nas_modeladas.join(', ') },
  { coluna: 'distrito', tipo: 'categórica nominal', papel: 'de I a VIII' },
  { coluna: 'ind1 e ind2', tipo: 'numérica discreta', papel: 'nota por faixa' },
  { coluna: 'ind3 e ind4', tipo: 'numérica', papel: 'nota do indicador' },
  { coluna: 'geral', tipo: 'numérica contínua', papel: 'alvo da regressão', alvo: true },
  { coluna: 'abaixo_90', tipo: 'binária', papel: 'alvo da classificação', alvo: true },
] as const

export const ROTULOS_DAS_CLASSES = {
  titulo: `classes nas ${B.modeladas} modeladas`,
  noventaOuMais: '90% ou mais',
  abaixo: 'abaixo de 90%',
  nota: 'quase equilibradas: mesmo assim, separação estratificada e F1',
} as const

/** Slide 9: o nome curto de cada nota, embaixo do histograma. */
export const NOMES_DAS_NOTAS: Readonly<Record<string, string>> = {
  ind1: 'medicamentos',
  ind2: 'gestão do trabalho',
  ind3: 'satisfação',
  ind4: 'desempenho',
  geral: 'resultado geral',
}

export const ROTULOS_DA_DISTRIBUICAO = {
  assimetria: 'assimetria',
  maisComum: 'mais comum',
  unidades: 'unidades',
} as const

/** Slides 10 e 17: as caixas. */
export const ROTULOS_DOS_GRUPOS = {
  familia: 'por família de unidade',
  distrito: 'por distrito sanitário',
  corte: '0,90',
  n: 'n',
  asterisco: `* só as ${B.fora_da_regra} linhas que seguem outra conta, slide 14`,
} as const

/** Cabeçalhos da tabela que o leitor de tela lê no lugar do desenho das caixas. */
export const ROTULOS_DAS_CAIXAS = {
  grupo: 'grupo',
  n: 'unidades',
  q1: 'primeiro quartil',
  mediana: 'mediana',
  q3: 'terceiro quartil',
  baixo: 'menor sem outlier',
  alto: 'maior sem outlier',
  fora: 'outliers',
} as const

/** Slide 11. */
export const ROTULOS_DA_CORRELACAO = {
  matriz: `entre as notas, nas ${B.unidades}`,
  colunas: 'colunas cruas mais ligadas ao resultado',
  escala: 'de −1 a 1',
  todas: `nas ${B.unidades}`,
  semAsSeis: 'sem as seis',
  constante: 'constante',
} as const

/**
 * O nome de uma coluna crua da planilha, curto e sem o travessão do original
 * (regra 8 da casa: o dado tem, a tela não). As quatro últimas colunas guardam
 * PONTOS (nota vezes peso): três repetem o nome da nota com `.1`, e
 * `Indicador 4` só existe nessa forma, por isso ele também é ponto.
 */
export function rotuloDaColuna(nome: string): string {
  const [papel, alvo = ''] = nome.split(' — ')
  const indicador = alvo.match(/^Indicador (\d)(\.1)?$/)
  if (indicador) {
    const pontos = indicador[2] === '.1' || indicador[1] === '4'
    return `${pontos ? 'pontos' : 'nota'} do ind${indicador[1]}`
  }
  const sub = alvo.replace(/^Subindicador /, '')
  if (papel === 'Desempenho consolidado') return `bloco ${sub}`
  if (papel === 'Desempenho') return `nota ${sub}`
  return `${papel.toLowerCase()} ${sub}`
}

/**
 * Onde cada eixo começa e termina. Moram aqui, e não no componente, para o
 * teste conferir que todo valor do JSON cabe neles: se o caderno rodar com dado
 * novo e um ponto passar de 2, ele sairia da caixa em silêncio.
 */
export const DOMINIOS = {
  grupos: { de: 0.6, ate: 2 },
  dispersao: { de: 0.6, ate: 2 },
  nivelMac: { de: 0.6, ate: 1.35 },
} as const

/** Quantas colunas cruas o slide 11 mostra. */
export const COLUNAS_CRUAS_NO_SLIDE = 8

/** Slide 12. */
export const ROTULOS_DOS_FALTANTES = {
  mapa: 'mapa de ausentes',
  dimensoes: `${B.colunas} colunas × ${B.linhas} linhas`,
  ausentes: 'células ausentes',
  porColuna: `0% em cada uma das ${B.colunas} colunas`,
  outliers: 'fora do IQR, por nota',
  divisao: `no resultado geral: ${FORA_MAC} MAC, ${FORA_DAS_SEIS} ${FAMILIAS_FORA}, ${FORA_OUTRAS_N} outras`,
} as const

/** Slide 13: os seis problemas, cada um com o tamanho em número. */
export const INCONSISTENCIAS_ML = [
  {
    numero: dados.inconsistencias.colunas_numericas_como_texto,
    texto: 'colunas de número guardadas como texto, com % e vírgula',
  },
  {
    numero: dados.inconsistencias.colunas_fracao_e_percentual,
    texto: `com % em umas linhas e não em outras; só ${dados.inconsistencias.mistura_dentro_das_unidades} dentro das unidades`,
  },
  {
    numero: dados.inconsistencias.metas_escritas_de_dois_jeitos.length,
    texto: 'delas são metas escritas de dois jeitos, como 20 e 2000%',
  },
  {
    numero: dados.inconsistencias.celulas_com_virgula_de_milhar,
    texto: `células com vírgula de milhar, em ${LINHAS_DS_COM_VIRGULA} linhas de distrito`,
  },
  {
    numero: dados.inconsistencias.colunas_constantes,
    texto: 'colunas que não variam entre as unidades',
  },
  {
    numero: dados.inconsistencias.colunas_de_pontos,
    texto: `colunas de pontos no fim, nota vezes peso; ${dados.inconsistencias.pontos_com_nome_repetido} repetem o nome da nota`,
  },
] as const

/** Slide 14. */
export const ROTULOS_DA_DISPERSAO = {
  eixoX: 'esperado pela portaria',
  eixoY: 'lançado na planilha',
  diagonal: 'na diagonal, a conta fecha',
  unidade: 'unidade',
  esperado: 'esperado',
  lancado: 'lançado',
  pesoDoInd3: 'ind3 nos pontos',
  divisor: `nas seis: soma dos pontos ÷ ${enxuto(DIVISOR_DAS_SEIS, 1)} = lançado`,
  resumo: `${B.unidades} unidades: ${B.modeladas} na diagonal e ${B.fora_da_regra} fora dela, todas ${FAMILIAS_FORA}`,
} as const

/** Slide 15: os seis achados e o que cada um mudou. */
export const INSIGHTS_EDA = [
  { achado: 'o tipo explica o resultado; o distrito, quase nada', efeito: 'tipo vira código e nível' },
  { achado: 'o ind3 é a nota mais ligada ao resultado', efeito: 'as features partem dele' },
  { achado: 'as notas andam em degraus', efeito: 'o IQR exagera; tipo real fica' },
  { achado: 'nada ausente, mas quase tudo chega como texto', efeito: 'converter antes de tudo' },
  { achado: `${FAMILIAS_FORA} seguem outra conta`, efeito: 'saem, e viram pergunta à Secretaria' },
  { achado: 'classes quase equilibradas', efeito: 'estratificar e medir com F1' },
] as const

/** Slide 16: problema, decisão e porquê. */
export const COLUNAS_DO_TRATAMENTO = ['problema', 'decisão', 'por quê'] as const

export const DECISOES_DO_TRATAMENTO = [
  {
    problema: 'número guardado como texto',
    decisao: 'converter, tirando % e vírgula',
    porque: `${B.numericas} colunas viram número`,
  },
  {
    problema: 'valores ausentes',
    decisao: 'nada a preencher; mediana do tipo como rede',
    porque: `${dados.faltantes.na_leitura} antes, ${dados.faltantes.depois_da_conversao} depois`,
  },
  { problema: 'linhas duplicadas', decisao: 'procurar e remover', porque: 'nenhuma: uma linha por unidade' },
  { problema: 'ind4 vezes o peso', decisao: 'dividir por 0,4', porque: 'volta a ser nota' },
  { problema: 'outliers do IQR', decisao: 'manter', porque: 'tipos e notas reais, não erro' },
  {
    problema: `distrito, ${FAMILIAS_FORA}`,
    decisao: `remover ${B.linhas_distrito} + ${B.fora_da_regra}`,
    porque: 'outra avaliação; outra conta',
  },
] as const

/** Slide 17. */
export const CODIFICACOES = [
  {
    coluna: 'família e distrito',
    tecnica: 'one-hot',
    porque: `${dados.codificacao.one_hot[0].valores} + ${dados.codificacao.one_hot[1].valores} colunas de 0 e 1: o distrito I não é menor que o II`,
  },
  {
    coluna: 'tipo de unidade',
    tecnica: 'label encoding',
    porque: `${dados.codificacao.label_encoding.valores} valores numa coluna; árvore não lê código como distância`,
  },
  { coluna: 'nível do tipo', tecnica: 'ordinal', porque: 'USF 1 a 8 e MAC 1 a 4: ordem dentro da família' },
] as const

export const PADRONIZACAO = {
  titulo: 'padronização',
  texto: 'StandardScaler só no K-Means, que mede distância',
} as const

export const ROTULOS_DA_CODIFICACAO = {
  nivelMac: 'MAC por nível',
  resultado: `${dados.codificacao.linhas} linhas × ${dados.codificacao.colunas_finais} colunas no fim`,
} as const

/** Slide 18: as seis features, na ordem do caderno 02. */
export const FEATURES_NOVAS = [
  { coluna: 'taxa_ind1', como: 'atendidos ÷ avaliados', porque: 'a versão contínua do ind1, que anda em degrau' },
  { coluna: 'ind3_x_ind4', como: 'ind3 × ind4', porque: 'quem vai bem nas duas notas mais fortes' },
  { coluna: 'ind3_abaixo_meta', como: '1 se ind3 < 1', porque: 'o que derruba MAC 3 e 4' },
  { coluna: 'indicadores_na_meta', como: 'quantas notas ≥ 1', porque: 'quantos indicadores batem 100%' },
  { coluna: 'desvio_indicadores', como: 'desvio das 4 notas', porque: 'quão desigual a unidade é' },
  { coluna: 'media_blocos_ind4', como: 'média de 8 blocos', porque: 'a variação que a nota do ind4 esconde' },
] as const

export const COLUNAS_DAS_FEATURES = ['feature', 'como', 'por quê', 'distribuição'] as const

/** Slide 19. */
export const ROTULOS_DA_EDA_DAS_FEATURES = {
  comGeral: 'com o resultado geral',
  comAbaixo: 'com abaixo de 90%',
  nova: 'nova',
  redundancia: 'redundância',
  redundanciaNota: 'para prever, a árvore aguenta; para ler a importância, ela se divide',
  descartadas: 'testadas e descartadas',
} as const

/** As duas barras que a fala do slide 19 aponta, e que por isso levam o acento. */
export const DESTAQUES_DA_EDA_DAS_FEATURES = {
  comGeral: 'ind3_x_ind4',
  comAbaixo: 'taxa_ind1',
} as const

export const DESCARTADAS = [
  {
    nome: 'log do ind4',
    porque: `a assimetria quase não muda: ${decimal(dados.descartadas.assimetria_ind4)} para ${decimal(dados.descartadas.assimetria_log_ind4)}`,
  },
  { nome: 'subindicador 2.3', porque: 'o ind2 é função direta dele' },
  {
    nome: 'porte da unidade',
    porque: `quase nenhuma relação linear: ${decimal(dados.descartadas.correlacao_porte_geral, 3)}`,
  },
] as const

/** Slide 20. */
export const DESTAQUES_ML = [
  {
    // Sem sigla no título: a identidade baixa tudo, e "ndi e sae" não se lê.
    titulo: 'seis linhas seguem outra conta',
    texto: `todas as ${FAMILIAS_FORA}, fora dos pesos da portaria`,
  },
  { titulo: 'o modelo vai aprender a regra', texto: 'o resultado é soma das notas: métrica alta não é mérito' },
  { titulo: 'ind3 e ind1 é que variam', texto: 'um explica o resultado, o outro separa quem fica abaixo' },
] as const

export const PROXIMOS_PASSOS =
  'próximo: XGBoost, LightGBM, CatBoost e stacking para classificar, XGBoost para a regressão e K-Means para agrupar'

export const ROTULO_DA_ENTREGA_FINAL = 'entrega final'

export const ONDE_ESTA_CADA_ENTREGA = [
  { oQue: 'documento das etapas 1 e 2', onde: 'ml/documento-problema-e-dados.md' },
  { oQue: 'cadernos das etapas 2 a 5', onde: 'ml/notebooks, 01 e 02' },
] as const

export const PERGUNTAS = 'perguntas?'

/** O rótulo da lista de respostas preparadas, nas notas do apresentador. */
export const ROTULO_SE_PERGUNTAREM = 'se perguntarem'

/* -------------------------------------------------------------------------
   O que conta como texto de tela
------------------------------------------------------------------------- */

/**
 * Todo texto que o autor põe na tela, por slide. Número e nome de coluna do
 * dataset ficam de fora: são dado, e o teto de palavras é sobre prosa.
 */
export function textoNaTela(id: SlideMLId): readonly string[] {
  const slide = SLIDES_ML.find((s) => s.id === id)
  if (!slide) throw new Error(`Slide desconhecido: ${id}`)
  const base = [
    slide.titulo,
    slide.apoio,
    ...(slide.etapa ? [ROTULO_DA_ETAPA, ETAPAS[slide.etapa]] : []),
  ]

  switch (id) {
    case 'capa':
      return [slide.apoio, PILULA_DA_CAPA]
    case 'roteiro':
      return [...base, ...ROTEIRO_ML]
    case 'contexto':
      return [
        ...base,
        ...INDICADORES_ML.map((i) => i.nome),
        FORMULA_DO_RESULTADO,
        CITACAO_DA_SECRETARIA.frase,
        CITACAO_DA_SECRETARIA.fonte,
      ]
    case 'objetivo':
      return [
        ...base,
        ROTULO_DO_ALVO,
        ...TAREFAS_ML.flatMap((t) => [t.tarefa, t.pergunta, t.tipoDoAlvo]),
      ]
    case 'uso':
      return [...base, ...USOS_ML.flatMap((u) => [u.titulo, u.texto]), LIMITE_ML]
    case 'origem':
      return [
        ...base,
        ...FUNIL_ML.flatMap((f) => [f.rotulo, f.motivo]),
        ...FICHA_DA_ORIGEM.map((f) => f.rotulo),
      ]
    case 'colunas':
      return [...base, ...Object.values(PAPEIS_DAS_COLUNAS), ...Object.values(ROTULOS_DOS_TIPOS)]
    case 'tabela':
      return [
        ...base,
        ...COLUNAS_MODELADAS.flatMap((c) => [c.tipo, c.papel]),
        ...Object.values(ROTULOS_DAS_CLASSES),
      ]
    case 'distribuicao':
      return [...base, ...Object.values(NOMES_DAS_NOTAS), ...Object.values(ROTULOS_DA_DISTRIBUICAO)]
    case 'grupos':
      return [...base, ...Object.values(ROTULOS_DOS_GRUPOS)]
    case 'correlacao':
      return [...base, ...Object.values(ROTULOS_DA_CORRELACAO)]
    case 'faltantes':
      return [...base, ...Object.values(ROTULOS_DOS_FALTANTES)]
    case 'inconsistencias':
      return [...base, ...INCONSISTENCIAS_ML.map((i) => i.texto)]
    case 'fora-da-regra':
      // O resumo vai para o leitor de tela, não para a tela: fica de fora.
      return [
        ...base,
        ...Object.entries(ROTULOS_DA_DISPERSAO)
          .filter(([chave]) => chave !== 'resumo')
          .map(([, texto]) => texto),
      ]
    case 'insights':
      return [...base, ...INSIGHTS_EDA.flatMap((i) => [i.achado, i.efeito])]
    case 'tratamento':
      return [
        ...base,
        ...COLUNAS_DO_TRATAMENTO,
        ...DECISOES_DO_TRATAMENTO.flatMap((d) => [d.problema, d.decisao, d.porque]),
      ]
    case 'codificacao':
      return [
        ...base,
        ...CODIFICACOES.flatMap((c) => [c.coluna, c.tecnica, c.porque]),
        PADRONIZACAO.titulo,
        PADRONIZACAO.texto,
        ...Object.values(ROTULOS_DA_CODIFICACAO),
      ]
    case 'features':
      return [
        ...base,
        ...COLUNAS_DAS_FEATURES,
        ...FEATURES_NOVAS.flatMap((f) => [f.como, f.porque]),
        ROTULOS_DA_DISTRIBUICAO.assimetria,
      ]
    case 'eda-features':
      return [
        ...base,
        ...Object.values(ROTULOS_DA_EDA_DAS_FEATURES),
        ...DESCARTADAS.flatMap((d) => [d.nome, d.porque]),
      ]
    case 'fechamento':
      return [
        slide.titulo,
        ...DESTAQUES_ML.flatMap((d) => [d.titulo, d.texto]),
        PROXIMOS_PASSOS,
        ROTULO_DA_ENTREGA_FINAL,
        ...ONDE_ESTA_CADA_ENTREGA.map((o) => o.oQue),
        PERGUNTAS,
      ]
    default:
      return base
  }
}

/** Contagem de palavras: número puro não conta. */
function contarPalavras(texto: string): number {
  return texto.split(/\s+/).filter((palavra) => /[a-zA-Zà-úÀ-Ú]/.test(palavra)).length
}

/** Quantas palavras aquele slide põe na tela. */
export function palavrasNaTela(id: SlideMLId): number {
  return contarPalavras(textoNaTela(id).join(' '))
}

/** Quantas palavras a fala daquele slide tem (sem as respostas preparadas). */
export function palavrasFaladas(id: SlideMLId): number {
  const slide = SLIDES_ML.find((s) => s.id === id)
  if (!slide) throw new Error(`Slide desconhecido: ${id}`)
  // Número dito em voz alta também é fala: aqui ele conta.
  return slide.notas.join(' ').split(/\s+/).filter(Boolean).length
}

/** Em que segundo da apresentação o slide de índice `indice` começa. */
export function inicioDoSlideML(indice: number): number {
  return SLIDES_ML.slice(0, indice).reduce((soma, slide) => soma + slide.segundos, 0)
}

export { formatarTempo }
