import { Lista, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/**
 * Semana 11 — Validação com o cliente. PLANEJAMENTO: ver a nota em s5.tsx.
 *
 * Esta é a semana em que `feedback` deixa de ser 'nenhum' — e é exatamente por
 * isso que ele não pode ser escrito antes. O que está aqui é o INSTRUMENTO da
 * validação, não o resultado dela.
 */
export const registro = {
  ciclo: 's11',
  marcador: 'PRUMO-MARCADOR-CICLO-s11',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Validar o MVP com quem opera o processo hoje, e registrar o que precisa mudar antes do SR2.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Entrevista semiestruturada com pelo menos um integrante da CAM, sobre o fluxo real.',
      'Teste de usabilidade com tarefa cronometrada: lançar um indicador e explicar o próprio score.',
      'Questionário pós-teste sobre clareza da memória de cálculo e confiança no resultado.',
      'Ajustes decorrentes registrados com origem e prioridade.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A validação usa tarefa cronometrada, não demonstração narrada.',
        porque:
          'Demonstração guiada mede a nossa explicação, não a clareza da tela. A pessoa precisa tentar sozinha.',
      },
      {
        decisao: 'Nenhum dado real da SESAU entra no ambiente de teste.',
        porque:
          'A validação é do fluxo e da clareza, não dos números. Base sintética resolve, e evita tratar dado de servidor sem base legal.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'A validação depende da agenda da CAM, que não está sob controle da equipe, marcar com antecedência é o único mitigador.',
    ],
  },

  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Transcrever o retorno da CAM neste bloco de feedback, com origem declarada.',
      'Aplicar os ajustes de prioridade alta antes do Pré-SR2.',
      'Registrar o que foi apontado e conscientemente não será feito, com o motivo.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'matheus',
        contribuicao: 'Condução da entrevista e do teste de usabilidade.',
      },
      {
        integrante: 'gabriel',
        contribuicao: 'Interlocução com a CAM e priorização dos ajustes.',
      },
      { integrante: 'joao-pedro', contribuicao: 'Ajustes de interface decorrentes.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Roteiro da entrevista', url: '#doc-s11-roteiro' },
      { tipo: 'documento', rotulo: 'Tarefas do teste de usabilidade', url: '#doc-s11-tarefas' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'roteiro',
    titulo: 'Roteiro da entrevista',
    resumo: 'as perguntas abertas, na ordem, e o que cada uma quer descobrir.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Pergunta', 'O que se quer descobrir']}
          linhas={[
            [
              'Conte como foi o último fechamento de ciclo, do começo ao fim.',
              'O fluxo real, não o fluxo descrito na portaria',
            ],
            ['O que costuma dar errado?', 'Os pontos de quebra, na ordem de quem sente a dor'],
            [
              'Como você confere se um número está certo hoje?',
              'Se existe conferência, e quanto ela custa',
            ],
            [
              'Já teve alguém contestando um resultado? Como foi?',
              'O caminho da contestação e o que faltou para respondê-la',
            ],
            [
              'O que você faria se tivesse mais tempo no fechamento?',
              'A prioridade real, dita sem a pressão de escolher',
            ],
          ]}
        />
        <Lista
          itens={[
            'Perguntas abertas, sem sugerir a resposta, nada de "não seria melhor se…".',
            'Quem conduz não defende o produto: se a pessoa criticar, a resposta é "me conta mais".',
            'Nenhum dado real de servidor é solicitado ou anotado.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'tarefas',
    titulo: 'Tarefas do teste de usabilidade',
    resumo: 'o que a pessoa tenta fazer sozinha, e o critério de sucesso de cada tarefa.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Tarefa', 'Sucesso é', 'O que se mede']}
          linhas={[
            [
              'Lançar o valor de um indicador da sua área',
              'Concluir sem pedir ajuda',
              'Se a janela e a evidência ficam claras sem explicação',
            ],
            [
              'Descobrir por que o score de um gestor deu o que deu',
              'Chegar à memória de cálculo e apontar um indicador',
              'Se a conta abre até a origem sem treinamento',
            ],
            [
              'Encontrar quem informou determinado valor e quando',
              'Chegar à trilha de auditoria',
              'Se a rastreabilidade é achável, não só existente',
            ],
            [
              'Contestar um resultado',
              'Abrir a contestação e saber o prazo',
              'Se o caminho de discordar é visível para quem é avaliado',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
