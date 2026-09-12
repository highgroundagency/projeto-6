import { Lista, Nota, Quadro, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's4',
  marcador: 'PRUMO-MARCADOR-CICLO-s4',

  objetivo: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo:
      'Transformar a ideia escolhida em proposta. Isso pede escopo definido, lista de tarefas (backlog) por prioridade e cronograma de execução.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Escrevemos a proposta de solução em uma página.',
      'Definimos o escopo. Listamos o que entra no semestre e, por escrito, o que fica de fora.',
      'Montamos o backlog inicial: a lista de tarefas, em grupos (épicos) e histórias de usuário. Cada história recebeu uma prioridade pelo método MoSCoW: obrigatória (Must), desejável (Should) ou possível (Could).',
      'Confirmamos o papel de cada integrante. Amarramos o cronograma de execução aos marcos do semestre.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao: 'Folha de pagamento fica fora do escopo.',
        porque:
          'O sistema calcula o valor e publica o resultado. Ligar isso à folha de pagamento exige acesso e aprovação que o semestre não comporta.',
      },
      {
        decisao:
          'Quatro perfis de acesso desde o protótipo, com os papéis que o cliente nomeou na reunião de 22/08. São eles: coordenação da SEAB, administrador, gerente distrital e gerente de unidade.',
        porque:
          'Controlar o acesso faz parte do problema de confiabilidade. Não é enfeite para depois.',
      },
      {
        decisao: 'O histórico de mudanças só cresce: nada se apaga.',
        porque:
          'Um histórico que pode ser editado não serve de prova. Prova é justamente o que a planilha de hoje não oferece.',
      },
      {
        decisao: 'Prioridade por MoSCoW: o SR1 entrega os "Must".',
        porque: 'Assim fica claro o que é a entrega mínima e o que é desejável.',
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
          'A lista de tarefas nasceu grande demais para um semestre. Cortamos na revisão: ficaram 25 histórias, com os "Must" cabendo até o SR1.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Preparar o pitch de 5 minutos do Kick-off, com a fala dividida entre os seis.',
      'Fechar o desenho da arquitetura e o fluxo de dados para a Semana 5.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Escreveu a proposta e o backlog, já com as prioridades.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Definiu o escopo técnico e os limites de integração.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Transformou as histórias em fluxo de telas.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Ligou cada história a uma dor da pesquisa.',
      },
      {
        integrante: 'rafael',
        contribuicao: 'Detalhou as histórias de dados e ML (aprendizado de máquina).',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Revisou o escopo pelo lado da segurança e da privacidade.',
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
    resumo: 'o que é o produto, até onde ele vai e a aposta central.',
    Conteudo: () => (
      <>
        <Lista
          itens={[
            'O quê: um sistema na web. Ele substitui a planilha que hoje junta os dados da gratificação por desempenho.',
            'Para quem: os quatro papéis que o cliente nomeou. Coordenação da SEAB, administrador da plataforma, gerentes distritais e gerentes de unidade.',
            'Como: cada unidade informa os itens medidos. O sistema calcula o indicador a partir deles. A meta e o peso variam por tipo de unidade. Eles ficam guardados na regra, que tem número de versão. O cálculo é uma conta que não depende de nada de fora. A memória de cálculo, o passo a passo da conta, aparece junto de cada resultado. O histórico de quem mudou o quê não pode ser alterado.',
            'Por que agora: o processo depende de poucas pessoas. Ninguém consegue seguir o caminho de cada número. Um erro só aparece depois do pagamento.',
            'Como saberemos que deu certo: qualquer número do resultado responde “de onde veio?” num clique. E o mesmo ciclo, recalculado, devolve o mesmo valor.',
          ]}
        />
        <div className="mt-3">
          <Nota>
            Atualizamos este texto depois da reunião com o cliente de 22/08 (ver o documento da
            Semana 3). O desenho do sistema ganhou os itens medidos dentro de cada indicador.
            Ganhou também os tipos de unidade e a rede por distrito.
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
                'Cadastro da rede: distritos, tipos de unidade e unidades. Cadastro da lista de indicadores, com os itens medidos de cada um',
                'Meta e peso por tipo de unidade, guardados na regra com número de versão',
                'Cada unidade informa seus itens medidos e anexa a evidência. Há uma janela de revisão de 5 dias',
                'O cálculo do resultado, com a memória de cálculo montada item medido por item medido',
                'Avaliação por unidade e avaliação do distrito (a média das unidades do distrito)',
                'As etapas do ciclo, da abertura à publicação, com histórico de quem mudou o quê',
                'O gerente consulta o próprio resultado e pode abrir contestação',
                'Painel com os números reunidos por distrito e exportação em CSV',
                'Análises (analytics) com os resultados dos modelos e o método usado, dito por escrito',
              ],
            },
            {
              titulo: 'Fora',
              itens: [
                'Integração com folha de pagamento',
                'Login com a conta corporativa da prefeitura',
                'Trazer os dados históricos reais para o sistema',
                'Aplicativo próprio para celular (nativo)',
                'Cálculo de qualquer outra verba além da gratificação por desempenho',
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
    resumo: 'os itens por prioridade, com estimativa e o que conta como pronto.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Épico', 'História', 'MoSCoW']}
          linhas={[
            [
              'Ciclo',
              'Como SEAB, quero abrir um ciclo de avaliação para que as unidades possam informar seus dados',
              'M',
            ],
            [
              'Ciclo',
              'Como SEAB, quero definir a janela de lançamento, com a revisão nos dias finais, para controlar o prazo',
              'M',
            ],
            [
              'Ciclo',
              'Como SEAB, quero avançar a etapa do ciclo para que ela reflita o ponto real do processo',
              'M',
            ],
            [
              'Ciclo',
              'Como SEAB, quero aprovar o ciclo para que os resultados não mudem mais',
              'M',
            ],
            [
              'Ciclo',
              'Como SEAB, quero publicar o ciclo para que os gerentes vejam seus resultados',
              'S',
            ],
            [
              'Régua',
              'Como SEAB, quero cadastrar indicadores formados por itens medidos (um índice ou uma razão) para refletir o processo real',
              'M',
            ],
            [
              'Régua',
              'Como SEAB, quero definir quais indicadores valem para cada tipo de unidade, com meta e peso próprios. Assim respeito a realidade de cada tipo',
              'M',
            ],
            [
              'Régua',
              'Como SEAB, quero criar uma nova versão da regra para não alterar ciclos já fechados',
              'M',
            ],
            [
              'Régua',
              'Como SEAB, quero comparar duas versões da regra para saber o que mudou',
              'S',
            ],
            [
              'Régua',
              'Como SEAB, quero definir de quando até quando a regra vale, para que cada ciclo use a versão certa',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero informar cada item medido da minha unidade (um valor, ou numerador e denominador). Assim cumpro minha parte',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero anexar a evidência do dado para sustentar o que informei',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero corrigir um dado na janela de revisão, com o valor antigo guardado. Assim conserto um engano',
              'M',
            ],
            [
              'Lançamento',
              'Como gerente distrital, quero revisar os dados informados pelas minhas unidades na janela de revisão para responder pelo distrito',
              'S',
            ],
            [
              'Lançamento',
              'Como gerente de unidade, quero ser avisado de valor fora do padrão para conferir antes de enviar',
              'C',
            ],
            [
              'Resultado',
              'Como gerente de unidade, quero ver a nota e a faixa da minha unidade para saber meu resultado',
              'M',
            ],
            [
              'Resultado',
              'Como gerente de unidade, quero abrir a memória de cálculo, com a conta de cada item medido. Assim entendo de onde veio o número',
              'M',
            ],
            [
              'Resultado',
              'Como gerente distrital, quero ver minha nota como a média das unidades do distrito, com a conta aberta. Assim sei meu resultado',
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
              'Como SEAB, quero responder à contestação para encerrar o questionamento, com tudo registrado',
              'S',
            ],
            [
              'Governança',
              'Como administrador, quero ver a linha do tempo de tudo que aconteceu para dar suporte e fiscalizar',
              'M',
            ],
            [
              'Governança',
              'Como administrador, quero que nada possa ser apagado para que o histórico sirva de prova',
              'M',
            ],
            [
              'Governança',
              'Como SEAB, quero ver os totais por distrito para enxergar o andamento do ciclo',
              'S',
            ],
            [
              'Governança',
              'Como SEAB, quero exportar os resultados em CSV para usar em outros relatórios',
              'C',
            ],
            [
              'Governança',
              'Como SEAB, quero ver o risco de a meta não ser atingida no próximo ciclo para agir antes',
              'C',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
