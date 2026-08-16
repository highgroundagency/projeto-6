import { Lista, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/**
 * SR1 — primeira apresentação de resultados. PLANEJAMENTO: ver a nota em s5.tsx.
 *
 * O bloco `feedback` fica vazio DE PROPÓSITO e é o único que não pode ser
 * preenchido antes da hora: o retorno da banca é fala de terceiro, e escrever
 * por ela seria fabricar evidência. Ele é preenchido no dia, com origem
 * declarada.
 */
export const registro = {
  ciclo: 'sr1',
  marcador: 'PRUMO-MARCADOR-CICLO-sr1',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Apresentar problema, pesquisa e protótipo navegável, e sair com o retorno da banca registrado e priorizado.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Pitch de cinco minutos apresentado.',
      'Demonstração ao vivo do caminho lançamento → cálculo → memória de cálculo.',
      'Pacote de entrega do SR1 submetido conforme a matriz de evidências.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Demonstrar ao vivo, sem vídeo gravado.',
        porque:
          'Gravação esconde travamento e não prova que roda. Se cair, cai na frente de todo mundo — e isso também é informação.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Transcrever o retorno da banca neste bloco de feedback, com origem.',
      'Repriorizar o backlog das quatro sprints a partir do que foi apontado.',
      'Marcar a conversa de validação com a CAM para a Semana 11.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Narração do pitch e resposta às perguntas.' },
      { integrante: 'joao-pedro', contribuicao: 'Demonstração ao vivo do protótipo.' },
      { integrante: 'matheus', contribuicao: 'Apresentação da pesquisa e das personas.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Pacote de entrega do SR1', url: '#doc-sr1-pacote' },
      { tipo: 'prototipo', rotulo: 'Protótipo apresentado', url: '/sistema' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'pacote',
    titulo: 'Pacote de entrega do SR1',
    resumo: 'o que foi submetido e onde cada peça está no site.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Peça', 'Onde está']}
          linhas={[
            ['Problema, pergunta e cliente', 'Página inicial'],
            ['Personas e mapa de empatia', 'Registro, Semana 2'],
            ['Benchmarking e SWOT', 'Registro, Semana 2'],
            ['Proposta, escopo e backlog', 'Registro, Semana 4'],
            ['Arquitetura e modelo de dados', 'Registro, Semana 5'],
            ['Protótipo navegável', 'Sistema'],
            ['Registro semanal', 'Página inicial, seção Registro semanal'],
            ['Uso de IA', 'Transparência no uso de IA'],
          ]}
        />
        <Lista
          itens={[
            'Nenhuma peça é PDF: tudo é conteúdo do site, versionado no Git.',
            'O que ainda não foi validado carrega selo de rascunho na própria página.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
