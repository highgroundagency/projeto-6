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
      'Fechar a parte de auditoria e a visão da gestão. O ciclo inteiro (o período avaliado) fica rastreável, e a gestão vê os números juntados por área.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Fizemos a linha do tempo do sistema. Ela guarda quem fez cada coisa e quando. Guarda também o que havia antes e o que ficou depois. Uma vez escrita, ninguém apaga nem altera.',
      'Fizemos o painel da gestão. Ele mostra os números juntados por área e um ranking que pode esconder os nomes. Os dados podem ser baixados em planilha (CSV).',
      'Demonstramos o ciclo completo, de ponta a ponta. Ele vai do lançamento (a entrada dos valores dos indicadores) até a aprovação final (homologação).',
      'Criamos o perfil de auditoria. Quem entra com ele lê tudo e não altera nada.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao:
          'A trilha (o histórico de quem mudou o quê) só cresce: nada é apagado nem alterado. Isso é garantido fora do programa.',
        porque:
          'No desenho do banco que guardamos, a regra é um gatilho: o próprio banco a aplica. Por isso vale até para a chave de acesso mais poderosa, não só para quem usa a tela.',
      },
      {
        decisao: 'O ranking tem um modo que esconde os nomes.',
        porque:
          'Comparar pessoas pelo nome, num painel que todos veem, constrange. O produto não precisa causar esse constrangimento.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Preparar o material que vamos usar na validação com a CAM.',
      'Fechar a tela de análises (analytics) com os modelos da lente de aprendizado de máquina (ML).',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'joao-henrique', contribuicao: 'Trilha que só cresce e números por área.' },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Painel da gestão e exportação para planilha.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Perfil de auditoria e conferência das permissões.',
      },
      { integrante: 'kerry', contribuicao: 'Apoia a checagem do ranking sem nomes.' },
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
    resumo:
      'os campos de cada evento da trilha (o histórico de quem mudou o quê) e por que nenhum pode faltar.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Campo', 'Para quê']}
          linhas={[
            ['quem', 'Quem fez a ação. Assim ninguém pode negar depois'],
            ['quando', 'O momento exato. Serve para pôr em ordem e para conferir prazo'],
            [
              'o quê',
              'O tipo do evento. Pode ser lançamento, correção, mudança de etapa (transição) ou aprovação (homologação)',
            ],
            [
              'entidade',
              'Sobre o que é o evento: qual ciclo (o período avaliado), qual indicador',
            ],
            ['antes', 'Como estava antes. Fica vazio só quando o registro está sendo criado'],
            ['depois', 'Como ficou depois. É o que passa a valer'],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
