/**
 * Identidade do produto. Trocar o nome aqui troca em todo o site.
 */
export const PRODUTO = {
  nome: 'Prumo',
  subtitulo: 'Gratificação por desempenho da SESAU Recife',
  descricao:
    'Registro do projeto e MVP do sistema de cálculo da gratificação por desempenho da Secretaria de Saúde do Recife.',
  /** Por que este nome: fio de prumo é o instrumento que garante o alinhamento correto. */
  origemDoNome:
    'Prumo é aquele peso na ponta de um fio que o pedreiro usa para ver se a parede está reta. É isso que o projeto quer ser para essa conta: o jeito simples de ver se está tudo no lugar.',
} as const

export const INSTITUICAO = {
  escola: 'CESAR School',
  curso: 'Sistemas de Informação',
  periodo: '2026.2',
  equipe: 'Equipe 2',
} as const

export const CLIENTE = {
  orgao: 'Secretaria de Saúde do Recife (SESAU)',
  area: 'Secretaria Executiva de Atenção Básica (SEAB), com a SECOGE',
} as const

/**
 * O QUE É ISSO, em três frases.
 *
 * Nasceu de uma reclamação certeira do dono do projeto: "até agora eu não
 * entendi o que esse projeto faz". O site explicava o problema, a equipe, o
 * método e a arquitetura, e não dizia em lugar nenhum, em português de gente,
 * o que o Prumo é. Isto vai logo abaixo do título, antes de qualquer outra
 * coisa. Se um visitante ler só isto, ele já entendeu.
 */
export const O_QUE_E = [
  'A prefeitura do Recife paga um bônus para quem cuida bem dos postos de saúde.',
  'Hoje essa conta é feita à mão, numa planilha, e quase ninguém consegue conferir.',
  'O Prumo é um sistema que faz essa conta e mostra, número por número, de onde cada resultado veio.',
] as const

/**
 * O problema em três linhas — abre o registro e o pitch.
 */
export const PROBLEMA = [
  'Desde 2023, a prefeitura do Recife paga um extra no salário de quem dirige um posto de saúde e bate as metas do mês. As metas estão num documento oficial, chamado portaria.',
  'Todo mês, dezenas de números de várias áreas viram uma nota para cada gestor. Hoje essa conta é feita à mão, numa planilha.',
  'O resultado: erros difíceis de achar, contas difíceis de conferir, e um processo que depende da memória de poucas pessoas.',
] as const

export const PERGUNTA_DO_PROJETO =
  'Como tornar o cálculo da gratificação confiável, transparente, sustentável e auditável?'

/**
 * OS OBJETIVOS DO PROJETO: um geral e quatro específicos.
 *
 * Nascem aqui, e não dentro de um ciclo, porque objetivo de projeto não é
 * entrega de semana: ele atravessa o semestre inteiro e é lido por três
 * consumidores que não podem divergir — o slide do pitch, a seção do site e o
 * documento do registro.
 *
 * NÃO CONFUNDIR com os "Objetivos SMART" da Semana 2 (`#doc-s2-objetivos`).
 * Aqueles são metas de ENTREGA da disciplina, com data de marco: ter o motor
 * coberto por testes até a Semana 6, coletar feedback na Semana 11. Estes aqui
 * dizem o que o PRODUTO tem de fazer. Os dois convivem, e o documento do ciclo
 * do Kick-off explica a diferença para a banca não ler duas versões da mesma
 * coisa.
 *
 * A linguagem é a mesma do pitch: palavra que qualquer um entende, porque
 * estes textos vão para a tela e são lidos em voz alta por seis pessoas que
 * não estão todas dentro de cada parte do projeto.
 */
export const OBJETIVO_GERAL =
  'Tirar o cálculo da gratificação da planilha e entregar um sistema em que a conta de cada nota fica aberta: qualquer pessoa refaz o número e vê de onde ele veio.'

export interface ObjetivoEspecifico {
  /** Três a cinco palavras: é o que cabe no slide. */
  readonly resumo: string
  /** A frase inteira, para o documento e para a seção do site. */
  readonly detalhe: string
  /** Onde a gente promete ter isso de pé. Texto, não data: a data vem do cronograma. */
  readonly quando: string
}

export const OBJETIVOS_ESPECIFICOS: readonly ObjetivoEspecifico[] = [
  {
    resumo: 'a regra como dado',
    detalhe:
      'Guardar a regra da portaria fora do código, com versão, para que mudança de regra deixe de ser mudança de programa e o mês já fechado continue mostrando o mesmo resultado.',
    quando: 'Semana 5',
  },
  {
    resumo: 'a conta sempre aberta',
    detalhe:
      'Mostrar, em toda tela que exibe um resultado, a conta inteira que levou até ele: o que a unidade informou, o alvo, o peso e quanto cada item somou na nota.',
    quando: 'SR1',
  },
  {
    resumo: 'nada muda sem registro',
    detalhe:
      'Registrar quem mudou o quê, quando, e qual era o valor antes, sem apagar nada, para que qualquer resultado contestado possa ser refeito passo a passo.',
    quando: 'Semana 9',
  },
  {
    resumo: 'cada um vê o que é seu',
    detalhe:
      'Separar o que cada um dos quatro papéis do processo pode ver e fazer, de modo que quem envia o número não seja quem escolhe o alvo.',
    quando: 'SR1',
  },
  {
    resumo: 'conferido com o cliente',
    detalhe:
      'Provar com a Secretaria que a conta do sistema bate com a conta da planilha que eles usam hoje, e registrar as diferenças que aparecerem.',
    quando: 'Semana 11',
  },
]

/**
 * URL da pasta do Drive da equipe. Configurável por env var: enquanto não
 * estiver definida, o link simplesmente não aparece para o visitante e o
 * painel admin avisa que falta configurar.
 */
export const URL_DRIVE = process.env.NEXT_PUBLIC_DRIVE_URL ?? ''

/** Repositório do projeto — usado como evidência de código nos ciclos. */
export const URL_REPOSITORIO =
  process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/highgroundagency/projeto-6'

/**
 * O endereço público do site: o que o slide de fechamento do pitch mostra e o
 * que a banca digita depois. O padrão é o deploy da Vercel a partir de `main`.
 */
export const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://projeto6-si.vercel.app'

/** O mesmo endereço sem o protocolo, para caber numa tela e ser lido em voz alta. */
export const ENDERECO_SITE = URL_SITE.replace(/^https?:\/\//, '').replace(/\/$/, '')
