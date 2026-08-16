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
      'Fechar o ciclo de lançamento: área técnica informa, a CAM enxerga o funil e o estado avança com trilha.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Tela de lançamento validando valor, unidade e janela do ciclo antes de aceitar.',
      'Dashboard da CAM com funil por área e pendências do ciclo em andamento.',
      'Transição de estado do ciclo gravando antes e depois na trilha de auditoria.',
      'Correção de lançamento entrando como evento novo, sem sobrescrever o anterior.',
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
        decisao: 'A janela de lançamento é conferida na camada de escrita, não só na tela.',
        porque:
          'Validação de interface é conveniência; a regra tem que valer para qualquer caminho de escrita.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ligar a apuração ao motor de cálculo na Sprint 2.',
      'Cobrir a transição de estado com teste de caso-limite.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'joao-henrique', contribuicao: 'Camada de escrita e trilha de auditoria.' },
      { integrante: 'joao-pedro', contribuicao: 'Telas de lançamento e dashboard da CAM.' },
      { integrante: 'fernando', contribuicao: 'Testes da janela e da transição.' },
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
    resumo: 'os cinco estados, quem move cada um e o que fica na trilha.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Estado', 'Quem move', 'O que acontece']}
          linhas={[
            ['rascunho', 'CAM', 'Ciclo montado, ainda sem janela aberta'],
            [
              'lançamento aberto',
              'Área técnica',
              'Valores informados com evidência, dentro do prazo',
            ],
            ['em validação', 'CAM', 'Conferência dos lançamentos e apuração'],
            ['homologado', 'CAM', 'Resultado fechado; gestor consulta e pode contestar'],
            ['publicado', 'CAM', 'Ciclo encerrado; nada mais entra'],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
