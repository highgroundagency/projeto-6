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
    'Fio de prumo: o instrumento simples que diz se algo está no lugar certo. É o que falta ao cálculo da gratificação hoje.',
} as const

export const INSTITUICAO = {
  escola: 'CESAR School',
  curso: 'Sistemas de Informação',
  periodo: '2026.2',
  equipe: 'Equipe 1',
} as const

export const CLIENTE = {
  orgao: 'Secretaria de Saúde do Recife (SESAU)',
  area: 'Comissão de Avaliação de Metas (CAM)',
} as const

/**
 * O problema em três linhas — abre o registro e o pitch.
 */
export const PROBLEMA = [
  'Desde 2023 a SESAU paga gratificação variável a gestores, supervisores e coordenadores com base em indicadores definidos em portaria.',
  'São dezenas de indicadores, várias áreas responsáveis e múltiplas regras de cálculo, consolidados manualmente em planilhas pela CAM.',
  'O resultado é um processo frágil: inconsistências, baixa rastreabilidade, manutenção difícil e dependência do conhecimento de poucas pessoas.',
] as const

export const PERGUNTA_DO_PROJETO =
  'Como tornar o cálculo da gratificação confiável, transparente, sustentável e auditável?'

/**
 * URL da pasta do Drive da equipe. Configurável por env var: enquanto não
 * estiver definida, o link simplesmente não aparece para o visitante e o
 * painel admin avisa que falta configurar.
 */
export const URL_DRIVE = process.env.NEXT_PUBLIC_DRIVE_URL ?? ''
