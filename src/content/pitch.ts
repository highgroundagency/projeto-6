import {
  ALTERNATIVA_ESCOLHIDA,
  BENCHMARKING,
  CONCLUSAO_CURTA,
  CSD,
  PONTO_DE_COMPARACAO,
  RAZOES_DA_ESCOLHA,
  SWOT,
  TECNICAS_DE_IDEACAO,
} from '@/content/analises'
import type { IntegranteId } from '@/content/equipe'
import { OBJETIVO_GERAL, OBJETIVOS_ESPECIFICOS } from '@/content/produto'

/**
 * O PITCH DO KICK-OFF, como dado.
 *
 * Fonte única do roteiro: a rota `/pitch` renderiza estes slides, o registro
 * do ciclo `ko` mostra a mesma tabela, `docs/pitch-kickoff.md` é gerado a partir
 * dela e `pitch.test.ts` confere que a soma fecha no tempo, que todo mundo que
 * já estava na equipe fala e
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
 * PALAVRA DIFÍCIL É PALAVRA FORA. Quem apresenta são seis pessoas, e nem todas
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

/**
 * 9:00, dentro dos dez minutos que o professor liberou.
 *
 * A diretriz escrita diz cinco minutos, mais cinco para terminar se for
 * preciso, e a primeira versão deste deck fechava em 4:55. O briefing oficial,
 * que chegou na véspera, cobra sete critérios, e três deles não apareciam em
 * slide nenhum: objetivos, as análises e a ideação. Com a permissão dos dez
 * minutos, a escolha foi crescer em vez de cortar o que já estava de pé.
 *
 * Sobra um minuto inteiro de margem, e essa margem é de propósito: ensaio que
 * fecha exatamente no limite estoura no dia.
 */
export const DURACAO_PITCH_SEGUNDOS = 540

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
 * Setenta é a conta de quem fala: um slide dura pouco mais de meio minuto e a
 * plateia lê a uma velocidade que não dá para competir com a voz. Passou
 * disso, a tela virou teleprompter. O teto NÃO subiu quando o deck dobrou de
 * tamanho: mais slides, não mais texto por slide.
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
  usosDeIa: 47,
} as const

