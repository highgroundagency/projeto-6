import type {
  Aplicabilidade,
  Distrito,
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

export const TIPOS_UNIDADE: readonly TipoUnidade[] = [
  { id: 'usf', sigla: 'USF', nome: 'Unidade de Saúde da Família' },
  { id: 'caps', sigla: 'CAPS', nome: 'Centro de Atenção Psicossocial' },
  { id: 'upa', sigla: 'UPA', nome: 'Unidade de Pronto Atendimento' },
  { id: 'poli', sigla: 'POLI', nome: 'Policlínica' },
]

export const UNIDADES: readonly Unidade[] = [
  { id: 'usf-sabia', nome: 'USF Sabiá', distritoId: 'ds-leste', tipoId: 'usf' },
  { id: 'usf-bem-te-vi', nome: 'USF Bem-te-vi', distritoId: 'ds-leste', tipoId: 'usf' },
  { id: 'caps-colibri', nome: 'CAPS Colibri', distritoId: 'ds-leste', tipoId: 'caps' },
  { id: 'upa-andorinha', nome: 'UPA Andorinha', distritoId: 'ds-leste', tipoId: 'upa' },
  { id: 'usf-canario', nome: 'USF Canário', distritoId: 'ds-norte', tipoId: 'usf' },
  { id: 'usf-juriti', nome: 'USF Juriti', distritoId: 'ds-norte', tipoId: 'usf' },
  { id: 'caps-rolinha', nome: 'CAPS Rolinha', distritoId: 'ds-norte', tipoId: 'caps' },
  { id: 'poli-garca', nome: 'Policlínica Garça', distritoId: 'ds-norte', tipoId: 'poli' },
  { id: 'usf-curio', nome: 'USF Curió', distritoId: 'ds-oeste', tipoId: 'usf' },
  { id: 'usf-asa-branca', nome: 'USF Asa-branca', distritoId: 'ds-oeste', tipoId: 'usf' },
  { id: 'upa-gaivota', nome: 'UPA Gaivota', distritoId: 'ds-oeste', tipoId: 'upa' },
  { id: 'poli-tuim', nome: 'Policlínica Tuim', distritoId: 'ds-oeste', tipoId: 'poli' },
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
]

/**
 * A tabela que a reunião de 22/08 revelou: a depender do TIPO da unidade, só
 * alguns indicadores valem, e os pesos mudam. O CAPS tem o recorte menor de
 * propósito — foi o exemplo do próprio cliente.
 */
export const APLICABILIDADES_V1: readonly Aplicabilidade[] = [
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
export const APLICABILIDADES_V2: readonly Aplicabilidade[] = APLICABILIDADES_V1.map(
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
