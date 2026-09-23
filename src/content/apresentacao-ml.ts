import { formatarTempo } from '@/content/pitch'
import dados from '@/content/ml/apresentacao.json'
import { MARCOS_PARALELOS } from '@/lib/cronograma'

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
 * TODO NÚMERO SAI DE `ml/apresentacao.json`, que o caderno 07 grava repetindo
 * as contas dos cadernos 01 e 02. Nenhum número está digitado à mão aqui: se a
 * análise mudar e o caderno rodar de novo, a tela muda junto. O teste confere o
 * JSON contra as saídas impressas dos cadernos, então os dois não se separam.
 *
 * AS NOTAS SÃO PARA QUEM NÃO É DE DADOS. Quem apresenta pode não ter escrito os
 * cadernos, então cada nota explica o termo técnico na primeira vez que ele
 * aparece, em frase que se diz em voz alta. A tela pode ter o termo (a banca é
 * de machine learning e cobra o nome certo); a fala diz o que ele significa.
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

/** 63.440 em vez de 63440. */
export function milhar(valor: number): string {
  return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** 53,2%. */
export function porcento(parte: number, todo: number, casas = 1): string {
  return `${decimal((parte / todo) * 100, casas)}%`
}

/* -------------------------------------------------------------------------
   Os números que o texto cita, tirados do JSON uma vez só
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

function outlierDe(coluna: string) {
  const achado = dados.outliers.find((o) => o.coluna === coluna)
  if (!achado) throw new Error(`Outlier ausente: ${coluna}`)
  return achado
}

function correlacaoFeature(coluna: string) {
  const achada = dados.correlacao_features.find((c) => c.coluna === coluna)
  if (!achada) throw new Error(`Correlação ausente: ${coluna}`)
  return achada
}

const IND2 = distribuicaoDe('ind2')
const IND3 = distribuicaoDe('ind3')
const IND4 = distribuicaoDe('ind4')
const GERAL = distribuicaoDe('geral')
const MATRIZ = dados.correlacao.matriz
const CORR_IND3_GERAL = MATRIZ[2][4]
const CORR_OUTRAS_GERAL = [MATRIZ[0][4], MATRIZ[1][4], MATRIZ[3][4]]
const MAC_FORA_NO_GERAL =
  (dados.outliers_geral_por_familia as Record<string, number>).MAC ?? 0
const PESO_80 = dados.linhas_fora_da_regra.filter((l) => l.peso_do_ind3_nos_pontos === 0.8)
const LINHAS_DS_COM_VIRGULA = (
  dados.inconsistencias.linhas_com_virgula_de_milhar as Record<string, number>
).DS
const FAMILIA_MAC = dados.por_familia.find((f) => f.grupo === 'MAC')
if (!FAMILIA_MAC) throw new Error('Família MAC ausente')
const PRODUTO_34 = correlacaoFeature('ind3_x_ind4')
const IND1_CLASSE = correlacaoFeature('ind1')
const TAXA_CLASSE = correlacaoFeature('taxa_ind1')
const [RED_DESVIO, RED_PRODUTO] = dados.redundantes

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
  /** A etapa da avaliação que o slide cumpre. Capa e roteiro não têm. */
  readonly etapa: NumeroDaEtapa | null
  /** Em minúsculas: a identidade baixa tudo. */
  readonly titulo: string
  /** A frase que acompanha o título. Uma só. */
  readonly apoio: string
  /** O que a tela mostra, em uma linha: serve a quem ensaia sem o site. */
  readonly visual: string
  readonly segundos: number
  /** O que dizer, uma ideia por linha. Aparece com a tecla `n`. */
  readonly notas: readonly string[]
}

/**
 * Onze minutos, sem margem de sobra embutida: a disciplina não fixou o tempo
 * da AV1, e o deck foi medido para caber em doze. Se a professora pedir menos,
 * os slides que saem primeiro são o roteiro, o de inconsistências e o de
 * insights, cujo conteúdo a fala dos vizinhos já cobre.
 */
export const DURACAO_ML_SEGUNDOS = 665

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

