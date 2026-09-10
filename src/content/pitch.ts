import type { IntegranteId } from '@/content/equipe'

/**
 * O PITCH DO KICK-OFF, como dado.
 *
 * Fonte única do roteiro: a rota `/pitch` renderiza estes slides, o registro
 * do ciclo `ko` mostra a mesma tabela, `docs/pitch-kickoff.md` é gerado a partir
 * dela e `pitch.test.ts` confere que a soma fecha em 4:55, que os seis falam e
 * que nenhum número dito no palco diverge do que o repositório sustenta.
 *
 * Só texto e números aqui, nada de JSX: o arquivo é importado tanto por
 * componentes de servidor quanto pelo script de verificação de vazamento, que
 * roda em Node puro. E NUNCA por componente cliente: o texto do Kick-off é
 * conteúdo de ciclo, e chegaria ao bundle antes da hora.
 *
 * TODO TEXTO QUE APARECE NA TELA MORA AQUI, inclusive rótulo de cartão. Não é
 * organização: é o que permite `pitch.test.ts` contar as palavras de cada
 * slide e falhar quando passarem do teto. A primeira versão tinha 1.127
 * palavras na tela para 4:55 de fala, quase todas repetindo a nota do
 * apresentador — a plateia lia em vez de ouvir. O componente só escolhe a
 * forma do visual; as palavras vêm daqui.
 *
 * Nomes aparecem aqui só como QUEM FALA. Quem construiu o quê não é assunto do
 * pitch: a equipe construiu, e o registro semanal diz como.
 */
export interface Slide {
  readonly id: string
  readonly numero: number
  /** Em minúsculas: a identidade baixa tudo, e o título do slide também. */
  readonly titulo: string
  /** A frase que acompanha o título. Uma só. */
  readonly apoio: string
  /** O que a tela mostra, em uma linha: serve ao roteiro impresso. */
  readonly visual: string
  readonly segundos: number
  readonly quemFala: IntegranteId
  /** As notas do apresentador, uma ideia por linha. Aparecem com a tecla `n`. */
  readonly notas: readonly string[]
}

/** 4:55. Os cinco segundos que sobram são a margem para o "obrigado". */
export const DURACAO_PITCH_SEGUNDOS = 295

/**
 * O PDF de reserva, para quem apresenta sem rede.
 *
 * É uma ROTA, não um arquivo em `public/`: assim ele passa pelo mesmo portão
 * de release da página (ver `src/app/pitch/pdf/route.ts`). Baixar continua
 * funcionando sem JavaScript, que é justamente o cenário em que baixar o PDF
 * importa. Gerado por `npm run pitch-pdf` a partir desta mesma rota.
 */
export const ARQUIVO_PDF = '/pitch/pdf'

/**
 * Teto de palavras POR SLIDE, contando tudo que o autor escreveu na tela:
 * título, frase de apoio e cada rótulo dos cartões. Não conta as notas do
 * apresentador (escondidas) nem a memória de cálculo do slide 4, que é a
 * interface real do sistema e não texto nosso.
 *
 * Setenta é a conta de quem fala: um slide dura 40 segundos e a plateia lê a
 * uma velocidade que não dá para competir com a voz. Passou disso, a tela
 * virou teleprompter.
 */
export const TETO_DE_PALAVRAS_POR_SLIDE = 70

/**
 * A unidade e a competência da demonstração ao vivo. Sintéticas, como tudo na
 * base: uma USF com nota integral, sem avisos, para a memória aparecer inteira.
 */
export const DEMO_PITCH = {
  unidadeId: 'usf-canario',
  cicloId: 'ciclo-2026-05',
} as const

/**
 * Contagens ditas no palco. Cada uma é conferida em `pitch.test.ts` contra o
 * arquivo de onde vem, para que o número da tela e o número do repositório
 * nunca se separem. Mudou o documento, o teste avisa antes do ensaio.
 */
