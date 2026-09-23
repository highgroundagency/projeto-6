import type {
  Aplicabilidade,
  Distrito,
  GraduacaoIndicador,
  GraduacaoSubindicador,
  Indicador,
  Subindicador,
  TipoUnidade,
  Unidade,
} from '@/lib/calculo/tipos'

/**
 * Catálogo sintético da rede: distritos, tipos, unidades, indicadores e
 * subindicadores — a forma que a reunião com o cliente (22/08) descreveu.
 *
 * ATENÇÃO (§2.4): tudo aqui é FICTÍCIO. Nomes de unidade são aves, os
 * distritos são pontos cardeais, e nenhum número, meta ou pessoa vem da SESAU.
 * Quando a planilha real chegar, estes dados são substituídos pelo cadastro
 * feito na própria interface — sem tocar em código.
 */

export const DISTRITOS: readonly Distrito[] = [
  { id: 'ds-leste', nome: 'Distrito Sanitário Leste' },
  { id: 'ds-norte', nome: 'Distrito Sanitário Norte' },
  { id: 'ds-oeste', nome: 'Distrito Sanitário Oeste' },
]

/**
 * Os tipos de unidade que a portaria nomeia.
 *
 * A lista anterior tinha UPA e Policlínica, que a equipe escolheu antes de ler
 * a portaria inteira e que NÃO EXISTEM nela. A planilha do cliente confirmou:
 * os tipos são estes, e ainda trazem porte (USF 1 a 8, MAC 1 a 4, CAPS II/III e
 * CAPS III 24h). O porte fica de fora por enquanto, declarado aqui em vez de
 * escondido: ele multiplica a régua e não muda a forma do motor.
 */
export const TIPOS_UNIDADE: readonly TipoUnidade[] = [
  { id: 'usf', sigla: 'USF', nome: 'Unidade de Saúde da Família' },
  { id: 'ubt', sigla: 'UBT', nome: 'Unidade Básica Tradicional' },
  { id: 'ubt-mista', sigla: 'UBT MISTA', nome: 'Unidade Básica Tradicional Mista' },
  { id: 'caps', sigla: 'CAPS', nome: 'Centro de Atenção Psicossocial' },
  { id: 'cecon', sigla: 'CECON', nome: 'Centro de Convivência' },
  { id: 'ucis', sigla: 'UCIS', nome: 'Unidade de Cuidados Integrais à Saúde' },
  { id: 'mac', sigla: 'MAC', nome: 'Unidade de Média e Alta Complexidade' },
]

/**
 * As doze unidades sintéticas, uma por ave.
 *
 * O `id` é histórico e continua o mesmo de propósito: ele aparece em URL, em
 * teste e em documento de ciclo, e trocá-lo custaria muito para não mudar nada
 * que o visitante veja. O que mudou foi o nome na tela e o TIPO, que agora é um
 * dos sete da portaria.
 */
export const UNIDADES: readonly Unidade[] = [
  { id: 'usf-sabia', nome: 'USF Sabiá', distritoId: 'ds-leste', tipoId: 'usf' },
  { id: 'usf-bem-te-vi', nome: 'USF Bem-te-vi', distritoId: 'ds-leste', tipoId: 'usf' },
  { id: 'caps-colibri', nome: 'CAPS Colibri', distritoId: 'ds-leste', tipoId: 'caps' },
  { id: 'upa-andorinha', nome: 'UBT Andorinha', distritoId: 'ds-leste', tipoId: 'ubt' },
  { id: 'usf-canario', nome: 'USF Canário', distritoId: 'ds-norte', tipoId: 'usf' },
  { id: 'usf-juriti', nome: 'USF Juriti', distritoId: 'ds-norte', tipoId: 'usf' },
  { id: 'caps-rolinha', nome: 'CAPS Rolinha', distritoId: 'ds-norte', tipoId: 'caps' },
  { id: 'poli-garca', nome: 'MAC Garça', distritoId: 'ds-norte', tipoId: 'mac' },
  { id: 'usf-curio', nome: 'USF Curió', distritoId: 'ds-oeste', tipoId: 'usf' },
  { id: 'usf-asa-branca', nome: 'UBT Mista Asa-branca', distritoId: 'ds-oeste', tipoId: 'ubt-mista' },
  { id: 'upa-gaivota', nome: 'UCIS Gaivota', distritoId: 'ds-oeste', tipoId: 'ucis' },
  { id: 'poli-tuim', nome: 'CECON Tuim', distritoId: 'ds-oeste', tipoId: 'cecon' },
]