export const SLIDES_ML = [
  {
    id: 'capa',
    numero: 1,
    etapa: null,
    titulo: 'prumo',
    apoio: 'a planilha da gratificação da saúde do Recife, lida com aprendizado de máquina',
    visual: 'Wordmark, a pílula da AV1 e os nomes do grupo da disciplina.',
    segundos: 20,
    notas: [
      'Somos o grupo do Prumo, o projeto que refaz a conta da gratificação por desempenho da Secretaria de Saúde do Recife.',
      'Nesta AV1 a gente mostra as cinco primeiras etapas do trabalho de machine learning, na ordem que a avaliação pede.',
      'A base é a planilha real que a Secretaria usa hoje, cedida com autorização dela. Não tem nenhum dado de pessoa: a menor coisa que aparece é a unidade de saúde.',
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
      'São cinco paradas, na mesma ordem dos critérios da AV1: problema, dataset, exploração, tratamento e features novas.',
      'Todo número que aparece nos slides sai dos cadernos 01 e 02. O caderno 07 só repete as contas para desenhar os gráficos.',
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
    segundos: 40,
    notas: [
      'A Secretaria de Saúde do Recife paga uma gratificação às equipes das unidades de saúde conforme o desempenho. A regra está na Portaria Conjunta 001 de 2024.',
      'Cada unidade recebe nota em quatro indicadores: medicamentos e material hospitalar, gestão do trabalho, satisfação do usuário e desempenho da unidade.',
      'Os três primeiros pesam 20% cada, e o desempenho da unidade pesa 40%. O resultado geral é essa soma com peso.',
      'Quando perguntamos como a conta é feita hoje, a resposta foi: é tudo manual, via PROCV. É uma planilha grande, montada à mão, que ninguém de fora consegue conferir.',
    ],
  },
  {
    id: 'objetivo',
    numero: 4,
    etapa: 1,
    titulo: 'o que o modelo responde',
    apoio:
      'objetivo: descobrir quais indicadores mais pesam para uma unidade ficar abaixo de 90%, e quais unidades se parecem',
    visual: 'Três cartões: classificar, prever o número e agrupar, cada um com o alvo.',
    segundos: 40,
    notas: [
      'O objetivo não é substituir a conta da portaria: essa conta o sistema já refaz. É mostrar onde a gestão deve olhar.',
      'São três perguntas. Classificar é responder sim ou não: a unidade fica abaixo de 90% no resultado geral? O alvo é a coluna abaixo_90, que vale 1 quando fica.',
      `Por que 90%: quase todas as USF param em dois patamares, ${decimal(GERAL.degraus[0].valor, 3)} e ${decimal(GERAL.degraus[1].valor, 3)}. O corte de 90% cai exatamente entre os dois.`,
      'Regressão é prever o número em si, o resultado geral. E agrupar é juntar unidades parecidas sem uma resposta certa definida antes: por isso o agrupamento não tem alvo.',
    ],
  },
  {
    id: 'uso',
    numero: 5,
    etapa: 1,
    titulo: 'para que serve a resposta',
    apoio: 'quatro usos para a gestão da Secretaria, e um limite que não se negocia',
    visual: 'Quatro cartões de uso e, embaixo, o limite.',
    segundos: 30,
    notas: [
      'Primeiro uso, prioridade: antes de fechar o mês, a gestão olha primeiro para as unidades com risco de ficar abaixo de 90%.',
      'Segundo: a importância das features diz em qual indicador uma melhora rende mais.',
      `Terceiro, e esse já aconteceu: comparar o resultado que a regra espera com o que foi lançado acha erro de planilha. A exploração achou ${B.fora_da_regra} linhas assim.`,
      'Quarto: o agrupamento junta unidades de perfil parecido, e cada uma passa a ser comparada com as semelhantes.',
      'E o limite: nada do modelo entra na conta da gratificação, e ele agrupa unidades, nunca pessoas. Quem decide o valor continua sendo a regra.',
    ],
  },
  {
    id: 'origem',
    numero: 6,
    etapa: 2,
    titulo: 'a planilha real, como chegou',
    apoio:
      'enviada pela Secretaria com autorização e sem nenhum dado de pessoa: uma linha por unidade de saúde, mais as dos distritos',
    visual: 'O funil de linhas: 244, 196, 190, com o motivo de cada corte.',
    segundos: 35,
    notas: [
      'A origem é a própria planilha de desempenho que a Secretaria usa, exportada em CSV. Ela entrou no projeto com autorização registrada, e foi varrida atrás de CPF, e-mail e telefone antes de qualquer análise: não tem nenhum.',
      `São ${B.linhas} linhas e ${B.colunas} colunas.`,
      `${B.linhas_distrito} linhas são do próprio distrito sanitário, marcadas como DS. O distrito é avaliado com outra versão dos indicadores, então sai da modelagem. Sobram ${B.unidades} unidades de saúde.`,
      `${B.fora_da_regra} dessas unidades têm um resultado que não segue os pesos da portaria. Elas saem também, e sobram ${B.modeladas} para os modelos.`,
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
      'Cada coluna tem um nome no padrão papel e indicador. O papel diz o que ela guarda: a meta, a nota, o numerador, o denominador, o valor lançado, a nota consolidada e o resultado geral.',
      `Na leitura crua o pandas acha ${B.tipos_na_leitura.texto} colunas de texto. Não é texto de verdade: é número guardado com sinal de porcento e vírgula de milhar.`,
      `Depois da conversão ficam ${B.categoricas.length} categóricas, o tipo de unidade com ${B.categoricas[0].valores} valores e o distrito com ${B.categoricas[1].valores}, e ${B.numericas} numéricas contínuas.`,
      `Das ${B.colunas}, ${dados.inconsistencias.colunas_constantes} são constantes nas unidades, a maioria metas. Elas não ensinam nada ao modelo.`,
    ],
  },
  {
    id: 'tabela',
    numero: 8,
    etapa: 2,
    titulo: 'a tabela que o modelo lê',
    apoio: 'as notas dos quatro indicadores, três categóricas e dois alvos tirados do resultado geral',
    visual: 'A ficha das colunas modeladas, com o tipo de cada uma, e a barra das duas classes.',
    segundos: 40,
    notas: [
      'Das colunas da planilha, a tabela modelada fica com poucas: o tipo de unidade, a família, que é a primeira palavra do tipo, o distrito, as quatro notas e o resultado geral.',
      'Tipo, família e distrito são categóricas nominais: não existe ordem entre os valores. As notas e o resultado são numéricos contínuos.',
      'Os alvos: o resultado geral para a regressão, e abaixo_90 para a classificação.',
      `As classes estão quase equilibradas: ${dados.classes.noventa_ou_mais} unidades com 90% ou mais e ${dados.classes.abaixo_de_90} abaixo. Mesmo assim, treino e teste são separados de forma estratificada, com peso de classe e F1 como métrica.`,
    ],
  },
  {
    id: 'distribuicao',
    numero: 9,
    etapa: 3,
    titulo: 'as notas andam em degraus',
    apoio: `cada indicador vira nota por faixa, então poucos valores se repetem muito nas ${B.unidades} unidades`,
    visual: 'Cinco histogramas, um por nota, com a assimetria e o valor mais comum.',
    segundos: 35,
    notas: [
      `Estes são os histogramas de cada nota nas ${B.unidades} unidades de saúde, com a assimetria embaixo. Assimetria perto de zero é uma curva equilibrada; longe de zero, a cauda puxa para um lado.`,
      `Quase nada aqui é curva. O ind2 vale ${decimal(IND2.degraus[0].valor, 1)} em ${IND2.degraus[0].unidades} unidades; o ind3 vale ${decimal(IND3.degraus[0].valor)} em ${IND3.degraus[0].unidades}; o ind4 vale ${decimal(IND4.degraus[0].valor, 1)} em ${IND4.degraus[0].unidades}.`,
      `O resultado geral se concentra em dois valores, ${decimal(GERAL.degraus[0].valor, 3)} e ${decimal(GERAL.degraus[1].valor, 3)}, e tem uma cauda longa à direita: assimetria de ${decimal(GERAL.assimetria)}.`,
      'Essa cauda vem de poucos tipos de unidade: MAC 1 e 2, NDI e SAE. O próximo slide mostra de onde ela sai.',
    ],
  },
  {
    id: 'grupos',
    numero: 10,
    etapa: 3,
    titulo: 'o tipo separa, o distrito não',
    apoio: 'resultado geral por família de unidade e por distrito sanitário, com a linha dos 90%',
    visual: 'Dois conjuntos de caixas (boxplot), família e distrito, na mesma escala, com o corte de 90%.',
    segundos: 30,
    notas: [
      'Cada linha é um grupo. A caixa vai do primeiro ao terceiro quartil, o traço de dentro é a mediana e os pontos soltos são os que o IQR marca como fora. A linha laranja é o corte de 90%.',
      `Por família, as caixas mudam muito de lugar: a MAC vai de ${decimal(Math.min(FAMILIA_MAC.bigode_baixo, ...FAMILIA_MAC.fora))} a ${decimal(Math.max(FAMILIA_MAC.bigode_alto, ...FAMILIA_MAC.fora))}, e NDI e SAE passam de 1,5.`,
      'Por distrito, as caixas ficam todas em volta de 0,90 a 0,95.',
      'Conclusão: o tipo de unidade explica muito mais o resultado do que o distrito. Por isso o tipo ganha duas colunas no tratamento: o código e o nível.',
    ],
  },
  {
    id: 'correlacao',
    numero: 11,
    etapa: 3,
    titulo: 'o ind3 anda junto com o resultado',
    apoio: `correlação entre as notas nas ${B.unidades} unidades, e as colunas cruas mais ligadas ao resultado geral`,
    visual: 'O mapa de calor 5 por 5 das notas e as barras das colunas cruas mais correlacionadas.',
    segundos: 35,
    notas: [
      'Correlação vai de menos 1 a 1. Perto de 1, as duas colunas sobem juntas; perto de menos 1, uma sobe quando a outra desce; perto de zero, não há relação em linha reta.',
      `O ind3, satisfação do usuário, tem ${decimal(CORR_IND3_GERAL)} com o resultado geral. Os outros três ficam entre ${decimal(Math.min(...CORR_OUTRAS_GERAL))} e ${decimal(Math.max(...CORR_OUTRAS_GERAL))}. Entre si as notas quase não se correlacionam, então nenhuma repete a outra.`,
      `À direita, as colunas cruas que mais se ligam ao resultado, entre as ${dados.base.colunas_correlacionadas} numéricas que variam nas unidades. A primeira são os pontos do próprio ind3, que entram na soma: por isso ela não pode ser feature, vazaria o alvo.`,
      'Depois vêm blocos do indicador 4 e a nota do indicador 5, que está na planilha mas não entra na conta da unidade. É daqui que partem as features novas.',
    ],
  },
  {
    id: 'faltantes',
    numero: 12,
    etapa: 3,
    titulo: 'nada falta, e o outlier não é erro',
    apoio: `zero ausentes nas ${milhar(B.celulas)} células; o IQR marca como outlier os tipos que pontuam diferente`,
    visual: 'O mapa de ausentes inteiro limpo e as barras de outliers por nota.',
    segundos: 35,
    notas: [
      `A planilha não tem nenhuma célula vazia: zero ausentes nas ${milhar(B.celulas)} células, antes e depois de converter texto em número. O mapa de ausentes sai inteiro limpo.`,
      'Para outlier usamos a regra do IQR: fica fora quem passa de uma vez e meia a distância entre o primeiro e o terceiro quartil.',
      `Como as notas andam em degraus, o IQR fica estreito e marca muita gente: ${outlierDe('geral').unidades} unidades no resultado geral, ${MAC_FORA_NO_GERAL} delas MAC.`,
      'Esses pontos não são erro de medida: são tipos de unidade pontuados de outro jeito. Por isso ficam na base. Os modelos de árvore também não se incomodam com eles.',
    ],
  },
  {
    id: 'inconsistencias',
    numero: 13,
    etapa: 3,
    titulo: 'o que o olho não pega',
    apoio: 'problemas da planilha que a conversão precisou resolver antes de qualquer conta',
    visual: 'Seis cartões, cada um com o tamanho do problema em número grande.',
    segundos: 30,
    notas: [
      `A planilha foi feita para gente ler, não para máquina. ${B.tipos_na_leitura.texto} colunas chegam como texto porque o número vem com porcento ou vírgula.`,
      `Pior: ${dados.inconsistencias.colunas_fracao_e_percentual} colunas misturam os dois jeitos, 0,8 numa linha e 80% na outra. E ${dados.inconsistencias.metas_escritas_de_dois_jeitos.length} metas estão escritas de dois jeitos, como 20 e 2000%, que depois da conversão dão o mesmo número.`,
      `As linhas de distrito usam vírgula de milhar, como 1,821.4. E ${dados.inconsistencias.colunas_constantes} colunas são constantes nas unidades.`,
      'Por fim, as quatro últimas colunas repetem o nome de outras: são os pontos, a nota vezes o peso. O indicador 4 só aparece assim, e precisa ser dividido por 0,4 para virar nota.',
    ],
  },
  {
    id: 'fora-da-regra',
    numero: 14,
    etapa: 3,
    titulo: 'seis linhas não fecham a conta',
    apoio:
      'cada ponto é uma unidade: o resultado que os pesos da portaria dão, contra o que a planilha lançou',
    visual: 'A dispersão esperado contra lançado, com a diagonal e as seis unidades fora dela.',
    segundos: 45,
    notas: [
      `Pela portaria, o resultado geral é 0,2 vezes cada um dos três primeiros indicadores mais 0,4 vezes o quarto. Refizemos essa conta para as ${B.unidades} unidades.`,
      `${B.unidades - B.fora_da_regra} caem em cima da diagonal: a conta fecha. ${B.fora_da_regra} não: três NDI e três SAE, em laranja.`,
      `Em ${PESO_80.length} delas, os pontos do indicador 3 saem com peso 80% em vez de 20%. Na sexta, o resultado nem bate com a soma dos próprios pontos.`,
      'Essas seis saem da modelagem, porque o modelo aprenderia uma regra que não existe. E o achado vira argumento do produto: a planilha se contradiz sozinha.',
    ],
  },
  {
    id: 'insights',
    numero: 15,
    etapa: 3,
    titulo: 'o que a exploração ensinou',
    apoio: 'seis achados e o que cada um mudou depois',
    visual: 'Seis cartões numerados: o achado e a consequência.',
    segundos: 25,
    notas: [
      'Resumindo a exploração em seis achados.',
      'O tipo de unidade explica o resultado, e o distrito quase nada. O ind3 é a nota que mais anda com o resultado. As notas andam em degraus, e por isso o IQR exagera.',
      'Não falta nenhum valor, mas quase tudo chega como texto. Seis linhas não seguem a conta. E as classes estão quase equilibradas.',
      'Cada achado virou uma decisão, e é isso que o tratamento mostra agora.',
    ],
  },
  {
    id: 'tratamento',
    numero: 16,
    etapa: 4,
    titulo: 'cada problema, uma decisão',
    apoio: 'o que a planilha recebeu antes de qualquer modelo, e por quê',
    visual: 'Uma tabela de três colunas: problema, decisão e justificativa.',
    segundos: 40,
    notas: [
      'Primeiro, o tipo: uma função converte texto em número, tirando o porcento e a vírgula de milhar e dividindo por 100 quando tinha porcento. As colunas viram número e nenhum ausente aparece.',
      'Ausentes: não havia nenhum. O caderno deixa o preenchimento pela mediana do tipo de unidade como rede, para o dia em que uma planilha nova vier com buraco.',
      'Duplicados: nenhuma linha repetida, o que faz sentido, porque cada linha é uma unidade. As colunas de nome repetido, que são os pontos, serviram para conferir o peso: pontos divididos pela nota dão 0,2 no indicador 1.',
      `Outliers ficam, porque são tipos reais. O que sai são as ${B.linhas_distrito} linhas de distrito e as ${B.fora_da_regra} que não fecham a conta. Resultado: ${B.modeladas} unidades.`,
    ],
  },
  {
    id: 'codificacao',
    numero: 17,
    etapa: 4,
    titulo: 'categoria vira número sem inventar ordem',
    apoio: 'one-hot onde não há ordem, código onde a árvore dá conta, número onde a ordem é real',
    visual: 'Três cartões de encoding, a padronização e as caixas das MAC por nível.',
    segundos: 35,
    notas: [
      `Família, com ${dados.codificacao.one_hot[0].valores} valores, e distrito, com ${dados.codificacao.one_hot[1].valores}, viram one-hot: uma coluna de 0 e 1 para cada valor. O distrito vem em algarismo romano, mas o distrito I não é menor que o II; label encoding inventaria essa ordem.`,
      `O tipo de unidade tem ${dados.codificacao.label_encoding.valores} valores, vários com uma ou duas unidades. One-hot criaria ${dados.codificacao.label_encoding.valores} colunas quase vazias. Label encoding guarda tudo numa coluna, e serve porque os modelos são de árvore.`,
      'O número no fim do tipo é ordinal de verdade, e vira coluna numérica. O gráfico mostra por quê: MAC 1 e 2 ficam acima de 1,2; MAC 3 e 4 ficam abaixo de 0,8.',
      'Padronização só no K-Means, que mede distância. As árvores não dependem de escala, então a base salva fica na escala original. Num modelo supervisionado, a escala seria ajustada só no treino, para o teste não vazar.',
    ],
  },
  {
    id: 'features',
    numero: 18,
    etapa: 5,
    titulo: 'seis features novas',
    apoio:
      'todas partem das notas mais ligadas ao resultado, e nenhuma usa o resultado geral: o alvo não vaza',
    visual: 'Ficha das seis features: como se calcula, por quê, a distribuição e a assimetria.',
    segundos: 40,
    notas: [
      'As features novas partem das colunas que a exploração mostrou mais ligadas ao resultado: as notas dos indicadores 3, 4 e 1, e os lançamentos por trás delas.',
      'A taxa do ind1 é a versão contínua dele: a nota só vale 0, 0,5 ou 0,75, mas a taxa de atendimento mostra quão perto a unidade está de subir ou cair de degrau.',
      'O produto do ind3 pelo ind4 marca quem vai bem nas duas ao mesmo tempo. O ind3 abaixo da meta é o que derruba as MAC 3 e 4.',
      'Indicadores na meta conta quantas notas chegam a 100%. O desvio mede quão desigual a unidade é. E a média dos blocos do ind4 enxerga variação que a nota final esconde, já que o ind4 da USF é quase sempre 0,8.',
      'Nenhuma usa o resultado geral. Se usasse, o modelo estaria colando a resposta.',
    ],
  },
  {
    id: 'eda-features',
    numero: 19,
    etapa: 5,
    titulo: 'o que as features novas acrescentam',
    apoio:
      'correlação de cada coluna com o resultado geral e com a classe abaixo de 90%, com as notas de origem ao lado',
    visual: 'Barras divergentes das dez colunas nos dois alvos, a redundância e as três descartadas.',
    segundos: 40,
    notas: [
      'Cada coluna aparece com a correlação com o resultado geral, à esquerda, e com a classe abaixo de 90%, à direita. As novas estão marcadas.',
      `O produto ind3 por ind4 é a coluna mais ligada ao resultado geral de todas, ${decimal(PRODUTO_34.com_geral)}, acima do próprio ind3. Para a classe, a taxa do ind1 fica logo atrás do ind1: ${decimal(TAXA_CLASSE.com_abaixo_de_90)} contra ${decimal(IND1_CLASSE.com_abaixo_de_90)}.`,
      'Correlação negativa com abaixo de 90% é boa notícia: quanto maior a feature, menor a chance de ficar abaixo.',
      `Redundância: o desvio e o produto andam quase juntos com o ind3, ${decimal(RED_DESVIO.correlacao)} e ${decimal(RED_PRODUTO.correlacao)}. Para árvore isso não atrapalha; num modelo linear, ficaria só uma delas.`,
      'E três candidatas foram testadas e descartadas: o log do ind4, que quase não muda a assimetria; o subindicador 2.3, do qual o ind2 é função direta; e o porte da unidade, que não tem relação com o resultado.',
    ],
  },
  {
    id: 'fechamento',
    numero: 20,
    etapa: null,
    titulo: 'o que levar daqui',
    apoio: 'três destaques, o que vem depois e onde está cada entrega',
    visual: 'Três destaques, os próximos passos, onde ler cada entrega e perguntas.',
    segundos: 25,
    notas: [
      `Três coisas para levar. Primeira: a planilha se contradiz, e a exploração achou isso sozinha: ${B.fora_da_regra} linhas que não fecham a conta.`,
      'Segunda: como o resultado é soma com peso das notas, qualquer modelo vai aprender a regra e ter métrica alta. A gente vai dizer isso, em vez de vender previsão.',
      'Terceira: o ind3 puxa o resultado geral, e o ind1 é o que mais separa quem fica abaixo de 90%.',
      'Os próximos passos já estão nos cadernos 3 a 6: classificação, regressão e agrupamento, cada um comparado com uma referência simples.',
      'Se perguntarem por que F1 e não acurácia: o F1 olha a classe que importa, abaixo de 90%, e não se deixa enganar por um modelo que só chuta a classe maior.',
      'Se perguntarem se tirar as seis linhas é esconder dado: não. Elas estão documentadas no caderno 02 e viraram achado; só não ensinam o modelo, porque seguem outra conta.',
      'Se perguntarem por que não padronizou tudo: árvore não depende de escala. A padronização entra no K-Means, que mede distância.',
      'Se perguntarem se a métrica alta é vazamento: nenhuma feature usa o resultado geral, mas o resultado é feito das notas. Por isso o objetivo é explicar o que pesa, não prever.',
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
  { titulo: 'priorizar', texto: 'olhar primeiro para quem pode ficar abaixo de 90%' },
  { titulo: 'mostrar o que move', texto: 'em qual indicador uma melhora rende mais' },
  { titulo: 'achar erro na planilha', texto: 'o que a regra espera contra o que foi lançado' },
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
    motivo: `saem ${B.linhas_distrito} linhas de distrito (DS), avaliadas de outro jeito`,
  },
  {
    numero: B.modeladas,
    rotulo: 'unidades modeladas',
    motivo: `saem ${B.fora_da_regra} que não seguem os pesos da portaria`,
  },
] as const

export const FICHA_DA_ORIGEM = [
  { rotulo: 'arquivo', valor: 'ml/data/base nova completa.csv' },
  { rotulo: 'codificação', valor: 'cp1252' },
  { rotulo: 'autorização', valor: 'da Secretaria, registrada na ADR-044' },
  { rotulo: 'dado de pessoa', valor: 'nenhum: sem nome, CPF ou matrícula' },
] as const

/** Slide 7: o que cada papel de coluna guarda. A chave é o começo do nome. */
export const PAPEIS_DAS_COLUNAS: Readonly<Record<string, string>> = {
  Meta: 'meta da portaria',
  Desempenho: 'nota do subindicador',
  'Quantidade atendida': 'numerador',
  'Total avaliado': 'denominador',
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
  numericas: 'numéricas contínuas',
} as const

/** Slide 8: a ficha das colunas modeladas. */
export const COLUNAS_MODELADAS = [
  { coluna: 'tipo', tipo: 'categórica nominal', papel: `${B.tipos_nas_modeladas} tipos de unidade` },
  { coluna: 'familia', tipo: 'categórica nominal', papel: B.familias_nas_modeladas.join(', ') },
  { coluna: 'distrito', tipo: 'categórica nominal', papel: 'de I a VIII' },
  { coluna: 'ind1 a ind4', tipo: 'numérica contínua', papel: 'a nota de cada indicador' },
  { coluna: 'geral', tipo: 'numérica contínua', papel: 'alvo da regressão', alvo: true },
  { coluna: 'abaixo_90', tipo: 'binária', papel: 'alvo da classificação', alvo: true },
] as const

export const ROTULOS_DAS_CLASSES = {
  titulo: 'distribuição das classes',
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

/** Slide 10. */
export const ROTULOS_DOS_GRUPOS = {
  familia: 'por família de unidade',
  distrito: 'por distrito sanitário',
  corte: '90%',
} as const

/** Slide 11. */
export const ROTULOS_DA_CORRELACAO = {
  matriz: 'entre as notas',
  colunas: 'colunas cruas mais ligadas ao resultado',
  escala: 'de −1 a 1',
} as const

/**
 * O nome de uma coluna crua da planilha, curto e sem o travessão do original
 * (regra 8 da casa: o dado tem, a tela não). As quatro últimas colunas repetem
 * o nome de outras e guardam PONTOS (nota vezes peso); `Indicador 4` só existe
 * nessa forma, por isso ele também é ponto.
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

/** Quantas colunas cruas o slide 11 mostra. */
export const COLUNAS_CRUAS_NO_SLIDE = 8

/** Slide 12. */
export const ROTULOS_DOS_FALTANTES = {
  mapa: 'mapa de ausentes',
  dimensoes: `${B.colunas} colunas × ${B.linhas} linhas`,
  ausentes: 'células ausentes',
  outliers: 'fora do IQR, por nota',
  macNoGeral: `no resultado geral, ${MAC_FORA_NO_GERAL} são MAC`,
} as const

/** Slide 13: os seis problemas, cada um com o tamanho em número. */
export const INCONSISTENCIAS_ML = [
  { numero: B.tipos_na_leitura.texto, texto: 'colunas lidas como texto: número com % e vírgula' },
  {
    numero: dados.inconsistencias.colunas_fracao_e_percentual,
    texto: 'colunas que misturam 0,8 e 80%',
  },
  {
    numero: dados.inconsistencias.metas_escritas_de_dois_jeitos.length,
    texto: 'metas escritas de dois jeitos, como 20 e 2000%',
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
    texto: 'colunas de pontos com nome repetido; o ind4 só vem assim, vezes 0,4',
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
} as const

/** Slide 15: os seis achados e o que cada um mudou. */
export const INSIGHTS_EDA = [
  { achado: 'o tipo explica o resultado; o distrito, quase nada', efeito: 'tipo vira código e nível' },
  { achado: 'o ind3 é a nota mais ligada ao resultado', efeito: 'as features novas partem dele' },
  { achado: 'as notas andam em degraus', efeito: 'o IQR exagera; os outliers ficam' },
  { achado: 'nada ausente, mas quase tudo chega como texto', efeito: 'converter antes de tudo' },
  { achado: 'seis linhas não seguem a conta', efeito: 'saem da modelagem' },
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
  { problema: 'outliers do IQR', decisao: 'manter', porque: 'tipos reais; árvore não se incomoda' },
  {
    problema: 'distrito e fora da regra',
    decisao: `remover ${B.linhas_distrito} + ${B.fora_da_regra}`,
    porque: 'outra avaliação; conta que não fecha',
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
  { coluna: 'nível do tipo', tecnica: 'ordinal', porque: 'USF 1 a 8 e MAC 1 a 4 têm ordem real' },
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
  redundanciaNota: 'para árvore não atrapalha; num modelo linear, ficaria uma só',
  descartadas: 'testadas e descartadas',
} as const

export const DESCARTADAS = [
  {
    nome: 'log do ind4',
    porque: `a assimetria quase não muda: ${decimal(dados.descartadas.assimetria_ind4)} para ${decimal(dados.descartadas.assimetria_log_ind4)}`,
  },
  { nome: 'subindicador 2.3', porque: 'o ind2 é função direta dele' },
  {
    nome: 'porte da unidade',
    porque: `correlação de ${decimal(dados.descartadas.correlacao_porte_geral, 3)} com o resultado`,
  },
] as const

/** Slide 20. */
export const DESTAQUES_ML = [
  { titulo: 'a planilha se contradiz', texto: 'seis linhas não fecham a conta da portaria' },
  { titulo: 'o modelo vai aprender a regra', texto: 'o resultado é soma das notas: métrica alta não é mérito' },
  { titulo: 'ind3 e ind1 movem tudo', texto: 'um puxa o resultado, o outro decide quem fica abaixo' },
] as const

export const PROXIMOS_PASSOS =
  'próximo: XGBoost, LightGBM, CatBoost e stacking para classificar, XGBoost para a regressão e K-Means para agrupar'

export const ROTULO_DA_ENTREGA_FINAL = 'entrega final'

export const ONDE_ESTA_CADA_ENTREGA = [
  { oQue: 'documento das etapas 1 e 2', onde: 'ml/documento-problema-e-dados.md' },
  { oQue: 'cadernos das etapas 2 a 5', onde: 'ml/notebooks, 01 e 02' },
] as const

export const PERGUNTAS = 'perguntas?'

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
      return [...base, ...Object.values(ROTULOS_DA_DISPERSAO)]
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

/** Quantas palavras aquele slide põe na tela. Número puro não conta. */
export function palavrasNaTela(id: SlideMLId): number {
  return textoNaTela(id)
    .join(' ')
    .split(/\s+/)
    .filter((palavra) => /[a-zA-Zà-úÀ-Ú]/.test(palavra)).length
}

/** Em que segundo da apresentação o slide de índice `indice` começa. */
export function inicioDoSlideML(indice: number): number {
  return SLIDES_ML.slice(0, indice).reduce((soma, slide) => soma + slide.segundos, 0)
}

export { formatarTempo }