export const CONTAGENS_PITCH = {
  /** Linhas da tabela STRIDE em docs/seguranca.md. */
  ameacasStride: 14,
  /** Linhas da tabela OWASP Top 10 em docs/seguranca.md. */
  itensOwasp: 10,
  /** Quantas dessas linhas estão marcadas como parciais. */
  owaspParciais: 5,
  /** Linhas de "Privacy by Design: onde está no código" em docs/privacidade.md. */
  principiosPrivacidade: 6,
  /** Linhas do registro semanal em docs/uso-de-ia.md. */
  usosDeIa: 41,
} as const

export const SLIDES = [
  {
    id: 'capa',
    numero: 1,
    titulo: 'prumo',
    apoio: 'o cálculo da gratificação que se explica sozinho',
    visual: 'Wordmark, uma linha, e a pílula do marco: kick-off, data e equipe.',
    segundos: 5,
    quemFala: 'gabriel',
    notas: [
      'Bom dia. Somos a Equipe 2 e este é o Prumo.',
      'Cinco minutos: o problema, quem sofre com ele, a ideia que priorizamos e para onde vamos até o SR1.',
    ],
  },
  {
    id: 'problema',
    numero: 2,
    titulo: 'todo mês, uma conta feita à mão',
    apoio:
      'Desde 2023 a Secretaria de Saúde do Recife paga gratificação por metas. A régua está na portaria. A conta está numa planilha.',
    visual: 'O fluxo da portaria em cinco etapas, com o ponto de quebra marcado na consolidação.',
    segundos: 35,
    quemFala: 'gabriel',
    notas: [
      'A Portaria Conjunta 001/2024 fixa cinco indicadores, com subindicadores, metas mensais e pesos que mudam por tipo de unidade e por função.',
      'O fluxo é da própria norma: cada secretaria executiva coleta, manda à SECOGE até o dia 20, a Comissão de Avaliação de Metas consolida e valida, e a SEGTES leva para a folha.',
      'O ponto de quebra é a consolidação: dezenas de números viram uma nota por gestor, à mão, em planilha. A régua está escrita; a conta não está.',
    ],
  },
  {
    id: 'quem-sofre',
    numero: 3,
    titulo: 'três pessoas, o mesmo número',
    apoio: 'Ninguém responde "de onde veio esse número?" sem abrir a planilha de outra pessoa.',
    visual: 'Três cartões, um por papel: quem consolida, quem informa, quem é avaliada. Uma frase de cada.',
    segundos: 40,
    quemFala: 'matheus',
    notas: [
      'As três personas são papéis, não pessoas: construídas a partir do case e confirmadas na reunião com o cliente em 22/08. Nenhum dado real.',
      'Quem consolida fecha o ciclo com medo de ter errado uma fórmula, e é procurada sempre que alguém contesta um resultado.',
      'Quem informa preenche em cima do prazo, entre outras dez prioridades, e é cobrado por dado que já enviou.',
      'Quem é avaliada recebe o valor sem o caminho que levou até ele. É quem mais precisa da conta aberta.',
    ],
  },
  {
    id: 'ideia',
    numero: 4,
    titulo: 'a nota com a conta aberta',
    apoio:
      'A ideia priorizada: cada número responde "de onde veio?" em um clique. Isto é o sistema rodando agora, não uma imagem.',
    visual:
      'O cartão da nota e a memória de cálculo reais, do motor do Prumo, para uma unidade sintética. A conta inteira cabe na tela, sem rolagem.',
    segundos: 45,
    quemFala: 'joao-pedro',
    notas: [
      'O que está na tela é o componente real do sistema, com o motor real e dados sintéticos: a USF Canário, competência de maio, régua versão 2.',
      'Cada linha é um indicador. Dentro dela, os subindicadores que a unidade preencheu: valor direto, ou numerador dividido por denominador.',
      'O valor composto é comparado com a meta do tipo da unidade e vira pontos; os pontos multiplicam o peso. A soma dividida pelo máximo dá a nota de 0 a 100 e a faixa de pagamento.',
      'A memória é renderizada junto com o slide, não depende de rede nem de serviço: se a página abriu, ela está aqui. O PDF baixado antes cobre a sala sem rede.',
    ],
  },
  {
    id: 'como-funciona',
    numero: 5,
    titulo: 'regra é dado, não fórmula',
    apoio:
      'A portaria vira uma versão da regra. O ciclo guarda qual versão usou. O resultado antigo continua reproduzível.',
    visual: 'O caminho de um número em quatro passos, os quatro papéis e as etapas do mês.',
    segundos: 45,
    quemFala: 'joao-henrique',
    notas: [
      'O motor é função pura: sem banco, sem relógio, sem aleatoriedade. Mesma entrada, mesma nota, hoje e daqui a um ano.',
      'Mudou a portaria? Cria-se uma versão nova da regra. Os meses já homologados continuam reproduzindo o resultado antigo, porque cada ciclo aponta para a versão que usou.',
      'Quatro papéis, os que o cliente nomeou: o gerente de unidade lança, o gerente distrital revisa, a coordenação da SEAB fecha o mês, o administrador cuida dos cadastros e da trilha.',
      'Toda escrita gera evento com autor, data, antes e depois. A trilha só cresce.',
    ],
  },
  {
    id: 'dados',
    numero: 6,
    titulo: 'nenhum dado real. ainda.',
    apoio:
      'Hoje: base sintética com semente fixa, reproduzível por qualquer pessoa. A régua oficial já chegou, e é a próxima.',
    visual: 'Os números da base sintética, e a linha de base publicada ao lado de cada modelo.',
    segundos: 40,
    quemFala: 'rafael',
    notas: [
      'Tudo que o sistema mostra vem de um gerador com semente fixa: os distritos, os tipos de unidade, as unidades, os indicadores e as competências que estão na tela.',
      'A lente de aprendizado de máquina treina fora do app e publica quatro modelos, cada um com a linha de base ao lado. O classificador de meta perde para o palpite majoritário, e isso está na tela, não escondido.',
      'Nada que sai dos modelos entra no cálculo. O modelo diz onde olhar; a portaria diz quanto alguém recebe.',
      'A portaria pública entra no repositório. A planilha anonimizada que o cliente enviou fica fora dele, porque o repositório é público, e serve para validar a régua.',
    ],
  },
  {
    id: 'riscos',
    numero: 7,
    titulo: 'o que pode dar errado, dito antes',
    apoio:
      'O que não fizemos está escrito: login simulado, banco desligado, modelos no recorte antigo, motor ainda na régua deduzida.',
    visual: 'Quatro contagens: ameaças STRIDE, itens OWASP, princípios de privacidade e usos de IA assinados.',
    segundos: 40,
    quemFala: 'fernando',
    notas: [
      'Segurança: as ameaças mapeadas em STRIDE têm cada uma um estado; os dez itens do OWASP foram conferidos, e os parciais estão declarados.',
      'Privacidade: um sistema que decide remuneração cai no artigo 20 da LGPD. Os princípios de privacy by design apontam para o arquivo onde estão no código.',
      'Uso de IA: cada uso está registrado com o que foi gerado, onde entrou e quem validou. Gerado não é entregue.',
      'A honestidade que custa mais: a portaria manda tirar a média das notas dos subindicadores e redistribuir o peso do que não pôde ser aferido. Nosso motor ainda não faz as duas coisas. É trabalho da Semana 5, não segredo.',
    ],
  },
  {
    id: 'ate-o-sr1',
    numero: 8,
    titulo: 'de hoje ao sr1: três semanas',
    apoio:
      'Semana 5: a régua oficial vira a versão 3 da regra. Semana 6: as quatro primeiras telas no ar. SR1: a régua conferida com a SEAB.',
    visual: 'Uma linha do tempo com os três marcos e um compromisso em cada.',
    segundos: 30,
    quemFala: 'fernando',
    notas: [
      'Semana 5, arquitetura: carregar a portaria no motor como regra versão 3, com gradação por subindicador, a redistribuição do artigo 8º e o prazo de recurso do artigo 9º.',
      'Semana 6: as quatro primeiras telas do sistema liberadas no site para qualquer visitante, e o pitch ensaiado dentro do tempo.',
      'SR1: conferir a régua contra a planilha anonimizada com a SEAB, fora do repositório, e registrar o retorno da banca no diário de bordo.',
    ],
  },
  {
    id: 'fechamento',
    numero: 9,
    titulo: 'prumo',
    apoio: 'o registro, o sistema e este pitch estão no ar.',
    visual: 'Wordmark, o endereço do site e a pergunta para a banca.',
    segundos: 15,
    quemFala: 'gabriel',
    notas: [
      'Tudo que mostramos está no endereço da tela: o registro semanal, o sistema e este pitch, com o roteiro e a portaria.',
      'Obrigado. Ficamos para as perguntas.',
    ],
  },
] as const satisfies readonly Slide[]

