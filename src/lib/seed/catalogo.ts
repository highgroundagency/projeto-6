import type { Area, Direcao, Periodicidade } from '@/lib/calculo/tipos'

/**
 * Catálogo sintético de áreas e indicadores.
 *
 * ATENÇÃO (§2.4): tudo aqui é FICTÍCIO. Nomes de área e de indicador foram
 * escritos para serem verossímeis no vocabulário da saúde pública, mas nenhum
 * número, meta ou pessoa vem da SESAU. Quando a portaria real chegar, estes
 * dados são substituídos pelo cadastro feito na própria interface — sem tocar
 * em código.
 */

export const AREAS: readonly Area[] = [
  { id: 'aps', sigla: 'APS', nome: 'Atenção Primária à Saúde' },
  { id: 'vis', sigla: 'VIS', nome: 'Vigilância em Saúde' },
  { id: 'reg', sigla: 'REG', nome: 'Regulação e Controle' },
  { id: 'af', sigla: 'AF', nome: 'Assistência Farmacêutica' },
  { id: 'sm', sigla: 'SM', nome: 'Saúde Mental' },
  { id: 'urg', sigla: 'URG', nome: 'Urgência e Emergência' },
  { id: 'sb', sigla: 'SB', nome: 'Saúde Bucal' },
  { id: 'gp', sigla: 'GP', nome: 'Gestão de Pessoas' },
  { id: 'plan', sigla: 'PLAN', nome: 'Planejamento e Orçamento' },
  { id: 'ouv', sigla: 'OUV', nome: 'Ouvidoria e Participação' },
]

export interface DefinicaoIndicador {
  readonly id: string
  readonly areaId: string
  readonly nome: string
  readonly unidade: string
  readonly direcao: Direcao
  readonly fonte: string
  readonly periodicidade: Periodicidade
  readonly meta: number
  readonly peso: number
  /** Comportamento base usado pelo gerador: quão perto da meta a área costuma ficar. */
  readonly desempenhoBase: number
  /** Amplitude da variação mês a mês. */
  readonly volatilidade: number
}

