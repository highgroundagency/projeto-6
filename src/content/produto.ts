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
  area: 'Comissão de Avaliação de Metas (CAM)',
} as const

/**
 * O problema em três linhas — abre o registro e o pitch.
 */
export const PROBLEMA = [
  'Desde 2023, a Secretaria de Saúde do Recife paga um extra no salário de gestores quando as metas da saúde são atingidas. As metas estão num documento oficial, a portaria.',
  'Todo mês, dezenas de números vindos de várias áreas precisam virar uma nota para cada gestor. Hoje essa conta é feita à mão, em planilhas.',
  'O resultado: erros difíceis de achar, contas difíceis de conferir, e um processo que depende da memória de poucas pessoas.',
] as const

export const PERGUNTA_DO_PROJETO =
  'Como tornar o cálculo da gratificação confiável, transparente, sustentável e auditável?'

/**
 * URL da pasta do Drive da equipe. Configurável por env var: enquanto não
 * estiver definida, o link simplesmente não aparece para o visitante e o
 * painel admin avisa que falta configurar.
 */
export const URL_DRIVE = process.env.NEXT_PUBLIC_DRIVE_URL ?? ''

/** Repositório do projeto — usado como evidência de código nos ciclos. */
export const URL_REPOSITORIO =
  process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/highgroundagency/projeto-6'