/**
 * Catálogo GLOBAL de indicadores calculados: sem meta e sem peso, porque isso
 * depende do tipo da unidade e mora na regra versionada (`APLICABILIDADES_*`).
 */
export const INDICADORES: readonly Indicador[] = [
  {
    id: 'acompanhamento',
    nome: 'Famílias acompanhadas pela equipe',
    unidadeMedida: '%',
    direcao: 'maior_melhor',
    fonte: 'Cadastro das equipes',
    periodicidade: 'mensal',
  },
  {
    id: 'pre-natal',
    nome: 'Pré-natal em dia',
    unidadeMedida: '%',
    direcao: 'maior_melhor',
    fonte: 'Sistema de acompanhamento',
    periodicidade: 'mensal',
  },
  {
    id: 'vacinacao',
    nome: 'Vacinação infantil em dia',
    unidadeMedida: '%',
    direcao: 'maior_melhor',
    fonte: 'Sistema de imunização',
    periodicidade: 'mensal',
  },
  {
    id: 'tempo-espera',
    nome: 'Tempo médio de espera pelo atendimento',
    unidadeMedida: 'dias',
    direcao: 'menor_melhor',
    fonte: 'Agenda regulada',
    periodicidade: 'mensal',
  },
  {
    id: 'acolhimento',
    nome: 'Acolhimento com classificação de risco',
    unidadeMedida: '%',
    direcao: 'maior_melhor',
    fonte: 'Prontuário de urgência',
    periodicidade: 'mensal',
  },
  {
    id: 'absenteismo',
    nome: 'Absenteísmo da equipe',
    unidadeMedida: '%',
    direcao: 'menor_melhor',
    fonte: 'Folha de frequência',
    periodicidade: 'mensal',
  },
  {
    id: 'prontuario',
    nome: 'Registro em prontuário eletrônico no dia',
    unidadeMedida: '%',
    direcao: 'maior_melhor',
    fonte: 'Prontuário eletrônico',
    periodicidade: 'mensal',
  },
  {
    // O ÚNICO DE FAIXA IDEAL, e ele existe para o motor ter de encarar o caso.
    // Atender pouco é subtratamento; atender demais, no mesmo mês e para o
    // mesmo usuário, costuma ser procedimento picado para inflar número. Os
    // dois extremos são ruins, e uma régua de duas direções não sabe dizer isso.
    id: 'procedimentos',
    nome: 'Procedimentos por usuário no mês',
    unidadeMedida: 'procedimentos',
    direcao: 'faixa_ideal',
    fonte: 'Prontuário eletrônico',
    periodicidade: 'mensal',
  },
]

/**
 * O que a unidade de fato preenche. 'razao' pede numerador e denominador;
 * 'indice' pede o valor direto.
 */
export const SUBINDICADORES: readonly Subindicador[] = [
  {
    id: 'acompanhamento-familias',
    indicadorId: 'acompanhamento',
    nome: 'Famílias acompanhadas no mês',
    tipo: 'razao',
    rotuloNumerador: 'famílias acompanhadas',
    rotuloDenominador: 'famílias cadastradas',
  },
  {
    id: 'pre-natal-consultas',
    indicadorId: 'pre-natal',
    nome: 'Gestantes com consultas em dia',
    tipo: 'razao',
    rotuloNumerador: 'gestantes com consultas em dia',
    rotuloDenominador: 'gestantes cadastradas',
  },
  {
    id: 'pre-natal-exames',
    indicadorId: 'pre-natal',
    nome: 'Gestantes com exames do trimestre',
    tipo: 'razao',
    rotuloNumerador: 'gestantes com exames em dia',
    rotuloDenominador: 'gestantes cadastradas',
  },
  {
    id: 'vacinacao-polio',
    indicadorId: 'vacinacao',
    nome: 'Esquema de pólio completo',
    tipo: 'razao',
    rotuloNumerador: 'crianças com esquema completo',
    rotuloDenominador: 'crianças cadastradas',
  },
  {
    id: 'vacinacao-penta',
    indicadorId: 'vacinacao',
    nome: 'Esquema pentavalente completo',
    tipo: 'razao',
    rotuloNumerador: 'crianças com esquema completo',
    rotuloDenominador: 'crianças cadastradas',
  },
  {
    id: 'espera-agendada',
    indicadorId: 'tempo-espera',
    nome: 'Dias até a consulta agendada',
    tipo: 'indice',
  },
  {
    id: 'espera-acolhimento',
    indicadorId: 'tempo-espera',
    nome: 'Dias até o primeiro acolhimento',
    tipo: 'indice',
  },
  {
    id: 'acolhimento-classificado',
    indicadorId: 'acolhimento',
    nome: 'Atendimentos com classificação registrada',
    tipo: 'razao',
    rotuloNumerador: 'atendimentos com classificação',
    rotuloDenominador: 'atendimentos realizados',
  },
  {
    id: 'absenteismo-taxa',
    indicadorId: 'absenteismo',
    nome: 'Taxa de faltas do mês',
    tipo: 'indice',
  },
  {
    id: 'prontuario-no-dia',
    indicadorId: 'prontuario',
    nome: 'Atendimentos registrados no mesmo dia',
    tipo: 'razao',
    rotuloNumerador: 'registros feitos no dia',
    rotuloDenominador: 'atendimentos realizados',
  },
  {
    id: 'prontuario-pendencias',
    indicadorId: 'prontuario',
    nome: 'Percentual de registros sem pendência',
    tipo: 'indice',
  },
  {
    id: 'procedimentos-por-usuario',
    indicadorId: 'procedimentos',
    nome: 'Média de procedimentos por usuário no mês',
    tipo: 'indice',
  },
]

