import { Lista, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 6 — Pré-SR1. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's6',
  marcador: 'PRUMO-MARCADOR-CICLO-s6',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Chegar ao SR1 com o protótipo navegável, o pacote de entrega fechado e o pitch ensaiado dentro do tempo.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Deixamos três telas navegáveis, com dados de teste gerados por programa: lançamento, resultado e memória de cálculo. A memória de cálculo é o passo a passo da conta.',
      'Conferimos o pacote do SR1 item a item. Usamos como guia a matriz de evidências, a lista do que a disciplina cobra.',
      'Ensaiamos o pitch com cronômetro na mão. O que não coube em cinco minutos foi cortado.',
      'Escrevemos a primeira versão das análises de segurança e de privacidade.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'O pitch abre pela memória de cálculo, não pela arquitetura.',
        porque:
          'É isso que separa o produto de uma planilha melhorada. A arquitetura só entra se a banca perguntar.',
      },
      {
        decisao: 'Nada de slide com código.',
        porque:
          'Em cinco minutos, código na tela só rouba atenção. E não prova nada que a demonstração já não prove.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Apresentar o SR1.',
      'Anotar o retorno da banca no ciclo do SR1, dizendo de quem veio cada comentário.',
      'Reordenar a lista de tarefas das sprints (o backlog) conforme o que a banca apontar.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Roteiro do pitch e conferência do pacote.' },
      { integrante: 'joao-pedro', contribuicao: 'Telas navegáveis e acessibilidade.' },
      { integrante: 'fernando', contribuicao: 'Análises de segurança e privacidade.' },
      { integrante: 'kerry', contribuicao: 'Apoia a conferência da pesquisa no pacote.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Checklist do SR1', url: '#doc-s6-checklist' },
      { tipo: 'documento', rotulo: 'Roteiro do pitch', url: '#doc-s6-pitch' },
      { tipo: 'prototipo', rotulo: 'Protótipo navegável', url: '/sistema' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'checklist',
    titulo: 'Checklist do SR1',
    resumo: 'o que precisa estar pronto, e como saber que cada item está pronto.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Item', 'Critério de pronto']}
          linhas={[
            ['Problema e pergunta', 'Os dois publicados na página, com o nome do cliente'],
            ['Pesquisa reunida', 'Personas, mapa de empatia, benchmarking e SWOT, tudo no site'],
            [
              'Protótipo navegável',
              'Do lançamento ao cálculo, e do cálculo à memória de cálculo. Sem tela morta: toda tela abre e leva a algum lugar',
            ],
            ['Registro semanal', 'Todas as semanas que já passaram estão publicadas e validadas'],
            ['Análises da disciplina', 'Segurança e privacidade, na primeira versão'],
            ['Pitch', 'Ensaiado e cronometrado: cabe em cinco minutos'],
          ]}
        />
      </>
    ),
  },
  {
    id: 'pitch',
    titulo: 'Roteiro do pitch: SR1',
    resumo: 'os cinco minutos divididos em trechos, e o que cada trecho precisa provar.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Tempo', 'O quê', 'O que precisa ficar claro']}
          linhas={[
            ['0:00 a 0:40', 'O problema', 'Dinheiro público calculado à mão, sem deixar rastro'],
            ['0:40 a 1:30', 'A pergunta e o recorte', 'O que o projeto cobre e o que ficou de fora'],
            [
              '1:30 a 3:30',
              'Demonstração',
              'Um lançamento vira nota (score), e a nota abre até a origem',
            ],
            [
              '3:30 a 4:20',
              'Como sabemos que está certo',
              'A regra fica guardada com número de versão. E a conta tem teste para os casos extremos',
            ],
            [
              '4:20 a 5:00',
              'O que vem até o SR2',
              'As sprints e a validação com a Comissão de Avaliação de Metas (CAM). E as duas lentes',
            ],
          ]}
        />
        <Lista
          itens={[
            'Quem mexe na tela não é quem fala. Assim a apresentação não depende de uma pessoa só.',
            'A demonstração roda com dados de teste, gerados por programa. Dizemos isso em voz alta logo na abertura.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
