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
      'Telas de lançamento, resultado e memória de cálculo navegáveis com dados sintéticos.',
      'Pacote do SR1 conferido item a item contra a matriz de evidências.',
      'Ensaio cronometrado do pitch, com corte do que não cabe em cinco minutos.',
      'Análise de segurança e de privacidade em primeira versão.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'O pitch abre pela memória de cálculo, não pela arquitetura.',
        porque:
          'É o que distingue o produto de uma planilha melhorada. Arquitetura entra se a banca perguntar.',
      },
      {
        decisao: 'Nada de slide com código.',
        porque:
          'Em cinco minutos, código na tela consome atenção e não prova nada que a demo não prove.',
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
      'Registrar o retorno da banca no ciclo do SR1, com origem declarada.',
      'Repriorizar o backlog das sprints a partir do que a banca apontar.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Roteiro do pitch e conferência do pacote.' },
      { integrante: 'joao-pedro', contribuicao: 'Telas navegáveis e acessibilidade.' },
      { integrante: 'fernando', contribuicao: 'Análises de segurança e privacidade.' },
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
    resumo: 'o que precisa estar pronto, e o critério de pronto de cada item.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Item', 'Critério de pronto']}
          linhas={[
            ['Problema e pergunta', 'Publicados na página, com o cliente nomeado'],
            ['Pesquisa consolidada', 'Personas, mapa de empatia, benchmarking e SWOT no site'],
            [
              'Protótipo navegável',
              'Lançamento → cálculo → memória de cálculo, sem tela morta',
            ],
            ['Registro semanal', 'Todas as semanas vencidas publicadas e validadas'],
            ['Análises da disciplina', 'Segurança e privacidade em primeira versão'],
            ['Pitch', 'Cronometrado em cinco minutos, com ensaio feito'],
          ]}
        />
      </>
    ),
  },
  {
    id: 'pitch',
    titulo: 'Roteiro do pitch: SR1',
    resumo: 'os cinco minutos divididos, com o que provar em cada trecho.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Tempo', 'O quê', 'O que precisa ficar claro']}
          linhas={[
            ['0:00–0:40', 'O problema', 'Dinheiro público calculado à mão, sem rastro'],
            ['0:40–1:30', 'A pergunta e o recorte', 'O que está dentro e o que ficou fora'],
            [
              '1:30–3:30',
              'Demonstração',
              'Um lançamento vira score, e o score abre até a origem',
            ],
            [
              '3:30–4:20',
              'Como sabemos que está certo',
              'Regra versionada e teste de caso-limite',
            ],
            [
              '4:20–5:00',
              'O que vem até o SR2',
              'Sprints, validação com a CAM e as duas lentes',
            ],
          ]}
        />
        <Lista
          itens={[
            'Quem demonstra não é quem narra: a troca evita depender de uma pessoa só.',
            'A demo roda com dados sintéticos, e isso é dito em voz alta na abertura.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
