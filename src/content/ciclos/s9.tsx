import { Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 9 — Sprint 3. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's9',
  marcador: 'PRUMO-MARCADOR-CICLO-s9',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Fechar auditoria e visão de gestão: o ciclo inteiro rastreável e os agregados por área.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Linha do tempo imutável com autor, momento, antes e depois de cada evento.',
      'Painel da gestão com agregados por área, ranking anonimizável e exportação em CSV.',
      'Ciclo completo demonstrado de ponta a ponta, de lançamento a homologação.',
      'Perfil de auditoria que lê tudo e não escreve nada.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A trilha é append-only, e isso é garantido fora da aplicação.',
        porque:
          'No schema guardado é gatilho de banco: vale até para a chave mais privilegiada, não só para quem passa pela tela.',
      },
      {
        decisao: 'O ranking tem modo anônimo.',
        porque:
          'Comparar pessoas nominalmente num painel aberto cria constrangimento que o produto não precisa causar.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Preparar os instrumentos da validação com a CAM.',
      'Fechar a tela de analytics com os modelos da lente de ML.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'joao-henrique', contribuicao: 'Trilha append-only e agregados.' },
      { integrante: 'joao-pedro', contribuicao: 'Painel da gestão e exportação.' },
      {
        integrante: 'fernando',
        contribuicao: 'Perfil de auditoria e conferência de permissões.',
      },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Auditoria', url: '/sistema/auditoria' },
      { tipo: 'dashboard', rotulo: 'Painel da gestão', url: '/sistema/gestao' },
      { tipo: 'documento', rotulo: 'O que a trilha registra', url: '#doc-s9-trilha' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'trilha',
    titulo: 'O que a trilha registra',
    resumo: 'os campos de cada evento e por que nenhum é opcional.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Campo', 'Para quê']}
          linhas={[
            ['quem', 'Autor da ação, para que ninguém possa negar depois'],
            ['quando', 'Momento exato, para ordenar e para conferir prazo'],
            ['o quê', 'Tipo do evento: lançamento, correção, transição, homologação'],
            ['entidade', 'A que o evento se refere: qual ciclo, qual indicador'],
            ['antes', 'Estado anterior: nulo só quando o registro está nascendo'],
            ['depois', 'Estado novo, que é o que passa a valer'],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