export const INDICADORES: readonly DefinicaoIndicador[] = [
  // Atenção Primária
  { id: 'aps-cobertura-esf', areaId: 'aps', nome: 'Cobertura populacional por equipes de Saúde da Família', unidade: '%', direcao: 'maior_melhor', fonte: 'Cadastro de equipes', periodicidade: 'mensal', meta: 85, peso: 3, desempenhoBase: 0.97, volatilidade: 0.04 },
  { id: 'aps-consultas-agendadas', areaId: 'aps', nome: 'Consultas agendadas dentro do prazo pactuado', unidade: '%', direcao: 'maior_melhor', fonte: 'Prontuário eletrônico', periodicidade: 'mensal', meta: 90, peso: 2, desempenhoBase: 0.93, volatilidade: 0.06 },
  { id: 'aps-visitas-domiciliares', areaId: 'aps', nome: 'Visitas domiciliares por agente comunitário', unidade: 'visitas/mês', direcao: 'maior_melhor', fonte: 'Registro de campo', periodicidade: 'mensal', meta: 120, peso: 2, desempenhoBase: 0.89, volatilidade: 0.09 },
  { id: 'aps-pre-natal', areaId: 'aps', nome: 'Gestantes com sete ou mais consultas de pré-natal', unidade: '%', direcao: 'maior_melhor', fonte: 'Sistema de acompanhamento', periodicidade: 'trimestral', meta: 75, peso: 3, desempenhoBase: 0.95, volatilidade: 0.05 },

  // Vigilância em Saúde
  { id: 'vis-vacinacao', areaId: 'vis', nome: 'Crianças com esquema vacinal em dia', unidade: '%', direcao: 'maior_melhor', fonte: 'Sistema de imunização', periodicidade: 'mensal', meta: 95, peso: 3, desempenhoBase: 0.94, volatilidade: 0.05 },
  { id: 'vis-investigacao-obitos', areaId: 'vis', nome: 'Óbitos investigados no prazo', unidade: '%', direcao: 'maior_melhor', fonte: 'Vigilância epidemiológica', periodicidade: 'mensal', meta: 90, peso: 2, desempenhoBase: 0.91, volatilidade: 0.07 },
  { id: 'vis-tempo-notificacao', areaId: 'vis', nome: 'Tempo médio de notificação de agravo', unidade: 'dias', direcao: 'menor_melhor', fonte: 'Vigilância epidemiológica', periodicidade: 'mensal', meta: 5, peso: 2, desempenhoBase: 0.96, volatilidade: 0.08 },
  { id: 'vis-inspecoes', areaId: 'vis', nome: 'Inspeções sanitárias realizadas sobre programadas', unidade: '%', direcao: 'maior_melhor', fonte: 'Vigilância sanitária', periodicidade: 'mensal', meta: 80, peso: 2, desempenhoBase: 0.86, volatilidade: 0.11 },

  // Regulação
  { id: 'reg-tempo-regulacao', areaId: 'reg', nome: 'Tempo médio de regulação de consulta especializada', unidade: 'dias', direcao: 'menor_melhor', fonte: 'Central de regulação', periodicidade: 'mensal', meta: 30, peso: 3, desempenhoBase: 0.84, volatilidade: 0.12 },
  { id: 'reg-fila-espera', areaId: 'reg', nome: 'Pacientes na fila há mais de 90 dias', unidade: 'pacientes', direcao: 'menor_melhor', fonte: 'Central de regulação', periodicidade: 'mensal', meta: 400, peso: 3, desempenhoBase: 0.79, volatilidade: 0.14 },
  { id: 'reg-vagas-ocupadas', areaId: 'reg', nome: 'Taxa de ocupação das vagas ofertadas', unidade: '%', direcao: 'maior_melhor', fonte: 'Central de regulação', periodicidade: 'mensal', meta: 92, peso: 2, desempenhoBase: 0.93, volatilidade: 0.05 },

  // Assistência Farmacêutica
  { id: 'af-disponibilidade', areaId: 'af', nome: 'Disponibilidade de medicamentos da relação básica', unidade: '%', direcao: 'maior_melhor', fonte: 'Estoque central', periodicidade: 'mensal', meta: 95, peso: 3, desempenhoBase: 0.92, volatilidade: 0.07 },
  { id: 'af-perda-validade', areaId: 'af', nome: 'Perda por vencimento sobre o estoque', unidade: '%', direcao: 'menor_melhor', fonte: 'Estoque central', periodicidade: 'mensal', meta: 2, peso: 2, desempenhoBase: 0.88, volatilidade: 0.13 },
  { id: 'af-tempo-dispensacao', areaId: 'af', nome: 'Tempo médio de dispensação na farmácia', unidade: 'minutos', direcao: 'menor_melhor', fonte: 'Farmácia distrital', periodicidade: 'mensal', meta: 12, peso: 1, desempenhoBase: 0.94, volatilidade: 0.08 },

  // Saúde Mental
  { id: 'sm-acolhimentos', areaId: 'sm', nome: 'Acolhimentos realizados no CAPS', unidade: 'atendimentos', direcao: 'maior_melhor', fonte: 'Rede de atenção psicossocial', periodicidade: 'mensal', meta: 350, peso: 2, desempenhoBase: 0.9, volatilidade: 0.1 },
  { id: 'sm-abandono', areaId: 'sm', nome: 'Abandono de tratamento continuado', unidade: '%', direcao: 'menor_melhor', fonte: 'Rede de atenção psicossocial', periodicidade: 'trimestral', meta: 15, peso: 3, desempenhoBase: 0.85, volatilidade: 0.11 },
  { id: 'sm-matriciamento', areaId: 'sm', nome: 'Equipes de APS com matriciamento no período', unidade: '%', direcao: 'maior_melhor', fonte: 'Rede de atenção psicossocial', periodicidade: 'trimestral', meta: 70, peso: 2, desempenhoBase: 0.87, volatilidade: 0.12 },

  // Urgência e Emergência
  { id: 'urg-tempo-resposta', areaId: 'urg', nome: 'Tempo médio de resposta do serviço móvel', unidade: 'minutos', direcao: 'menor_melhor', fonte: 'Central de urgência', periodicidade: 'mensal', meta: 18, peso: 3, desempenhoBase: 0.91, volatilidade: 0.09 },
  { id: 'urg-classificacao-risco', areaId: 'urg', nome: 'Atendimentos com classificação de risco registrada', unidade: '%', direcao: 'maior_melhor', fonte: 'Prontuário de urgência', periodicidade: 'mensal', meta: 98, peso: 2, desempenhoBase: 0.97, volatilidade: 0.03 },
  { id: 'urg-permanencia', areaId: 'urg', nome: 'Permanência média em observação', unidade: 'horas', direcao: 'menor_melhor', fonte: 'Prontuário de urgência', periodicidade: 'mensal', meta: 8, peso: 2, desempenhoBase: 0.86, volatilidade: 0.1 },

  // Saúde Bucal
  { id: 'sb-primeira-consulta', areaId: 'sb', nome: 'Primeira consulta odontológica programática', unidade: '%', direcao: 'maior_melhor', fonte: 'Prontuário eletrônico', periodicidade: 'mensal', meta: 60, peso: 2, desempenhoBase: 0.88, volatilidade: 0.1 },
  { id: 'sb-escovacao', areaId: 'sb', nome: 'Escolas com escovação supervisionada', unidade: '%', direcao: 'maior_melhor', fonte: 'Programa escolar', periodicidade: 'trimestral', meta: 80, peso: 2, desempenhoBase: 0.9, volatilidade: 0.09 },
  { id: 'sb-exodontias', areaId: 'sb', nome: 'Exodontias sobre procedimentos odontológicos', unidade: '%', direcao: 'menor_melhor', fonte: 'Prontuário eletrônico', periodicidade: 'mensal', meta: 8, peso: 1, desempenhoBase: 0.92, volatilidade: 0.08 },

  // Gestão de Pessoas
  { id: 'gp-absenteismo', areaId: 'gp', nome: 'Absenteísmo das equipes assistenciais', unidade: '%', direcao: 'menor_melhor', fonte: 'Folha de frequência', periodicidade: 'mensal', meta: 4, peso: 2, desempenhoBase: 0.87, volatilidade: 0.11 },
  { id: 'gp-capacitacao', areaId: 'gp', nome: 'Servidores capacitados no período', unidade: '%', direcao: 'maior_melhor', fonte: 'Educação permanente', periodicidade: 'semestral', meta: 65, peso: 2, desempenhoBase: 0.83, volatilidade: 0.13 },
  { id: 'gp-avaliacoes-prazo', areaId: 'gp', nome: 'Avaliações de desempenho entregues no prazo', unidade: '%', direcao: 'maior_melhor', fonte: 'Gestão de pessoas', periodicidade: 'semestral', meta: 95, peso: 2, desempenhoBase: 0.9, volatilidade: 0.08 },

  // Planejamento
  { id: 'plan-execucao-orcamentaria', areaId: 'plan', nome: 'Execução orçamentária do programa', unidade: '%', direcao: 'maior_melhor', fonte: 'Sistema orçamentário', periodicidade: 'trimestral', meta: 90, peso: 3, desempenhoBase: 0.92, volatilidade: 0.06 },
  { id: 'plan-relatorios-prazo', areaId: 'plan', nome: 'Relatórios de gestão entregues no prazo', unidade: '%', direcao: 'maior_melhor', fonte: 'Planejamento', periodicidade: 'trimestral', meta: 100, peso: 2, desempenhoBase: 0.94, volatilidade: 0.06 },

  // Ouvidoria
  { id: 'ouv-tempo-resposta', areaId: 'ouv', nome: 'Tempo médio de resposta à manifestação', unidade: 'dias', direcao: 'menor_melhor', fonte: 'Ouvidoria', periodicidade: 'mensal', meta: 15, peso: 2, desempenhoBase: 0.89, volatilidade: 0.1 },
  { id: 'ouv-resolutividade', areaId: 'ouv', nome: 'Manifestações resolvidas na primeira resposta', unidade: '%', direcao: 'maior_melhor', fonte: 'Ouvidoria', periodicidade: 'mensal', meta: 70, peso: 2, desempenhoBase: 0.85, volatilidade: 0.12 },
]

/** Gestores fictícios: nomes genéricos, sem qualquer correspondência real. */
export const NOMES_GESTORES: readonly string[] = [
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

export const CARGOS: readonly string[] = [
  'Coordenação',
  'Gerência',
  'Supervisão',
  'Diretoria técnica',
]
