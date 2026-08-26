import { Lista, Nota, Quadro, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's4',
  marcador: 'PRUMO-MARCADOR-CICLO-s4',

  objetivo: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo:
      'Transformar a ideia escolhida em proposta com escopo delimitado, backlog priorizado e cronograma de execução.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Proposta de solução escrita em uma página.',
      'Escopo dentro e fora definido, com o que fica explicitamente de fora.',
      'Backlog inicial em épicos e histórias de usuário, classificado por MoSCoW.',
      'Papéis confirmados e cronograma de execução amarrado aos marcos do semestre.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao: 'Folha de pagamento fica fora do escopo.',
        porque:
          'O sistema calcula e publica o resultado; integrar com folha exige acesso e homologação que o semestre não comporta.',
      },
      {
        decisao:
          'Quatro perfis de acesso desde o protótipo, com os papéis que o cliente nomeou na reunião de 22/08: coordenação da SEAB, administrador, gerente distrital e gerente de unidade.',
        porque:
          'O controle de acesso é parte do problema de confiabilidade, não um enfeite para depois.',
      },
      {
        decisao: 'Auditoria é append-only: nada se apaga.',
        porque:
          'Trilha que pode ser editada não serve de prova, e é isso que a planilha já não oferece.',
      },
      {
        decisao: 'Priorização por MoSCoW com o corte do SR1 nos "Must".',
        porque: 'Deixa explícito o que é entrega mínima e o que é desejável.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: 'nenhum',
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'O backlog nasceu grande demais para um semestre. O corte foi feito na revisão: 25 histórias, com os "Must" cabendo até o SR1.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Preparar o pitch de 5 minutos do Kick-off, com fala dividida entre os seis.',
      'Fechar o diagrama de arquitetura e o fluxo de dados para a Semana 5.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Escreveu a proposta e o backlog priorizado.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Delimitou o escopo técnico e as fronteiras de integração.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Converteu as histórias em fluxo de telas.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Amarrou cada história a uma dor levantada na pesquisa.',
      },
      {
        integrante: 'rafael',
        contribuicao: 'Especificou as histórias da frente de dados e ML.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Revisou o escopo sob a ótica de segurança e privacidade.',
      },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      { tipo: 'documento', rotulo: 'Proposta e escopo', url: '/#ciclo-s4' },
      { tipo: 'documento', rotulo: 'Backlog inicial', url: '/#ciclo-s4' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'proposta',
    titulo: 'Proposta em uma página',
    resumo: 'o produto, o recorte e a aposta central.',
    Conteudo: () => (
      <>
        <Lista
          itens={[
            'O quê: um sistema web que substitui a planilha de consolidação da gratificação por desempenho.',
            'Para quem: os quatro atores que o cliente nomeou, coordenação da SEAB, administrador da plataforma, gerentes distritais e gerentes de unidade.',
            'Como: subindicadores preenchidos pelas unidades; indicador calculado; régua (meta e peso) por tipo de unidade, dentro da regra versionada; cálculo por função pura; memória de cálculo exibida junto de cada resultado; trilha de auditoria imutável.',
            'Por que agora: o processo depende de poucas pessoas e não tem rastreabilidade, um erro só aparece depois do pagamento.',
            'Como saberemos que deu certo: qualquer número do resultado responde “de onde veio?” em um clique, e o mesmo ciclo recalculado devolve o mesmo valor.',
          ]}
        />
        <div className="mt-3">
          <Nota>
            Atualizado depois da reunião com o cliente de 22/08 (ver o documento da Semana 3):
            o domínio ganhou subindicadores, tipos de unidade e a rede por distrito.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'escopo',
    titulo: 'Escopo',
    resumo: 'o que entra e o que fica de fora do semestre.',
    Conteudo: () => (
      <>
        <Quadro
          quadrantes={[
            {
              titulo: 'Dentro',
              itens: [
                'Cadastro da rede (distritos, tipos, unidades) e do catálogo de indicadores com seus subindicadores',
                'Régua por tipo de unidade (meta e peso na regra versionada)',
                'Lançamento por subindicador pelas unidades, com evidência e janela de revisão de 5 dias',
                'Motor de cálculo com memória composta, subindicador por subindicador',
                'Avaliação por unidade e a distrital (média das unidades do distrito)',
                'Estados do ciclo, da abertura à publicação, com trilha de auditoria',
                'Consulta do próprio resultado pelo gerente e abertura de contestação',
                'Painel agregado por distrito e exportação em CSV',
                'Analytics com os resultados dos modelos e o método declarado',
              ],
            },
            {
              titulo: 'Fora',
              itens: [
                'Integração com folha de pagamento',
                'Autenticação corporativa da prefeitura',
                'Migração de dados históricos reais',
                'Aplicativo mobile nativo',
                'Cálculo de outras verbas que não a gratificação por desempenho',
              ],
            },
          ]}
        />
      </>
    ),
  },
  {
    id: 'backlog',
    titulo: 'Backlog inicial',
    resumo: 'os itens priorizados com estimativa e critério de pronto.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Épico', 'História', 'MoSCoW']}
          linhas={[
            [
              'Ciclo',
              'Como SEAB, quero abrir um ciclo de avaliação para que as unidades possam lançar dados',
              'M',
            ],
            [
              'Ciclo',
              'Como SEAB, quero definir a janela de lançamento, com a janela de revisão nos dias finais, para controlar o prazo',
              'M',
            ],
            [
              'Ciclo',
              'Como SEAB, quero avançar o estado do ciclo para refletir a etapa real do processo',
              'M',
            ],
            ['Ciclo', 'Como SEAB, quero homologar o ciclo para congelar os resultados', 'M'],
            [
              'Ciclo',
              'Como SEAB, quero publicar o ciclo para que os gerentes vejam seus resultados',
              'S',
            ],
            [
              'Régua',
              'Como SEAB, quero cadastrar indicadores compostos por subindicadores (índice ou razão) para refletir o processo real',
              'M',
            ],
            [
              'Régua',
              'Como SEAB, quero definir quais indicadores valem para cada tipo de unidade, com meta e peso próprios, para respeitar o recorte de cada tipo',
              'M',
            ],
            [
              'Régua',
              'Como SEAB, quero criar uma nova versão da regra para não alterar ciclos já fechados',
              'M',
            ],
            [
              'Régua',
              'Como SEAB, quero ver o diff entre versões da regra para saber o que mudou',
              'S',
            ],
            [
              'Régua',
              'Como SEAB, quero definir a vigência da regra para que cada ciclo use a versão certa',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero lançar cada subindicador da minha unidade (valor, ou numerador e denominador) para cumprir minha parte',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero anexar a evidência do dado para sustentar o que informei',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero corrigir um lançamento na janela de revisão, com o valor antigo guardado, para acertar engano',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente distrital, quero revisar os lançamentos das minhas unidades na janela de revisão para responder pelo distrito',
              'S',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero ser avisado de valor fora do padrão para conferir antes de enviar',
              'C',
            ],
            [
              'Resultado',
              'Como gerente de unidade, quero ver o score e a faixa da minha unidade para saber meu resultado',
              'M',
            ],
            [
              'Resultado',
              'Como gerente de unidade, quero abrir a memória de cálculo, com a composição de cada subindicador, para entender de onde veio o número',
              'M',
            ],
            [
              'Resultado',
              'Como gerente distrital, quero ver minha nota como média das unidades do distrito, com a composição aberta, para saber meu resultado',
              'M',
            ],
            [
              'Resultado',
              'Como gerente, quero comparar meus ciclos para acompanhar minha evolução',
              'S',
            ],
            [
              'Resultado',
              'Como gerente, quero abrir contestação para questionar um resultado',
              'S',
            ],
            [
              'Resultado',
              'Como SEAB, quero responder a contestação para encerrar o questionamento com registro',
              'S',
            ],
            [
              'Governança',
              'Como administrador, quero ver a linha do tempo de tudo que aconteceu para dar suporte e fiscalizar',
              'M',
            ],
            [
              'Governança',
              'Como administrador, quero que nada possa ser apagado para que a trilha sirva de prova',
              'M',
            ],
            [
              'Governança',
              'Como SEAB, quero ver agregados por distrito para enxergar o funil do ciclo',
              'S',
            ],
            [
              'Governança',
              'Como SEAB, quero exportar os resultados em CSV para usar em outros relatórios',
              'C',
            ],
            [
              'Governança',
              'Como SEAB, quero ver o risco de não-atingimento no próximo ciclo para agir antes',
              'C',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
