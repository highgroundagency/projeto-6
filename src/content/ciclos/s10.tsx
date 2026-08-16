import { Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 10 — Sprint 4. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's10',
  marcador: 'PRUMO-MARCADOR-CICLO-s10',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Entregar a lente de machine learning como funcionalidade do produto, com o método declarado ao lado do número.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Tela de analytics com os resultados dos modelos e a metodologia visível.',
      'Modelos treinados exclusivamente sobre a base sintética, sem nenhum dado real.',
      'Métricas de desempenho publicadas junto do resultado, não escondidas.',
      'Limitações do modelo escritas na própria tela, em linguagem de quem vai ler.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'O método fica ao lado do número, sempre.',
        porque:
          'Previsão sem método declarado é opinião com aparência de dado. Num cálculo de gratificação, isso é grave.',
      },
      {
        decisao: 'O modelo não decide nada: informa.',
        porque:
          'Nenhuma saída de ML entra na conta da gratificação. A regra é a portaria, e ela é determinística.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Validar com a CAM na Semana 11.',
      'Consolidar as três lentes no pacote do SR2.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'rafael', contribuicao: 'Gerador de dados, notebooks e modelos.' },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Tela de analytics e apresentação das métricas.',
      },
      { integrante: 'fernando', contribuicao: 'Revisão das limitações declaradas.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'dashboard', rotulo: 'Analytics', url: '/sistema/analytics' },
      { tipo: 'documento', rotulo: 'Método e limitações', url: '#doc-s10-metodo' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'metodo',
    titulo: 'Método e limitações',
    resumo: 'o que o modelo faz, sobre o que foi treinado e onde ele erra.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Aspecto', 'O que vale']}
          linhas={[
            [
              'Base',
              'Exclusivamente sintética, com semente fixa — nenhum dado real de pessoa ou da SESAU',
            ],
            [
              'Escopo',
              'Apoia a leitura de tendência por área; não entra no cálculo da gratificação',
            ],
            ['Métricas', 'Publicadas na própria tela, junto do resultado'],
            [
              'Limitação principal',
              'Base sintética reproduz a regra que a gerou: desempenho em dado real seria outro',
            ],
            [
              'O que não faz',
              'Não classifica pessoa, não recomenda pagamento, não substitui a portaria',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