export type SlideId = (typeof SLIDES)[number]['id']

/* -------------------------------------------------------------------------
   O TEXTO DE CADA VISUAL

   Curto de propósito. O que foi cortado daqui não sumiu: está nas `notas` do
   slide correspondente, que é onde a explicação sempre deveria ter morado.
------------------------------------------------------------------------- */

/** Slide 2: o fluxo do art. 7º da portaria, com o ponto de quebra marcado. */
export interface EtapaDoMes {
  readonly quem: string
  readonly oQue: string
  /** A etapa em que o processo quebra hoje. Uma só, e ela ganha o acento. */
  readonly quebra?: boolean
}

export const ETAPAS_DO_MES: readonly EtapaDoMes[] = [
  { quem: 'unidades', oQue: 'mandam os números' },
  { quem: 'SECOGE', oQue: 'recebe até o dia 20' },
  { quem: 'comissão', oQue: 'consolida à mão, em planilha', quebra: true },
  { quem: 'SEGTES', oQue: 'pede o pagamento' },
  { quem: 'SEPLAGTD', oQue: 'paga na folha' },
]

/** Slide 3: as três personas da Semana 2. Papéis, nunca pessoas. */
export const PESSOAS = [
  {
    papel: 'quem consolida',
    quem: 'analista da comissão',
    dor: 'teme achar o erro depois do pagamento',
  },
  {
    papel: 'quem informa',
    quem: 'gerente de unidade',
    dor: 'é cobrada por dado que já enviou',
  },
  {
    papel: 'quem é avaliada',
    quem: 'coordenadora',
    dor: 'recebe o valor sem o caminho até ele',
  },
] as const

