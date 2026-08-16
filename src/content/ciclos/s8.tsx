import { Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 8 — Sprint 2. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's8',
  marcador: 'PRUMO-MARCADOR-CICLO-s8',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Ligar a apuração ao motor: do lançamento ao score, com a memória de cálculo aberta até a origem.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Apuração do ciclo produzindo score, faixa e memória de cálculo por gestor.',
      'Tela "meu resultado" com a conta aberta passo a passo e a evolução entre ciclos.',
      'Regra versionada escolhida pela competência do ciclo, não pela data de hoje.',
      'Testes de fronteira de faixa, arredondamento e indicador sem lançamento.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A memória de cálculo sai do mesmo cálculo que a interface exibe.',
        porque:
          'Recalcular para mostrar abriria espaço para a explicação divergir do número pago.',
      },
      {
        decisao: 'Peso normalizado só na divisão final.',
        porque: 'Normalizar peso a peso antes de somar dava 99,9 para desempenho perfeito.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Abrir a auditoria e o painel da gestão na Sprint 3.',
      'Preparar o roteiro da validação com a CAM.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'joao-henrique', contribuicao: 'Apuração e escolha da regra vigente.' },
      { integrante: 'joao-pedro', contribuicao: 'Memória de cálculo na interface.' },
      { integrante: 'fernando', contribuicao: 'Testes de caso-limite do motor.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Meu resultado', url: '/sistema/meu-resultado' },
      { tipo: 'testes', rotulo: 'Casos-limite do motor', url: '#doc-s8-casos' },
      { tipo: 'documento', rotulo: 'Como o score é calculado', url: '#doc-s8-calculo' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'casos',
    titulo: 'Casos-limite do motor',
    resumo: 'o que precisa ser testado antes de confiar num número que vira dinheiro.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Caso', 'Por que importa', 'Comportamento esperado']}
          linhas={[
            [
              'Valor exatamente na fronteira da faixa',
              'É onde uma comparação com > em vez de >= muda o pagamento',
              'A faixa é escolhida pelo critério declarado na regra, sem ambiguidade',
            ],
            [
              'Desempenho perfeito em todos os indicadores',
              'Normalizar peso a peso antes de somar dava 99,9 em vez de 100',
              'Score fecha em 100,00 exatos',
            ],
            [
              'Indicador sem lançamento no ciclo',
              'Tratar como zero e tratar como ausente dão resultados diferentes',
              'Entra como zero pontos, e a memória de cálculo diz que não houve lançamento',
            ],
            [
              'Ciclo apurado com regra de outra versão',
              'A portaria muda no meio do ano',
              'Vale a regra vigente na competência do ciclo, não a de hoje',
            ],
            [
              'Recálculo de ciclo já homologado',
              'Se o número mudar depois de pago, o produto perdeu a razão de existir',
              'Reproduz exatamente o mesmo score',
            ],
            [
              'Soma dos pesos diferente de 100',
              'O briefing traz pesos que somam 115',
              'A normalização acontece na divisão final; a memória continua fechando',
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: 'calculo',
    titulo: 'Como o score é calculado',
    resumo: 'a fórmula, o que entra nela e por que cada escolha.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Etapa', 'O que é']}
          linhas={[
            [
              'Pontos do indicador',
              'A regra vigente converte o valor informado em pontos, pela faixa',
            ],
            ['Peso', 'Cada indicador tem peso próprio, definido em portaria'],
            ['Soma ponderada', 'Σ (pontos × peso): o numerador'],
            ['Teto', 'Σ (peso × pontuação máxima): o denominador'],
            ['Score', '(soma ponderada ÷ teto) × 100, de 0 a 100'],
            ['Faixa', 'O score cai numa faixa da regra, que define o percentual pago'],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