/**
 * A tabela que a reunião de 22/08 revelou: a depender do TIPO da unidade, só
 * alguns indicadores valem, e os pesos mudam. O CAPS tem o recorte menor de
 * propósito — foi o exemplo do próprio cliente.
 */
const BASE_V1: readonly Aplicabilidade[] = [
  { tipoUnidadeId: 'usf', indicadorId: 'acompanhamento', meta: 85, peso: 3 },
  { tipoUnidadeId: 'usf', indicadorId: 'pre-natal', meta: 75, peso: 3 },
  { tipoUnidadeId: 'usf', indicadorId: 'vacinacao', meta: 95, peso: 3 },
  { tipoUnidadeId: 'usf', indicadorId: 'absenteismo', meta: 5, peso: 1 },
  { tipoUnidadeId: 'usf', indicadorId: 'prontuario', meta: 90, peso: 2 },

  { tipoUnidadeId: 'caps', indicadorId: 'acolhimento', meta: 90, peso: 3 },
  { tipoUnidadeId: 'caps', indicadorId: 'tempo-espera', meta: 7, peso: 2 },
  { tipoUnidadeId: 'caps', indicadorId: 'absenteismo', meta: 5, peso: 1 },
  { tipoUnidadeId: 'caps', indicadorId: 'prontuario', meta: 85, peso: 2 },

  { tipoUnidadeId: 'upa', indicadorId: 'acolhimento', meta: 95, peso: 3 },
  { tipoUnidadeId: 'upa', indicadorId: 'absenteismo', meta: 6, peso: 1 },
  { tipoUnidadeId: 'upa', indicadorId: 'prontuario', meta: 95, peso: 3 },

  { tipoUnidadeId: 'poli', indicadorId: 'tempo-espera', meta: 30, peso: 3 },
  { tipoUnidadeId: 'poli', indicadorId: 'acolhimento', meta: 85, peso: 2 },
  { tipoUnidadeId: 'poli', indicadorId: 'absenteismo', meta: 5, peso: 1 },
  { tipoUnidadeId: 'poli', indicadorId: 'prontuario', meta: 90, peso: 2 },
]

/**
 * A revisão de abril: além das faixas, a régua de dois tipos muda — é a
 * "regra que muda de ano em ano" acontecendo dentro da própria demonstração.
 */
const BASE_V2: readonly Aplicabilidade[] = BASE_V1.map(
  (aplicabilidade) => {
    if (aplicabilidade.tipoUnidadeId === 'usf' && aplicabilidade.indicadorId === 'prontuario') {
      return { ...aplicabilidade, meta: 95 }
    }
    if (aplicabilidade.tipoUnidadeId === 'poli' && aplicabilidade.indicadorId === 'tempo-espera') {
      return { ...aplicabilidade, meta: 25 }
    }
    return aplicabilidade
  },
)

