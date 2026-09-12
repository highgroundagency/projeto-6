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
      'Ligar a apuração ao motor de cálculo, a parte do sistema que faz a conta. O número informado entra, a nota (score) sai. E a conta fica aberta, passo a passo, até o dado de origem.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'A apuração do ciclo já produz, para cada gestor, três coisas. A nota (score). A faixa, que define o percentual pago. E a memória de cálculo, que é a conta aberta, passo a passo.',
      'Construímos a tela "meu resultado". Ela mostra a conta aberta, passo a passo. Mostra também como o resultado evoluiu de um ciclo para o outro.',
      'A regra fica guardada com número de versão. A apuração escolhe a versão pela competência do ciclo, e não pela data de hoje. Competência é o mês a que o ciclo se refere.',
      'Escrevemos testes para três casos delicados. O primeiro: valor bem na fronteira de uma faixa. O segundo: arredondamento. O terceiro: indicador sem lançamento no ciclo, ou seja, sem número informado.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A memória de cálculo sai do mesmo cálculo que a tela exibe.',
        porque:
          'Refazer a conta só para mostrar o passo a passo seria arriscado. A explicação poderia divergir do número pago.',
      },
      {
        decisao: 'Normalizar os pesos (ajustar para que somem 100) só na divisão final.',
        porque:
          'Normalizar peso a peso antes de somar dava 99,9 para um desempenho perfeito, em vez de 100. Normalizando só no fim, a conta fecha em 100.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Na Sprint 3, abrir a auditoria (o histórico de quem mudou o quê) e o painel da gestão.',
      'Preparar o roteiro da validação com a CAM.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'joao-henrique',
        contribuicao: 'Apuração e escolha da versão certa da regra.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Memória de cálculo (a conta aberta) na tela.',
      },
      { integrante: 'fernando', contribuicao: 'Testes dos casos-limite do motor de cálculo.' },
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
    resumo:
      'o motor é a parte do sistema que faz a conta. Aqui está o que precisa ser testado antes de confiar num número que vira dinheiro.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Caso', 'Por que importa', 'Comportamento esperado']}
          linhas={[
            [
              'Valor exatamente na fronteira da faixa',
              'Comparar com "maior que" (>) em vez de "maior ou igual" (>=) muda o pagamento',
              'A faixa segue o critério escrito na regra, sem margem para dúvida',
            ],
            [
              'Desempenho perfeito em todos os indicadores',
              'Normalizar (ajustar) peso a peso antes de somar dava 99,9 em vez de 100',
              'A nota fecha em 100,00 exatos',
            ],
            [
              'Indicador sem lançamento no ciclo',
              'Contar como zero e contar como ausente dão resultados diferentes',
              'Entra com zero pontos, e a memória de cálculo avisa que não houve lançamento',
            ],
            [
              'Ciclo apurado com outra versão da regra',
              'A portaria muda no meio do ano',
              'Vale a versão em vigor na competência do ciclo, não a de hoje',
            ],
            [
              'Refazer a conta de um ciclo já homologado (aprovado)',
              'Se o número mudar depois de pago, o produto perdeu a razão de existir',
              'Dá exatamente a mesma nota',
            ],
            [
              'Pesos que não somam 100',
              'O briefing traz pesos que somam 115',
              'A normalização (o ajuste dos pesos) acontece na divisão final, e a memória de cálculo continua fechando',
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: 'calculo',
    titulo: 'Como o score é calculado',
    resumo: 'a fórmula da nota, o que entra nela e por que cada escolha.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Etapa', 'O que é']}
          linhas={[
            [
              'Pontos do indicador',
              'A regra em vigor transforma o valor informado em pontos, conforme a faixa em que ele cai',
            ],
            ['Peso', 'Cada indicador tem o próprio peso, definido em portaria'],
            [
              'Soma ponderada',
              'Σ (pontos × peso). Ou seja: soma-se pontos vezes peso de cada indicador. É a parte de cima da divisão (o numerador)',
            ],
            [
              'Teto',
              'Σ (peso × pontuação máxima). Ou seja: o máximo que a soma ponderada poderia dar. É a parte de baixo da divisão (o denominador)',
            ],
            ['Score', '(soma ponderada ÷ teto) × 100. Dá um número de 0 a 100'],
            ['Faixa', 'A nota cai numa das faixas da regra. A faixa define o percentual pago'],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