/** Slide 5: os quatro passos de um número até virar nota. */
export const CAMINHO_DO_NUMERO = [
  { nome: 'subindicador', como: 'o que a unidade preenche' },
  { nome: 'indicador', como: 'a composição, feita pelo motor' },
  { nome: 'meta e peso', como: 'da regra vigente' },
  { nome: 'nota e faixa', como: 'de 0 a 100' },
] as const

/** Slide 5: o que cada papel faz, em três palavras. A tela não é o manual. */
export const PAPEIS_EM_UMA_LINHA = [
  { papel: 'seab', faz: 'fecha o mês' },
  { papel: 'administrador', faz: 'cadastros e trilha' },
  { papel: 'gerente distrital', faz: 'revisa o distrito' },
  { papel: 'gerente de unidade', faz: 'lança os números' },
] as const

/**
 * Slide 6: o rótulo e a legenda de cada número da base. O NÚMERO vem dos dados
 * reais, na hora de renderizar; aqui ficam só as palavras.
 *
 * Os números que aparecem dentro da legenda (quantos distritos, quantos
 * indicadores) são conferidos contra o seed em `pitch.test.ts`. Escrever "3
 * distritos" e a base ter quatro é mentir no palco com cara de precisão.
 */
export const ROTULOS_DA_BASE = {
  unidades: 'unidades',
  subindicadores: 'subindicadores',
  competencias: 'competências',
} as const

export const LEGENDAS_DA_BASE = {
  unidades: '3 distritos, 4 tipos',
  subindicadores: 'em 7 indicadores, 2 versões da regra',
  competencias: 'semente fixa, qualquer um confere',
} as const

/** Slide 7: as quatro contagens, com a legenda mais curta que sustenta cada uma. */
export const ROTULOS_DE_RISCO = {
  stride: 'ameaças STRIDE',
  owasp: 'itens OWASP',
  privacidade: 'princípios de privacidade',
  ia: 'usos de IA',
} as const