/**
 * De que tipo NOVO cada tipo antigo virou.
 *
 * As regras v1 e v2 foram escritas quando a rede tinha UPA e Policlínica, dois
 * tipos que a portaria não nomeia. Corrigir a lista de tipos sem tocar nas
 * regras antigas deixaria quatro unidades sem aplicabilidade nenhuma nos meses
 * já publicados, e elas cairiam de nota para zero. Um mês publicado que muda de
 * número é exatamente o defeito que este produto ataca, então as regras antigas
 * são RE-CHAVEADAS: mesma meta, mesmo peso, o nome do tipo corrigido.
 *
 * Um tipo antigo vira dois quando as unidades dele foram para lugares
 * diferentes. Isso é decisão de migração, não de cálculo, e está aqui em vez de
 * num comentário solto porque quem mexer nos tipos de novo precisa vê-la.
 */
const TIPO_ANTIGO_VIROU: Record<string, readonly string[]> = {
  usf: ['usf', 'ubt-mista'],
  caps: ['caps'],
  upa: ['ubt', 'ucis'],
  poli: ['mac', 'cecon'],
}

function rechavear(base: readonly Aplicabilidade[]): readonly Aplicabilidade[] {
  return base.flatMap((aplicabilidade) =>
    (TIPO_ANTIGO_VIROU[aplicabilidade.tipoUnidadeId] ?? [aplicabilidade.tipoUnidadeId]).map(
      (tipoUnidadeId) => ({ ...aplicabilidade, tipoUnidadeId }),
    ),
  )
}

export const APLICABILIDADES_V1: readonly Aplicabilidade[] = rechavear(BASE_V1)
export const APLICABILIDADES_V2: readonly Aplicabilidade[] = rechavear(BASE_V2)

/**
 * A régua da v3: aplicabilidade por tipo, com peso que SOMA 1 em cada tipo.
 *
 * Os pesos agora imitam a forma da planilha do cliente, em que cada coluna de
 * tipo fecha em 1,0 e o indicador de desempenho pesa o dobro dos outros. O
 * CECON repete a peculiaridade real: um indicador não se aplica a ele, e o peso
 * que sobraria foi redistribuído entre os que restam, em vez de ficar um tipo
 * somando menos que os outros.
 *
 * A meta continua aqui, mas no método de notas ela é INFORMATIVA: quem decide a
 * nota é a régua de degraus, que já traz os cortes dentro dela. Ter as duas
 * coisas é o que permite a tela dizer "o alvo era 85 e você fez 82" sem que o
 * número do alvo participe da conta.
 */
export const APLICABILIDADES_V3: readonly Aplicabilidade[] = [
  { tipoUnidadeId: 'usf', indicadorId: 'acompanhamento', meta: 85, peso: 0.4 },
  { tipoUnidadeId: 'usf', indicadorId: 'pre-natal', meta: 75, peso: 0.2 },
  { tipoUnidadeId: 'usf', indicadorId: 'vacinacao', meta: 95, peso: 0.2 },
  { tipoUnidadeId: 'usf', indicadorId: 'absenteismo', meta: 5, peso: 0.1 },
  { tipoUnidadeId: 'usf', indicadorId: 'prontuario', meta: 90, peso: 0.1 },

  { tipoUnidadeId: 'ubt', indicadorId: 'acolhimento', meta: 85, peso: 0.4 },
  { tipoUnidadeId: 'ubt', indicadorId: 'tempo-espera', meta: 15, peso: 0.2 },
  { tipoUnidadeId: 'ubt', indicadorId: 'absenteismo', meta: 5, peso: 0.2 },
  { tipoUnidadeId: 'ubt', indicadorId: 'prontuario', meta: 90, peso: 0.2 },

  { tipoUnidadeId: 'ubt-mista', indicadorId: 'acompanhamento', meta: 85, peso: 0.4 },
  { tipoUnidadeId: 'ubt-mista', indicadorId: 'pre-natal', meta: 75, peso: 0.2 },
  { tipoUnidadeId: 'ubt-mista', indicadorId: 'acolhimento', meta: 85, peso: 0.2 },
  { tipoUnidadeId: 'ubt-mista', indicadorId: 'absenteismo', meta: 5, peso: 0.1 },
  { tipoUnidadeId: 'ubt-mista', indicadorId: 'prontuario', meta: 90, peso: 0.1 },

  { tipoUnidadeId: 'caps', indicadorId: 'acolhimento', meta: 90, peso: 0.3 },
  { tipoUnidadeId: 'caps', indicadorId: 'procedimentos', meta: 8, peso: 0.3 },
  { tipoUnidadeId: 'caps', indicadorId: 'tempo-espera', meta: 7, peso: 0.2 },
  { tipoUnidadeId: 'caps', indicadorId: 'absenteismo', meta: 5, peso: 0.1 },
  { tipoUnidadeId: 'caps', indicadorId: 'prontuario', meta: 85, peso: 0.1 },

  // Sem acompanhamento de famílias: o CECON não faz esse trabalho. O peso dele
  // não fica órfão, some dentro dos outros três.
  { tipoUnidadeId: 'cecon', indicadorId: 'acolhimento', meta: 90, peso: 0.4 },
  { tipoUnidadeId: 'cecon', indicadorId: 'procedimentos', meta: 8, peso: 0.3 },
  { tipoUnidadeId: 'cecon', indicadorId: 'absenteismo', meta: 5, peso: 0.3 },

  { tipoUnidadeId: 'ucis', indicadorId: 'acolhimento', meta: 85, peso: 0.4 },
  { tipoUnidadeId: 'ucis', indicadorId: 'tempo-espera', meta: 10, peso: 0.2 },
  { tipoUnidadeId: 'ucis', indicadorId: 'absenteismo', meta: 5, peso: 0.2 },
  { tipoUnidadeId: 'ucis', indicadorId: 'prontuario', meta: 90, peso: 0.2 },

  { tipoUnidadeId: 'mac', indicadorId: 'tempo-espera', meta: 25, peso: 0.4 },
  { tipoUnidadeId: 'mac', indicadorId: 'acolhimento', meta: 95, peso: 0.2 },
  { tipoUnidadeId: 'mac', indicadorId: 'absenteismo', meta: 6, peso: 0.2 },
  { tipoUnidadeId: 'mac', indicadorId: 'prontuario', meta: 95, peso: 0.2 },
]

