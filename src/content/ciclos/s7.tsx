import { Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 7 — Sprint 1. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's7',
  marcador: 'PRUMO-MARCADOR-CICLO-s7',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Fechar o ciclo de lançamento. A área técnica informa os números. A CAM enxerga o funil: quanto já entrou e o que falta. E cada avanço de estado fica no histórico.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'A tela de lançamento passou a conferir o envio antes de aceitar. Ela checa o valor, a unidade e a janela do ciclo. Janela é o prazo em que o ciclo ainda recebe lançamentos.',
      'Montamos o painel (dashboard) da Comissão de Avaliação de Metas (CAM). Ele mostra o funil por área: o que cada área já enviou e o que falta. E lista as pendências do ciclo em andamento.',
      'Quando o ciclo muda de estado, o sistema grava o estado anterior e o novo. Isso fica no histórico de quem mudou o quê.',
      'Corrigir um lançamento agora entra como um registro novo. O anterior continua guardado, sem ser sobrescrito.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Correção não sobrescreve: entra como lançamento novo.',
        porque:
          'Sobrescrever apaga o rastro. Quem contesta precisa ver o valor antigo, quem corrigiu e quando.',
      },
      {
        decisao: 'A janela de lançamento é conferida na gravação, não só na tela.',
        porque:
          'A conferência na tela é só uma ajuda para quem digita. A regra do prazo precisa valer para qualquer caminho que grave dados.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Na Sprint 2, ligar a apuração ao motor de cálculo, que faz a conta da nota.',
      'Escrever testes dos casos extremos para a mudança de estado do ciclo.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'joao-henrique',
        contribuicao: 'Gravação dos dados e histórico de mudanças.',
      },
      { integrante: 'joao-pedro', contribuicao: 'Telas de lançamento e painel da CAM.' },
      { integrante: 'fernando', contribuicao: 'Testes do prazo e da mudança de estado.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Tela de lançamento', url: '/sistema/lancamento' },
      { tipo: 'prototipo', rotulo: 'Dashboard da CAM', url: '/sistema/cam' },
      { tipo: 'documento', rotulo: 'Fluxo do ciclo', url: '#doc-s7-fluxo' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'fluxo',
    titulo: 'Fluxo do ciclo',
    resumo: 'os cinco estados do ciclo, quem move cada um e o que fica no histórico.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Estado', 'Quem move', 'O que acontece']}
          linhas={[
            ['rascunho', 'CAM', 'O ciclo foi montado, mas o prazo de envio ainda não abriu'],
            [
              'lançamento aberto',
              'Área técnica',
              'A área informa os valores, com evidência, dentro do prazo',
            ],
            ['em validação', 'CAM', 'A CAM confere os lançamentos e apura o resultado'],
            [
              'homologado',
              'CAM',
              'Resultado aprovado e fechado. O gestor consulta e pode contestar',
            ],
            ['publicado', 'CAM', 'Ciclo encerrado. Nada mais entra'],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