export const LEGENDAS_DE_RISCO = {
  stride: 'mapeadas, com mitigação',
  // Interpolado, e não escrito: o número já é conferido contra docs/seguranca.md.
  owasp: `${CONTAGENS_PITCH.owaspParciais} parciais, declarados`,
  privacidade: 'apontam para o código',
  ia: 'todos assinados',
} as const

/** Os compromissos do slide 8, um por marco. Datas vêm do cronograma, nunca daqui. */
export const COMPROMISSOS_ATE_O_SR1 = [
  { ciclo: 's5', compromisso: 'a régua oficial no motor' },
  { ciclo: 's6', compromisso: 'as telas no ar' },
  { ciclo: 'sr1', compromisso: 'a régua conferida com a SEAB' },
] as const

/** Slide 4: quem é a unidade da demonstração, numa linha. */
export const ROTULO_DA_DEMO = 'base sintética, competência fechada'

/**
 * Tudo que o autor escreveu na tela daquele slide, para o teste contar.
 *
 * Se um texto aparece na tela e NÃO passa por aqui, o teto deixa de valer e o
 * slide volta a engordar sem ninguém perceber. É por isso que o componente
 * não tem literal de conteúdo.
 */
export function textoNaTela(id: SlideId): readonly string[] {
  const slide = SLIDES.find((s) => s.id === id)
  if (!slide) throw new Error(`Slide desconhecido: ${id}`)
  const base = [slide.titulo, slide.apoio]

  switch (id) {
    case 'problema':
      return [
        ...base,
        ...ETAPAS_DO_MES.flatMap((e) => (e.quebra ? [e.quem, e.oQue, 'aqui quebra'] : [e.quem, e.oQue])),
      ]
    case 'quem-sofre':
      return [...base, ...PESSOAS.flatMap((p) => [p.papel, p.quem, p.dor])]
    case 'ideia':
      // A frase de apoio não aparece neste slide: a demonstração ocupa a tela.
      return [slide.titulo, ROTULO_DA_DEMO]
    case 'como-funciona':
      return [
        ...base,
        ...CAMINHO_DO_NUMERO.flatMap((p) => [p.nome, p.como]),
        'quem',
        ...PAPEIS_EM_UMA_LINHA.flatMap((p) => [p.papel, p.faz]),
      ]
    case 'dados':
      return [
        ...base,
        ...Object.values(ROTULOS_DA_BASE),
        ...Object.values(LEGENDAS_DA_BASE),
        FRASE_DO_MODELO,
      ]
    case 'riscos':
      return [...base, ...Object.values(ROTULOS_DE_RISCO), ...Object.values(LEGENDAS_DE_RISCO)]
    case 'ate-o-sr1':
      return [...base, ...COMPROMISSOS_ATE_O_SR1.map((c) => c.compromisso)]
    default:
      return base
  }
}

/** Slide 6: a comparação que o modelo perde, dita em uma linha. */
export const FRASE_DO_MODELO =
  'o classificador de meta perde para o palpite majoritário, e isso está publicado'

/** Quantas palavras aquele slide põe na tela. */
export function palavrasNaTela(id: SlideId): number {
  return textoNaTela(id)
    .join(' ')
    .split(/\s+/)
    .filter((palavra) => /[a-zA-Zà-úÀ-Ú0-9]/.test(palavra)).length
}

/** `0:35`, `4:55`. Sem hora: o pitch não chega lá. */
export function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}

/** Em que segundo do pitch o slide de índice `indice` deve começar. */
export function inicioDoSlide(indice: number): number {
  return SLIDES.slice(0, indice).reduce((soma, slide) => soma + slide.segundos, 0)
}

/** Quanto tempo cada pessoa fala, somando os slides dela. */
export function tempoPorIntegrante(): ReadonlyMap<IntegranteId, number> {
  const mapa = new Map<IntegranteId, number>()
  for (const slide of SLIDES) {
    mapa.set(slide.quemFala, (mapa.get(slide.quemFala) ?? 0) + slide.segundos)
  }
  return mapa
}
