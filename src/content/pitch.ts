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
 * PALAVRA DIFÍCIL É PALAVRA FORA. Quem apresenta são os seis, e nem todos
 * estão dentro de cada parte do projeto: a pessoa precisa ENTENDER o slide
 * enquanto lê. Então nada de "consolidar", "régua", "aplicabilidade",
 * "homologar" ou "memória de cálculo" na tela. Onde o termo técnico vale
 * ponto com a banca (STRIDE, OWASP), ele entra entre parênteses, depois da
 * palavra que qualquer um entende. O mesmo vale para as notas: elas são
 * faladas em voz alta, e ninguém lê bonito o que não entende.
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
  usosDeIa: 42,
} as const

export const SLIDES = [
  {
    id: 'capa',
    numero: 1,
    titulo: 'prumo',
    apoio: 'o cálculo da gratificação, aberto para qualquer um conferir',
    visual: 'Wordmark, uma linha, e a pílula do marco: kick-off, data e equipe.',
    segundos: 5,
    quemFala: 'gabriel',
    notas: [
      'Bom dia. Somos a Equipe 2, e este é o Prumo.',
      'Em cinco minutos: qual é o problema, quem sofre com ele, o que já construímos e para onde vamos.',
    ],
  },
  {
    id: 'problema',
    numero: 2,
    titulo: 'todo mês, uma conta feita à mão',
    apoio:
      'A prefeitura paga um extra no salário de quem bate as metas da saúde. A regra está num documento oficial. A conta está numa planilha.',
    visual: 'O caminho do dinheiro em cinco passos, com o ponto que quebra em destaque.',
    segundos: 35,
    quemFala: 'gabriel',
    notas: [
      'Desde 2023, quem dirige uma unidade de saúde no Recife pode receber um extra no salário quando bate as metas do mês.',
      'As metas estão numa portaria, que é o documento oficial da prefeitura. Ela diz o que medir, quanto vale cada coisa e qual é o alvo.',
      'O caminho é este da tela: as unidades mandam os números, a secretaria junta, uma comissão confere, e o pagamento entra na folha.',
      'O problema está no meio: a conferência é feita à mão, numa planilha. A regra está escrita; a conta, não.',
    ],
  },
  {
    id: 'quem-sofre',
    numero: 3,
    titulo: 'três pessoas, o mesmo número',
    apoio: 'Ninguém consegue dizer de onde veio esse número sem abrir a planilha de outra pessoa.',
    visual: 'Três cartões, um por pessoa afetada, com o medo de cada uma.',
    segundos: 40,
    quemFala: 'matheus',
    notas: [
      'Essas três pessoas não são inventadas por nós: saíram do caso e foram confirmadas na conversa com o cliente, em agosto. São papéis, não gente de verdade.',
      'A primeira fecha a conta do mês. Ela mexe na planilha há três ciclos e é quem todo mundo procura quando alguém reclama do resultado.',
      'A segunda manda os números da unidade dela, sempre em cima do prazo, no meio de outras dez tarefas.',
      'A terceira recebe o valor no fim. Ela vê quanto ganhou e não vê como chegaram naquele número. É por ela que este projeto existe.',
    ],
  },
  {
    id: 'ideia',
    numero: 4,
    titulo: 'a nota com a conta aberta',
    apoio: 'Isto é o sistema rodando agora, não uma imagem.',
    visual: 'A nota e a conta inteira, do sistema de verdade, para uma unidade de teste.',
    segundos: 45,
    quemFala: 'joao-pedro',
    notas: [
      'O que está na tela é o sistema mesmo, rodando agora, com dados de teste. Nenhuma pessoa real aparece aqui.',
      'Em cima, a nota do mês: 86,67. Do lado, quanto isso vale em dinheiro.',
      'Embaixo, a conta inteira. Cada linha é uma coisa que a unidade informou, com o alvo dela, quanto ela vale e quanto entrou na nota.',
      'A última linha fecha a conta na frente de todo mundo. Qualquer pessoa consegue refazer essa continha no papel. É isso que a planilha não dá.',
      'Se faltar internet no dia, o PDF que a gente baixou antes tem esta mesma tela.',
    ],
  },
  {
    id: 'como-funciona',
    numero: 5,
    titulo: 'cada mês guarda a regra que usou',
    apoio: 'Se a regra mudar, o mês antigo continua igual.',
    visual: 'O caminho de um número em quatro passos, e quem faz o quê.',
    segundos: 45,
    quemFala: 'joao-henrique',
    notas: [
      'A regra não está escondida dentro do código: ela é um dado, com versão, igual a um documento.',
      'Quando a prefeitura mudar a portaria, a gente cria uma versão nova. Os meses que já fecharam continuam mostrando o mesmo resultado de antes, porque cada mês aponta para a versão que usou.',
      'O caminho de um número é o da tela: a unidade digita, o sistema calcula, a regra do mês diz qual é o alvo e quanto vale, e sai a nota de 0 a 100.',
      'São quatro pessoas no processo, e cada uma só faz a parte dela. Quem manda o número não escolhe o alvo.',
      'Toda mudança fica gravada com autor, data e o valor de antes. Nada é apagado.',
    ],
  },
  {
    id: 'dados',
    numero: 6,
    titulo: 'nenhum dado real. ainda.',
    apoio:
      'Hoje o sistema roda com dados inventados por um programa. Qualquer pessoa roda de novo e vê os mesmos números.',
    visual: 'O tamanho da base de teste, e o que os modelos acertam e erram.',
    segundos: 40,
    quemFala: 'rafael',
    notas: [
      'Tudo que vocês viram na tela anterior veio de um gerador que a gente escreveu. Ele usa sempre a mesma semente, então quem rodar de novo vê exatamente os mesmos números.',
      'Isso é de propósito: o repositório é público, e dado de servidor da prefeitura não entra nele.',
      'Na parte de inteligência artificial, treinamos quatro modelos fora do sistema. Publicamos cada um ao lado do resultado do chute mais simples possível.',
      'Um deles perde para o chute. A gente deixou publicado do mesmo jeito, porque esconder isso seria enganar.',
      'E nada do que o modelo diz entra na conta do dinheiro. A conta é a da portaria, sempre.',
    ],
  },
  {
    id: 'riscos',
    numero: 7,
    titulo: 'o que pode dar errado, dito antes',
    apoio:
      'O login é de faz de conta, o banco de dados está desligado e a conta ainda usa a regra que deduzimos.',
    visual: 'Quatro contagens do que já foi mapeado, cada uma com o estado dela.',
    segundos: 40,
    quemFala: 'fernando',
    notas: [
      'A gente prefere dizer o que falta antes que alguém pergunte.',
      'Em segurança, listamos as ameaças uma a uma e dissemos o que já está resolvido e o que não está.',
      'Em privacidade, um sistema que decide salário entra na LGPD. Cada cuidado que tomamos aponta para o arquivo onde ele está no código.',
      'Em uso de inteligência artificial, cada linha tem o que foi gerado, onde entrou e o nome de quem conferiu.',
      'E a mais cara de admitir: a portaria oficial chegou esta semana, e ela manda fazer duas contas de um jeito um pouco diferente do nosso. Vamos arrumar na semana que vem. Preferimos falar isso aqui a ser pegos depois.',
    ],
  },
  {
    id: 'ate-o-sr1',
    numero: 8,
    titulo: 'de hoje ao sr1: três semanas',
    apoio: 'Um compromisso por semana, e todos com data.',
    visual: 'Os três marcos até o SR1, com data e compromisso.',
    segundos: 30,
    quemFala: 'fernando',
    notas: [
      'Semana que vem: colocar a regra oficial da portaria dentro do sistema, como uma versão nova.',
      'Na outra: as primeiras telas no ar para qualquer pessoa que abrir o site.',
      'Até o SR1: sentar com a secretaria e conferir a regra contra a planilha real que eles nos mandaram.',
      'O que a banca disser hoje entra no diário de bordo e orienta essas três semanas.',
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
      'Tudo que mostramos está nesse endereço: o diário do projeto, o sistema e este pitch.',
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

/**
 * Slide 2: o caminho do dinheiro, do jeito que a portaria manda (art. 7º).
 *
 * Os nomes das secretarias saíram da tela de propósito: SECOGE e SEGTES não
 * dizem nada para quem está na plateia, e travam quem apresenta. Elas estão
 * nas notas, para quem perguntar.
 */
export interface EtapaDoMes {
  readonly quem: string
  readonly oQue: string
  /** A etapa em que o processo quebra hoje. Uma só, e ela ganha o acento. */
  readonly quebra?: boolean
}

export const ETAPAS_DO_MES: readonly EtapaDoMes[] = [
  { quem: 'as unidades', oQue: 'mandam os números' },
  { quem: 'a secretaria', oQue: 'junta tudo até o dia 20' },
  { quem: 'uma comissão', oQue: 'confere na planilha', quebra: true },
  { quem: 'o setor de pessoal', oQue: 'pede o pagamento' },
  { quem: 'a folha', oQue: 'paga no salário' },
]

/** Slide 3: as três pessoas afetadas. Papéis, nunca gente de verdade. */
export const PESSOAS = [
  { papel: 'quem fecha a conta', quem: 'a analista', dor: 'tem medo de errar uma fórmula' },
  {
    papel: 'quem manda os números',
    quem: 'a gerente da unidade',
    dor: 'é cobrada por dado que já enviou',
  },
  {
    papel: 'quem recebe o valor',
    quem: 'a coordenadora',
    dor: 'vê o resultado, não vê a conta',
  },
] as const

/** Slide 5: o caminho de um número até virar nota. */
export const CAMINHO_DO_NUMERO = [
  { nome: 'o número', como: 'a unidade digita' },
  { nome: 'a conta', como: 'o sistema faz sozinho' },
  { nome: 'o alvo e o peso', como: 'vêm da regra do mês' },
  { nome: 'a nota', como: 'de 0 a 100' },
] as const

/** Slide 5: quem faz o quê, em três palavras. A tela não é o manual. */
export const PAPEIS_EM_UMA_LINHA = [
  { papel: 'a coordenação', faz: 'fecha o mês' },
  { papel: 'o administrador', faz: 'cuida dos cadastros' },
  { papel: 'o gerente do distrito', faz: 'confere as unidades' },
  { papel: 'o gerente da unidade', faz: 'manda os números' },
] as const

/**
 * Slide 6: o rótulo e a legenda de cada número da base. O NÚMERO vem dos dados
 * reais, na hora de renderizar; aqui ficam só as palavras.
 *
 * Os números escritos dentro da legenda são conferidos contra o gerador em
 * `pitch.test.ts`. Dizer "3 distritos" e a base ter quatro é mentir no palco
 * com cara de precisão.
 */
export const ROTULOS_DA_BASE = {
  unidades: 'unidades',
  subindicadores: 'itens medidos',
  competencias: 'meses',
} as const

export const LEGENDAS_DA_BASE = {
  unidades: 'em 3 distritos, de 4 tipos',
  subindicadores: 'dentro de 7 indicadores',
  competencias: 'sempre com os mesmos números',
} as const

/**
 * Slide 7: as quatro contagens.
 *
 * O rótulo é a palavra que qualquer um entende; a sigla que vale ponto com a
 * banca fica na legenda, entre parênteses.
 */
export const ROTULOS_DE_RISCO = {
  stride: 'ameaças de segurança',
  owasp: 'falhas mais comuns',
  privacidade: 'cuidados com dado pessoal',
  ia: 'usos de IA',
} as const

export const LEGENDAS_DE_RISCO = {
  stride: 'listadas uma a uma (STRIDE)',
  // Interpolado, e não escrito: o número já é conferido contra docs/seguranca.md.
  owasp: `${CONTAGENS_PITCH.owaspParciais} ainda no meio (OWASP)`,
  privacidade: 'cada um aponta o arquivo',
  ia: 'todos com nome de quem conferiu',
} as const

/** Os compromissos do slide 8, um por marco. Datas vêm do cronograma, nunca daqui. */
export const COMPROMISSOS_ATE_O_SR1 = [
  { ciclo: 's5', compromisso: 'a regra oficial dentro do sistema' },
  { ciclo: 's6', compromisso: 'as primeiras telas no ar' },
  { ciclo: 'sr1', compromisso: 'a regra conferida com a secretaria' },
] as const

/** Slide 4: quem é a unidade da demonstração, numa linha. */
export const ROTULO_DA_DEMO = 'dados de teste, nenhuma pessoa real, mês já fechado'

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

/** Slide 6: o modelo perde para o chute, e a gente diz isso em voz alta. */
export const FRASE_DO_MODELO =
  'nossa previsão erra mais que o chute mais simples, e publicamos assim mesmo'

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
