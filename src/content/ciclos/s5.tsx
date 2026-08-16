import { Lista, Tabela } from '@/components/conteudo'
import { URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/**
 * Semana 5 — Arquitetura. PLANEJAMENTO, não relato.
 *
 * Esta semana ainda não aconteceu. Todos os blocos estão com selo `rascunho`,
 * que a interface exibe como pílula: é o contrato do projeto para "escrito e
 * ainda não validado". `feedback` fica em `nenhum` — inventar fala de professor
 * ou de cliente seria fabricar evidência, não planejar.
 *
 * Quando a semana chegar, o texto é revisto contra o que de fato ocorreu e o
 * selo vira `validado` com o nome de quem revisou.
 */
export const registro = {
  ciclo: 's5',
  marcador: 'PRUMO-MARCADOR-CICLO-s5',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Fechar a arquitetura do MVP e ter o motor de cálculo rodando de ponta a ponta sobre a base sintética.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Modelo de dados fechado: áreas, indicadores, regras versionadas, ciclos, lançamentos e trilha de auditoria.',
      'Motor de cálculo implementado como função pura, com a memória de cálculo saindo do mesmo cálculo que a interface exibe.',
      'Diagramas C4 de contexto e de contêiner publicados em docs/arquitetura.md.',
      'Base sintética com semente fixa gerando as dez áreas e os trinta indicadores.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Regra de pontuação é dado versionado, não código.',
        porque:
          'A portaria muda. Com a regra em `if`, cada mudança vira release e o ciclo antigo deixa de reproduzir o próprio resultado.',
      },
      {
        decisao: 'O motor de cálculo não faz I/O, não lê relógio e não sorteia nada.',
        porque:
          'É o que permite testar fronteira de faixa e arredondamento sem subir infraestrutura, e garante o mesmo número para o mesmo insumo.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Sem acesso à portaria vigente, os pesos dos indicadores da base são arbitrados pela equipe e precisam de conferência com a CAM.',
    ],
  },

  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ligar as telas de lançamento e de resultado ao motor.',
      'Cobrir os casos-limite do cálculo com teste antes do Pré-SR1.',
      'Levantar as perguntas de arquitetura que a banca provavelmente fará.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'joao-henrique', contribuicao: 'Modelo de dados e motor de cálculo.' },
      { integrante: 'rafael', contribuicao: 'Gerador da base sintética com semente fixa.' },
      {
        integrante: 'fernando',
        contribuicao: 'Testes dos casos-limite e documentação técnica.',
      },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Arquitetura do MVP', url: '#doc-s5-arquitetura' },
      { tipo: 'documento', rotulo: 'Modelo de dados', url: '#doc-s5-modelo' },
      { tipo: 'codigo', rotulo: 'Motor de cálculo no repositório', url: URL_REPOSITORIO },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'arquitetura',
    titulo: 'Arquitetura do MVP',
    resumo: 'as camadas, o que cada uma resolve e por que o motor fica isolado.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Camada', 'O que resolve', 'Por que separada']}
          linhas={[
            [
              'Conteúdo (content/)',
              'Registro semanal e documentos, versionados em TSX',
              'Entra no Git com histórico; o painel decide quando aparece, não o que diz',
            ],
            [
              'Regra (lib/calculo/)',
              'Score, faixa e memória de cálculo',
              'Função pura: testável nos casos-limite sem subir nada',
            ],
            [
              'Dados (lib/dados/)',
              'De onde vêm áreas, indicadores e lançamentos',
              'Isola as telas da fonte: trocar seed por banco não reescreve tela',
            ],
            [
              'Release (lib/releases.ts)',
              'O que está visível hoje',
              'Cálculo puro sobre o cronograma, com o "hoje" injetado de fora',
            ],
          ]}
        />
        <Lista
          itens={[
            'Nenhuma camada acima chama a de baixo pulando a do meio: a tela fala com dados, dados falam com a fonte.',
            'O motor de cálculo não conhece nem tela nem banco, recebe números e devolve números com a conta aberta.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'modelo',
    titulo: 'Modelo de dados',
    resumo: 'as sete entidades do MVP e o que cada uma guarda.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Entidade', 'Guarda', 'Observação']}
          linhas={[
            ['Área', 'Sigla e nome da unidade responsável', 'Dez áreas na base sintética'],
            [
              'Indicador',
              'Meta, unidade, peso e área dona',
              'Trinta indicadores; o peso é o que entra na conta',
            ],
            [
              'Regra',
              'Faixas de pontuação, vigência e versão',
              'Alterar cria versão nova; a vigente é escolhida pela competência',
            ],
            [
              'Ciclo',
              'Competência, estado e janela de lançamento',
              'Máquina de estados: só avança um passo por vez',
            ],
            [
              'Lançamento',
              'Valor informado, evidência, autor e data',
              'Correção entra como novo lançamento, não sobrescreve',
            ],
            [
              'Avaliação',
              'Score, faixa e memória de cálculo do gestor no ciclo',
              'Reproduzível: recalcular o ciclo antigo dá o mesmo número',
            ],
            [
              'Evento de auditoria',
              'Quem, quando, o quê, antes e depois',
              'Append-only: a trilha não é editada, só recebe',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