/**
 * As réguas de degraus da v3: cada subindicador vira nota ANTES de qualquer média.
 *
 * O formato copia o da planilha do cliente, inclusive nos degraus de 0,25 em
 * 0,25. A ordem manda, e o intervalo é `[de, ate)`.
 *
 * Repare em `procedimentos-por-usuario`: a nota sobe, fica cheia num platô e
 * DESCE de novo. É a faixa ideal, escrita sem nenhum campo novo, só com a ordem
 * dos degraus. Uma régua de duas direções não conseguiria dizer isso.
 */
export const GRADUACOES_V3: readonly GraduacaoSubindicador[] = [
  {
    subindicadorId: 'acompanhamento-familias',
    degraus: [
      { de: null, ate: 60, nota: 0 },
      { de: 60, ate: 75, nota: 0.5 },
      { de: 75, ate: 85, nota: 0.75 },
      { de: 85, ate: null, nota: 1 },
    ],
  },
  {
    subindicadorId: 'pre-natal-consultas',
    degraus: [
      { de: null, ate: 50, nota: 0 },
      { de: 50, ate: 65, nota: 0.5 },
      { de: 65, ate: 75, nota: 0.75 },
      { de: 75, ate: null, nota: 1 },
    ],
  },
  {
    subindicadorId: 'pre-natal-exames',
    degraus: [
      { de: null, ate: 50, nota: 0 },
      { de: 50, ate: 65, nota: 0.5 },
      { de: 65, ate: 75, nota: 0.75 },
      { de: 75, ate: null, nota: 1 },
    ],
  },
  {
    subindicadorId: 'vacinacao-polio',
    degraus: [
      { de: null, ate: 80, nota: 0 },
      { de: 80, ate: 90, nota: 0.5 },
      { de: 90, ate: 95, nota: 0.75 },
      { de: 95, ate: null, nota: 1 },
    ],
  },
  {
    subindicadorId: 'vacinacao-penta',
    degraus: [
      { de: null, ate: 80, nota: 0 },
      { de: 80, ate: 90, nota: 0.5 },
      { de: 90, ate: 95, nota: 0.75 },
      { de: 95, ate: null, nota: 1 },
    ],
  },
  {
    // Dias: quanto menor, melhor. A régua desce, e é só isso que muda.
    subindicadorId: 'espera-agendada',
    degraus: [
      { de: null, ate: 7, nota: 1 },
      { de: 7, ate: 15, nota: 0.75 },
      { de: 15, ate: 30, nota: 0.5 },
      { de: 30, ate: null, nota: 0 },
    ],
  },
  {
    subindicadorId: 'espera-acolhimento',
    degraus: [
      { de: null, ate: 2, nota: 1 },
      { de: 2, ate: 5, nota: 0.75 },
      { de: 5, ate: 10, nota: 0.5 },
      { de: 10, ate: null, nota: 0 },
    ],
  },
  {
    subindicadorId: 'acolhimento-classificado',
    degraus: [
      { de: null, ate: 70, nota: 0 },
      { de: 70, ate: 85, nota: 0.5 },
      { de: 85, ate: 95, nota: 0.75 },
      { de: 95, ate: null, nota: 1 },
    ],
  },
  {
    subindicadorId: 'absenteismo-taxa',
    degraus: [
      { de: null, ate: 3, nota: 1 },
      { de: 3, ate: 5, nota: 0.75 },
      { de: 5, ate: 8, nota: 0.5 },
      { de: 8, ate: null, nota: 0 },
    ],
  },
  {
    subindicadorId: 'prontuario-no-dia',
    degraus: [
      { de: null, ate: 70, nota: 0 },
      { de: 70, ate: 85, nota: 0.5 },
      { de: 85, ate: 95, nota: 0.75 },
      { de: 95, ate: null, nota: 1 },
    ],
  },
  {
    subindicadorId: 'prontuario-pendencias',
    degraus: [
      { de: null, ate: 70, nota: 0 },
      { de: 70, ate: 85, nota: 0.5 },
      { de: 85, ate: 95, nota: 0.75 },
      { de: 95, ate: null, nota: 1 },
    ],
  },
  {
    // A FAIXA IDEAL: sobe, fica cheia entre 6 e 12, e desce depois.
    subindicadorId: 'procedimentos-por-usuario',
    degraus: [
      { de: null, ate: 4, nota: 0.25 },
      { de: 4, ate: 6, nota: 0.5 },
      { de: 6, ate: 12, nota: 1 },
      { de: 12, ate: 16, nota: 0.5 },
      { de: 16, ate: null, nota: 0.25 },
    ],
  },
]

