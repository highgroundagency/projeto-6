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
      'Validar o MVP com quem faz esse trabalho hoje. Anotar o que precisa mudar antes do SR2.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Entrevistamos pelo menos um integrante da CAM sobre como o processo acontece na prática. A conversa segue um roteiro, mas deixa a pessoa falar livremente.',
      'Fizemos um teste de usabilidade com tempo marcado. A pessoa tenta lançar um indicador e explicar a própria nota (o score).',
      'Depois do teste, a pessoa responde a um questionário. Ele pergunta se a memória de cálculo, o passo a passo da conta, ficou clara. E se ela confia no resultado.',
      'Anotamos os ajustes que saíram daí. Cada ajuste leva anotado de onde veio e a prioridade.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A validação usa tarefa cronometrada, não demonstração narrada.',
        porque:
          'Se nós mostramos, o teste mede a nossa explicação, não a clareza da tela. A pessoa precisa tentar sozinha.',
      },
      {
        decisao: 'Nenhum dado real da SESAU entra no teste.',
        porque:
          'Queremos validar o fluxo e a clareza, não os números. Uma base de teste gerada por programa basta. E ela evita mexer em dado de servidor sem base legal.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'A validação depende da agenda da CAM, e essa agenda não é nossa. A única defesa é marcar com antecedência.',
    ],
  },

  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Escrever o retorno da CAM neste bloco de feedback, dizendo de onde veio.',
      'Fazer os ajustes de prioridade alta antes do Pré-SR2.',
      'Anotar o que foi apontado e decidimos não fazer, com o motivo.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'matheus',
        contribuicao: 'Conduzir a entrevista e o teste de usabilidade.',
      },
      {
        integrante: 'gabriel',
        contribuicao: 'Contato com a CAM e escolha da prioridade dos ajustes.',
      },
      { integrante: 'joao-pedro', contribuicao: 'Ajustes nas telas que saíram da validação.' },
      { integrante: 'kerry', contribuicao: 'Apoia as anotações da entrevista e do teste.' },
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
              'O que acontece de verdade, não o que a portaria descreve',
            ],
            [
              'O que costuma dar errado?',
              'Onde o processo quebra, na ordem em que a pessoa sente',
            ],
            [
              'Como você confere se um número está certo hoje?',
              'Se existe conferência, e quanto ela custa',
            ],
            [
              'Já teve alguém contestando um resultado? Como foi?',
              'O caminho da contestação, e o que faltou para responder a ela',
            ],
            [
              'O que você faria se tivesse mais tempo no fechamento?',
              'O que importa de verdade, dito sem a pressão de escolher',
            ],
          ]}
        />
        <Lista
          itens={[
            'As perguntas são abertas e não sugerem resposta. Nada de "não seria melhor se…".',
            'Quem conduz não defende o produto. Se a pessoa criticar, a resposta é "me conta mais".',
            'Não pedimos nem anotamos nenhum dado real de servidor.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'tarefas',
    titulo: 'Tarefas do teste de usabilidade',
    resumo: 'o que a pessoa tenta fazer sozinha, e o que conta como sucesso em cada tarefa.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Tarefa', 'Sucesso é', 'O que se mede']}
          linhas={[
            [
              'Lançar o valor de um indicador da sua área',
              'Concluir sem pedir ajuda',
              'Se o prazo de lançamento e a evidência ficam claros sem ninguém explicar',
            ],
            [
              'Descobrir por que a nota (o score) de um gestor deu o que deu',
              'Chegar ao passo a passo da conta (a memória de cálculo) e apontar um indicador',
              'Se dá para seguir a conta até a origem sem treinamento',
            ],
            [
              'Encontrar quem informou determinado valor e quando',
              'Chegar ao histórico de quem fez o quê e quando (a trilha de auditoria)',
              'Se o histórico é fácil de achar, e não só existe',
            ],
            [
              'Contestar um resultado',
              'Abrir a contestação e saber o prazo',
              'Se quem é avaliado enxerga o caminho para discordar',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