export const SLIDES = [
  {
    id: 'capa',
    numero: 1,
    titulo: 'prumo',
    apoio: 'o cálculo da gratificação, aberto para qualquer um conferir',
    visual: 'Wordmark, a pílula do marco e os nomes da equipe inteira.',
    segundos: 20,
    quemFala: 'gabriel',
    notas: [
      'Bom dia. Somos a Equipe 2 de Sistemas de Informação, e este é o Prumo.',
      'Somos sete: o Kerry entrou nesta semana, e hoje apresentam os seis que vinham desde agosto.',
      'Estamos todos aqui, e qualquer um de nós responde qualquer pergunta no fim.',
      'O cliente é a Secretaria de Saúde do Recife.',
    ],
  },
  {
    id: 'roteiro',
    numero: 2,
    titulo: 'o caminho de hoje',
    apoio: 'sete paradas, nove minutos.',
    visual: 'As sete paradas do roteiro, numeradas.',
    segundos: 10,
    quemFala: 'fernando',
    notas: [
      'O caminho é este: o problema, o que a gente quer entregar, quem sofre com isso, o que a gente estudou, a ideia que venceu, o sistema rodando e o prazo.',
    ],
  },
  {
    id: 'problema',
    numero: 3,
    titulo: 'todo mês, uma conta feita à mão',
    apoio:
      'A prefeitura paga um extra no salário de quem bate as metas da saúde. A regra está num documento oficial. A conta está numa planilha.',
    visual: 'O caminho do dinheiro em cinco passos, com o ponto que quebra em destaque.',
    segundos: 40,
    quemFala: 'gabriel',
    notas: [
      'Desde 2023, quem dirige uma unidade de saúde no Recife pode receber um extra no salário quando bate as metas do mês.',
      'As metas estão numa portaria, que é o documento oficial da prefeitura. Ela diz o que medir, quanto vale cada coisa e qual é o alvo.',
      'O caminho é este da tela: as unidades mandam os números, a secretaria junta, uma comissão confere, e o pagamento entra na folha.',
      'O problema está no meio: a conferência é feita à mão, numa planilha. A regra está escrita; a conta, não.',
    ],
  },
  {
    id: 'evidencias',
    numero: 4,
    titulo: 'não é impressão nossa',
    apoio: 'cada coisa que a gente diz aqui tem de onde ter saído.',
    visual: 'As três fontes da pesquisa, cada uma com a data.',
    segundos: 30,
    quemFala: 'matheus',
    notas: [
      'A primeira fonte é a portaria: o documento oficial que criou a gratificação, publicado no diário oficial do Recife. Ele está copiado inteiro dentro do nosso repositório.',
      'A segunda é o caso, escrito pela escola junto com o órgão, que descreve o processo de hoje e a tentativa anterior que foi abandonada.',
      'A terceira é a conversa: sentamos com a secretaria em 22 de agosto, e o que mudou ali está escrito na ata, no site.',
      'Nada do que vem a seguir é achismo nosso. Tudo aponta para uma dessas três.',
    ],
  },
  {
    id: 'objetivos',
    numero: 5,
    titulo: 'o que o sistema tem que fazer',
    apoio: OBJETIVO_GERAL,
    visual: 'O objetivo geral e os cinco específicos, cada um com o prazo.',
    segundos: 35,
    quemFala: 'gabriel',
    notas: [
      'Em uma frase: tirar essa conta da planilha e deixar ela aberta.',
      'Aberta quer dizer que qualquer pessoa refaz o número no papel e vê de onde ele veio.',
      'Embaixo, o que isso exige, com prazo em cada um: a regra virar dado com versão, a conta aparecer em toda tela que mostra resultado, nada mudar sem ficar registrado, cada papel ver só o que é dele, e a nossa conta bater com a planilha do cliente.',
      'O último é o que vale mais: enquanto a conta do sistema não bater com a deles, o resto é promessa.',
    ],
  },
  {
    id: 'quem-sofre',
    numero: 6,
    titulo: 'três pessoas, o mesmo número',
    apoio: '“Se mexer numa fórmula, tenho que conferir a planilha inteira de novo.”',
    visual: 'A fala do mapa de empatia e os três cartões de quem é afetado.',
    segundos: 40,
    quemFala: 'matheus',
    notas: [
      'Essa frase é do mapa de empatia da analista, a pessoa que carrega o processo hoje. Ela resume o medo que move este projeto.',
      'As três pessoas da tela não foram inventadas por nós: saíram do caso e foram confirmadas na conversa com o cliente. São papéis, não gente de verdade.',
      'A primeira fecha a conta do mês, e é quem todo mundo procura quando alguém reclama do resultado.',
      'A segunda manda os números da unidade, sempre em cima do prazo, no meio de outras dez tarefas.',
      'A terceira recebe o valor no fim. Ela vê quanto ganhou e não vê como chegaram naquele número. É por ela que este projeto existe.',
    ],
  },
  {
    id: 'csd',
    numero: 7,
    titulo: 'o que sabemos, e o que ainda é chute',
    apoio: 'certeza tem fonte. aposta a gente declara. pergunta a gente leva para o cliente.',
    visual: 'As três colunas da matriz, com a contagem e dois exemplos de cada.',
    segundos: 30,
    quemFala: 'matheus',
    notas: [
      'Separamos tudo o que sabemos em três colunas, e cada linha da primeira tem a fonte do lado: artigo da portaria, o caso ou a ata da reunião. Certeza sem origem é chute com voz firme.',
      'No meio, o que a gente assumiu para poder andar. Está escrito que é aposta, e está escrito dentro do código também.',
      'Na direita, o que ainda não sabemos, e a quem vamos perguntar. A maior delas: como redistribuir o peso quando falta um número.',
    ],
  },
  {
    id: 'referencias',
    numero: 8,
    titulo: 'quem mais resolve isso, e o que joga a favor',
    apoio: 'cinco referências olhadas de perto, e o retrato honesto do projeto.',
    visual: 'As referências com o veredito, e os quatro quadrantes da SWOT.',
    segundos: 35,
    quemFala: 'fernando',
    notas: [
      'Antes de decidir construir, olhamos o que já existe: painéis de transparência de prefeituras, sistemas de metas do SUS, ferramentas de acompanhamento de objetivos, e a própria planilha de hoje.',
      'Cada uma resolve um pedaço. Nenhuma junta as três coisas que este caso precisa ao mesmo tempo: regra com versão, conta aberta e registro de quem mudou.',
      'Do lado direito, o retrato do projeto (SWOT). A força é ter cliente real com regra escrita. A fraqueza é que ninguém da equipe conhece o processo por dentro.',
      'A ameaça maior está acontecendo: a portaria pode mudar, e de fato ela chegou agora e mexeu no nosso desenho. A gente conta isso daqui a pouco.',
    ],
  },
  {
    id: 'ideacao',
    numero: 9,
    titulo: 'como a gente gerou ideias',
    apoio: 'três dinâmicas numa hora, com a regra de somar antes de criticar.',
    visual: 'As três técnicas, com o tempo e o que cada uma produziu.',
    segundos: 35,
    quemFala: 'joao-pedro',
    notas: [
      'A primeira é escrita e em silêncio: cada um anota três ideias e passa a folha, e quem recebe amplia a do colega. Sem discussão, ninguém é puxado pela opinião de quem falou primeiro.',
      'A segunda é a conversa aberta, juntando o que ficou parecido e dando nome a cada grupo.',
      'A terceira são oito desenhos de tela em oito minutos, cada um sozinho. É de lá que saem as primeiras telas em papel.',
      'De dezoito ideias no papel sobraram oito alternativas de verdade na mesa.',
    ],
  },
  {
    id: 'escolha',
    numero: 10,
    titulo: 'por que essa ideia venceu',
    apoio: ALTERNATIVA_ESCOLHIDA.nome.toLowerCase(),
    visual: 'A alternativa escolhida, as quatro razões e o que ficou de comparação.',
    segundos: 30,
    quemFala: 'joao-pedro',
    notas: [
      'Demos nota de 1 a 5 para cada alternativa em três coisas: o tamanho do impacto, o esforço para fazer e o quanto ela encosta no problema de verdade.',
      'A escolhida ganhou porque ataca a causa e não o sintoma: hoje a regra da portaria só existe dentro de fórmulas de planilha.',
      'O esforço é alto, mas dá para fatiar: lançar, calcular e mostrar a conta cabem até o SR1.',
      'E a planilha melhorada continua na tabela de propósito: ela é contra o que a gente vai medir o ganho, na validação com o cliente.',
    ],
  },
  {
    id: 'wireframes',
    numero: 11,
    titulo: 'do papel para a tela',
    apoio: 'os quatro desenhos que vieram antes, e o que eles viraram.',
    visual: 'Os quatro wireframes, um por tela, com a legenda de cada.',
    segundos: 35,
    quemFala: 'joao-pedro',
    notas: [
      'Estes são os desenhos de baixa fidelidade das quatro telas centrais. Barra cinza no lugar de texto, de propósito: a conversa aqui é sobre onde cada coisa fica, não sobre a frase.',
      'A primeira é onde a unidade digita os números do mês.',
      'A segunda é a nota com a conta inteira embaixo, e é a tela que vocês vão ver rodando no slide seguinte.',
      'A terceira é o painel do distrito: quem já mandou, quem falta.',
      'A quarta é o resultado do gestor, com os meses anteriores do lado.',
    ],
  },
  {
    id: 'ideia',
    numero: 12,
    titulo: 'a nota com a conta aberta',
    apoio: 'Isto é o sistema rodando agora, não uma imagem.',
    visual: 'A nota e a conta inteira, do sistema de verdade, para uma unidade de teste.',
    segundos: 45,
    quemFala: 'joao-henrique',
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
    numero: 13,
    titulo: 'cada mês guarda a regra que usou',
    apoio: 'Se a regra mudar, o mês antigo continua igual.',
    visual: 'O caminho de um número em quatro passos, e quem faz o quê.',
    segundos: 35,
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
    numero: 14,
    titulo: 'nenhum dado real. ainda.',
    apoio:
      'Hoje o sistema roda com dados inventados por um programa. Qualquer pessoa roda de novo e vê os mesmos números.',
    visual: 'O tamanho da base de teste, e o que os modelos acertam e erram.',
    segundos: 30,
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
    numero: 15,
    titulo: 'o que pode dar errado, dito antes',
    apoio:
      'O login é de faz de conta, o banco de dados está desligado e a conta ainda usa a regra que deduzimos.',
    visual: 'Quatro contagens do que já foi mapeado, cada uma com o estado dela.',
    segundos: 30,
    quemFala: 'rafael',
    notas: [
      'A gente prefere dizer o que falta antes que alguém pergunte.',
      'Em segurança, listamos as ameaças uma a uma e dissemos o que já está resolvido e o que não está.',
      'Em privacidade, um sistema que decide salário entra na LGPD. Cada cuidado que tomamos aponta para o arquivo onde ele está no código.',
      'Em uso de inteligência artificial, cada linha tem o que foi gerado, onde entrou e o nome de quem conferiu.',
      'E a mais cara de admitir: a portaria oficial chegou esta semana, e ela manda fazer duas contas de um jeito um pouco diferente do nosso. Vamos arrumar na semana que vem. Preferimos falar isso aqui a ser pegos depois.',
    ],
  },
  {
    id: 'cronograma',
    numero: 16,
    titulo: 'as dezoito semanas, e onde estamos',
    apoio: 'cada entrega tem dono, data e estado, e o quadro inteiro está no site.',
    visual: 'A linha do semestre com os marcos, e as entregas do próximo mês com dono.',
    segundos: 35,
    quemFala: 'fernando',
    notas: [
      'O semestre inteiro está planejado em dezoito semanas, e cada semana tem as entregas que ela precisa produzir.',
      'As quatro primeiras estão fechadas e publicadas no site, com o que foi feito, quem fez e o que travou.',
      'Hoje é o Kick-off. Daqui até o SR1 são três semanas, e cada uma tem um compromisso com data e com nome.',
      'Semana que vem, a regra oficial da portaria entra no sistema. Na outra, as primeiras telas no ar. Até o SR1, sentar com a secretaria e conferir a conta contra a planilha real.',
      'Nada disso está num arquivo separado: o quadro com dono e estado é uma seção do próprio site.',
    ],
  },
  {
    id: 'fechamento',
    numero: 17,
    titulo: 'prumo',
    apoio: 'o registro, os documentos, o sistema e este pitch estão no ar.',
    visual: 'Wordmark, o endereço do site e a pergunta para a banca.',
    segundos: 25,
    quemFala: 'gabriel',
    notas: [
      'Tudo que mostramos está nesse endereço: o diário do projeto semana a semana, os documentos de cada entrega, o sistema e este pitch.',
      'O site tem um índice no topo com as oito seções, na ordem em que vocês pediram.',
      'Obrigado. Ficamos para as perguntas, e qualquer um de nós responde.',
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

/** Slide 2: as sete paradas do roteiro. A ordem é a dos critérios do briefing. */
export const ROTEIRO = [
  'o problema',
  'os objetivos',
  'quem sofre',
  'o que estudamos',
  'a ideia que venceu',
  'o sistema rodando',
  'o prazo',
] as const

/**
 * Slide 4: de onde saiu a pesquisa.
 *
 * O critério de "entendimento do problema" pede evidência, e evidência sem
 * data e sem origem não é evidência. As três fontes que o projeto tem, na
 * ordem em que chegaram.
 */
export const FONTES_DA_PESQUISA = [
  { fonte: 'a portaria', onde: 'diário oficial do Recife, 21/09/2024' },
  { fonte: 'o caso', onde: 'escrito pela escola junto com o órgão' },
  { fonte: 'a conversa', onde: 'reunião com a secretaria, 22/08' },
] as const

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

/** Slide 6: de onde veio a frase do topo. Crédito curto, não explicação. */
export const ROTULO_DO_MAPA = 'do mapa de empatia da analista'

/**
 * Slide 11: o que cada wireframe é.
 *
 * A legenda mora aqui, e não dentro do SVG, porque texto escondido num
 * desenho fura o teto de palavras sem ninguém ver. A ordem é a mesma de
 * `WIREFRAMES` em `src/components/wireframe.tsx`.
 */
export const LEGENDAS_DO_WIREFRAME = [
  'o lançamento do mês',
  'a nota com a conta',
  'o painel do distrito',
  'o resultado do gestor',
] as const

/** Slide 16: os títulos das colunas do quadro de entregas. */
export const COLUNAS_DO_CRONOGRAMA = ['quando', 'o compromisso', 'quem puxa'] as const

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

/**
 * Os compromissos do slide do cronograma, um por marco.
 *
 * Datas vêm do cronograma, nunca daqui: a data é fonte única em
 * `src/lib/cronograma.ts` (regra 2 da casa). O que mora aqui é a promessa e
 * quem a puxa, que é o que o critério de cronograma do briefing exige junto
 * com a atividade e o prazo.
 */
export const COMPROMISSOS_ATE_O_SR1 = [
  { ciclo: 's5', compromisso: 'a regra oficial dentro do sistema', quem: 'joao-henrique' },
  { ciclo: 's6', compromisso: 'as primeiras telas no ar', quem: 'joao-pedro' },
  { ciclo: 'sr1', compromisso: 'a regra conferida com a secretaria', quem: 'matheus' },
] as const satisfies readonly { ciclo: string; compromisso: string; quem: IntegranteId }[]

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
    case 'roteiro':
      return [...base, ...ROTEIRO]
    case 'problema':
      return [
        ...base,
        ...ETAPAS_DO_MES.flatMap((e) => (e.quebra ? [e.quem, e.oQue, 'aqui quebra'] : [e.quem, e.oQue])),
      ]
    case 'evidencias':
      return [...base, ...FONTES_DA_PESQUISA.flatMap((f) => [f.fonte, f.onde])]
    case 'objetivos':
      return [...base, ...OBJETIVOS_ESPECIFICOS.flatMap((o) => [o.resumo, o.quando])]
    case 'quem-sofre':
      return [...base, ROTULO_DO_MAPA, ...PESSOAS.flatMap((p) => [p.papel, p.quem, p.dor])]
    case 'csd':
      // A contagem de cada coluna vem do tamanho da lista, não do autor: ela
      // não entra no teto, do mesmo jeito que o tamanho da base no slide 14.
      return [...base, ...CSD.flatMap((c) => [c.titulo, ...c.itens.slice(0, 2).map((i) => i.resumo)])]
    case 'referencias':
      return [
        ...base,
        ...BENCHMARKING.slice(0, 3).map((r) => r.curto),
        CONCLUSAO_CURTA,
        ...SWOT.flatMap((q) => [q.titulo, q.curto]),
      ]
    case 'ideacao':
      return [...base, ...TECNICAS_DE_IDEACAO.flatMap((t) => [t.nome, t.produtoCurto])]
    case 'escolha':
      return [
        ...base,
        ...RAZOES_DA_ESCOLHA.flatMap((r) => [r.titulo, r.curto]),
        PONTO_DE_COMPARACAO,
      ]
    case 'wireframes':
      return [...base, ...LEGENDAS_DO_WIREFRAME]
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
    case 'cronograma':
      return [
        ...base,
        ...COLUNAS_DO_CRONOGRAMA,
        ...COMPROMISSOS_ATE_O_SR1.map((c) => c.compromisso),
      ]
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