/**
 * A SEGUNDA gradação da v3, só onde a portaria manda.
 *
 * O prontuário tem dois subindicadores, e a média deles volta para uma régua
 * antes de virar nota. É a etapa 03 do Indicador 2 da portaria: média 0,6 não
 * vale 0,6, vale 0,5. Quem não está aqui usa a própria média.
 */
export const SEGUNDA_GRADUACAO_V3: readonly GraduacaoIndicador[] = [
  {
    indicadorId: 'prontuario',
    degraus: [
      { de: null, ate: 0.5, nota: 0 },
      { de: 0.5, ate: 0.75, nota: 0.5 },
      { de: 0.75, ate: null, nota: 1 },
    ],
  },
]

/** Comportamento base do gerador: quão perto da meta cada indicador costuma ficar. */
export interface ComportamentoIndicador {
  readonly indicadorId: string
  readonly desempenhoBase: number
  /** Amplitude da variação mês a mês. */
  readonly volatilidade: number
}

export const COMPORTAMENTOS: readonly ComportamentoIndicador[] = [
  { indicadorId: 'acompanhamento', desempenhoBase: 0.95, volatilidade: 0.05 },
  { indicadorId: 'pre-natal', desempenhoBase: 0.92, volatilidade: 0.07 },
  { indicadorId: 'vacinacao', desempenhoBase: 0.94, volatilidade: 0.05 },
  { indicadorId: 'tempo-espera', desempenhoBase: 0.88, volatilidade: 0.11 },
  { indicadorId: 'acolhimento', desempenhoBase: 0.96, volatilidade: 0.04 },
  { indicadorId: 'absenteismo', desempenhoBase: 0.87, volatilidade: 0.12 },
  { indicadorId: 'prontuario', desempenhoBase: 0.91, volatilidade: 0.08 },
  { indicadorId: 'procedimentos', desempenhoBase: 0.97, volatilidade: 0.14 },
]

/** Gerentes fictícios: nomes genéricos, sem qualquer correspondência real. */
export const NOMES_GERENTES: readonly string[] = [
  'A. Moraes',
  'B. Siqueira',
  'C. Andrade',
  'D. Vasconcelos',
  'E. Ferraz',
  'F. Coutinho',
  'G. Barbosa',
  'H. Rangel',
  'I. Peixoto',
  'J. Nogueira',
  'K. Almeida',
  'L. Pontes',
]

export const NOMES_GERENTES_DISTRITAIS: readonly string[] = [
  'M. Quintela',
  'N. Sarmento',
  'O. Tavares',
]
