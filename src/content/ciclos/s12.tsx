import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 12 — Pré-SR2. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's12',
  marcador: 'PRUMO-MARCADOR-CICLO-s12',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Fechar o pacote do SR2. Aplicar os ajustes que saíram da validação, juntar as três lentes e comparar o que planejamos com o que fizemos.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Aplicamos os ajustes de prioridade alta que saíram da validação com a CAM.',
      'Fechamos a versão final da documentação técnica, da análise de segurança e da análise de privacidade.',
      'Comparamos o que planejamos com o que fizemos no semestre (planejado × realizado). Cada desvio tem o motivo explicado.',
      'Ensaiamos o pitch final com cronômetro.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'O comparativo planejado × realizado mostra o que não foi feito, e por quê.',
        porque:
          'Relatório que só lista acerto não é relatório. Mostrar o que ficou de fora, e o motivo, prova que escolhemos prioridades.',
      },
      {
        decisao: 'Nenhuma funcionalidade nova a partir desta semana.',
        porque:
          'Funcionalidade que entra na véspera chega sem teste e sem ensaio. O que não está pronto agora entra na lista de trabalho futuro declarado.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Apresentar o SR2.',
      'Publicar o comparativo planejado × realizado junto do pacote final.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Pacote do SR2 e comparativo planejado × realizado.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Documentação técnica, segurança e privacidade.',
      },
      { integrante: 'joao-pedro', contribuicao: 'Ajustes de tela que saíram da validação.' },
      { integrante: 'kerry', contribuicao: 'Apoia a conferência do planejado × realizado.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Planejado × realizado', url: '#doc-s12-planejado' },
      { tipo: 'documento', rotulo: 'Trabalho futuro declarado', url: '#doc-s12-futuro' },
      {
        tipo: 'documento',
        rotulo: 'Nuvem: trade-offs de infraestrutura e evolução',
        url: '#doc-s12-nuvem',
      },
      {
        tipo: 'documento',
        rotulo: 'Direito: Privacy by Design e direitos dos titulares',
        url: '#doc-s12-direito-titulares',
      },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'nuvem',
    titulo: 'Nuvem: trade-offs de infraestrutura e evolução',
    resumo:
      'o que escolhemos, o que recusamos, e até onde a arquitetura aguenta antes de precisar mudar.',
    Conteudo: () => (
      <>
        <Secao
          titulo="As escolhas, com a alternativa recusada ao lado"
          descricao="Toda escolha tem uma alternativa que recusamos. Sem dizer qual foi, a escolha vira só justificativa."
        >
          <Tabela
            colunas={['Escolhido', 'Recusado', 'Por quê']}
            linhas={[
              [
                'Funções sem servidor fixo (serverless)',
                'Contêiner sempre ligado',
                'A carga vem em ondas. Tem pico no fechamento de cada mês avaliado (a competência) e silêncio no resto do mês. Uma máquina ligada 30 dias para trabalhar 3 é custo sem serviço',
              ],
              [
                'Postgres gerenciado, com as regras de acesso no banco (RLS)',
                'Banco em máquina própria',
                'Regra de acesso dentro do banco vale para todo caminho de escrita. E ninguém da equipe precisa aplicar correção de segurança de madrugada',
              ],
              [
                'Página montada no servidor a cada pedido',
                'Site estático, gerado de novo por aviso automático (webhook)',
                'O que o visitante pode ver depende do dia e também da sessão dele. Um site estático precisaria de uma versão por combinação. Ou vazaria conteúdo futuro no HTML',
              ],
              [
                'Modelos de ML treinados antes, fora do sistema (offline), com o resultado guardado em JSON',
                'Modelo rodando na hora, dentro de uma função',
                'Carregar o scikit-learn do zero custa segundos. Isso para mostrar um número que só muda entre uma publicação e outra. E o JSON guardado no Git pode ser conferido depois (ADR-022)',
              ],
              [
                'Publicação automática a cada envio ao Git',
                'Esteira própria, com aprovação manual',
                'Uma equipe de seis, num semestre, gasta mais mantendo a esteira do que ganha com ela',
              ],
              [
                'Configuração em variável de ambiente e no Git',
                'Painel de administração gravando no banco',
                'Conteúdo guardado no Git deixa histórico de quem mudou o quê. Formulário não deixa (§7.3)',
              ],
            ]}
          />
        </Secao>

        <Secao
          titulo="Até onde isto aguenta"
          descricao="Número honesto: a SESAU tem dezenas de indicadores e centenas de avaliados, não milhões."
        >
          <Tabela
            colunas={['Dimensão', 'Hoje no protótipo', 'O que aguentaria em produção']}
            linhas={[
              [
                'Áreas técnicas',
                '10, na base de teste',
                'Dezenas: o custo cresce na mesma proporção e é pequeno',
              ],
              ['Indicadores', '30, na base de teste', 'Centenas, sem mudar a arquitetura'],
              [
                'Gestores avaliados',
                'Dezenas, na base de teste',
                'Milhares: a conta é feita gestor por gestor, então roda em paralelo sem esforço',
              ],
              [
                'Competências (meses avaliados)',
                'Mensal',
                'Mensal continua sendo o pico; o resto do mês é só leitura',
              ],
              [
                'Histórico de quem mudou o quê (trilha de auditoria)',
                'Centenas de eventos em memória',
                'Cresce para sempre, por desenho. Em produção vai precisar de índice por ciclo e de arquivamento dos meses antigos. Isso já está declarado como pendência',
              ],
            ]}
          />
          <Nota>
            O gargalo real não é técnico. É a janela de lançamento: todas as áreas informam nos
            mesmos dois dias do mês. É ali que a função precisa crescer. Funções sem servidor
            fixo (serverless) resolvem exatamente esse formato de carga. Essa é a razão
            principal da escolha.
          </Nota>
        </Secao>

        <Secao titulo="O que falta para virar produção">
          <Lista
            itens={[
              'Ligar o esquema do banco em `supabase/migrations/` ao sistema em execução. Ele está escrito e testado contra um Postgres real, mas segue desligado (ADR-011).',
              'Trocar o seletor de perfil simulado por login institucional de verdade. As regras de acesso do banco (RLS) já estão escritas e assumiriam o controle.',
              'Guardar o limite de tentativas (rate limit) fora da memória. Hoje o contador vive na memória de uma instância. Em serverless isso funciona só na medida do possível, e está declarado assim.',
              'Trocar a política de segurança de conteúdo (CSP) para usar um código único por pedido (nonce). Hoje ela usa unsafe-inline, herdado da configuração inicial do framework.',
              'Acompanhar o sistema além da checagem de saúde. Hoje existe `/api/status`. Falta o registro de erros e de tempo de resposta ao longo do tempo.',
              'Criar a rotina de cópia de segurança (backup) do banco, com teste de restauração. Num sistema que paga gratificação, isso não é opcional.',
            ]}
          />
        </Secao>
      </>
    ),
  },
  {
    id: 'direito-titulares',
    titulo: 'Direito: Privacy by Design e direitos dos titulares',
    resumo: 'onde a privacidade está no código, e como cada direito do art. 18 é atendido.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Privacy by Design, apontando o código"
          descricao="Princípio que não aponta para um arquivo é só declaração de intenção."
        >
          <Tabela
            colunas={['Princípio', 'Onde está no código']}
            linhas={[
              [
                'Minimização',
                'A base de teste não tem CPF, e-mail nem telefone. Há um teste que falha se algum deles aparecer',
              ],
              [
                'Finalidade',
                'O sistema calcula o percentual devido. A folha de pagamento está fora do escopo desde a proposta',
              ],
              [
                'Transparência',
                'A memória de cálculo mostra cada passo da conta até a origem. O próprio avaliado pode ver',
              ],
              [
                'Segurança',
                'Histórico que só recebe registro novo, nunca apaga. Regra guardada com número de versão. Regras de acesso do banco (RLS) escritas em supabase/migrations/',
              ],
              [
                'Prestação de contas',
                'Cada evento guarda quem mudou, quando, o valor antes e o valor depois',
              ],
            ]}
          />
        </Secao>

        <Secao
          titulo="Direitos do titular (art. 18)"
          descricao="Cada direito, e a tela que o atende."
        >
          <Tabela
            colunas={['Direito', 'Como o sistema atende']}
            linhas={[
              [
                'Confirmação e acesso',
                'Tela "meu resultado": o avaliado vê a própria nota (score), a faixa, o histórico e a memória de cálculo',
              ],
              [
                'Correção',
                'O avaliado contesta e a comissão responde. Corrigir um lançamento gera um evento novo, sem apagar o anterior',
              ],
              ['Anonimização', 'O ranking no painel da gestão pode ser mostrado sem nomes'],
              ['Portabilidade', 'Exportação em CSV'],
              ['Informação sobre compartilhamento', 'Não há compartilhamento com terceiros'],
              [
                'Revisão de decisão automatizada (art. 20)',
                'A mesma entrada dá sempre a mesma conta, e a memória mostra cada passo. O ML só aponta onde olhar, nunca bloqueia',
              ],
            ]}
          />
        </Secao>

        <Secao titulo="O art. 20 é o centro deste projeto">
          <Lista
            itens={[
              'Decisão automática que afeta o interesse do titular, a pessoa dona dos dados, exige direito a revisão. Gratificação afeta o salário.',
              'Por isso a conta não é caixa-preta. A regra é guardada como dado, com número de versão. A memória de cálculo mostra a conta inteira.',
              'Por isso, também, nenhum resultado dos modelos de machine learning entra na conta. Eles só apontam onde olhar. Quem decide é a comissão, e a decisão pode ser contestada.',
            ]}
          />
          <Nota>
            É por isso que a lente de Direito não é um anexo do projeto. Ela determinou uma
            decisão de arquitetura. O motor de cálculo é uma função pura: só depende do que
            recebe e não mexe em nada de fora. Cada passo dele pode ser conferido. E o ML fica
            fora dele.
          </Nota>
        </Secao>
      </>
    ),
  },
  {
    id: 'planejado',
    titulo: 'Planejado × realizado',
    resumo: 'o que prometemos em cada marco, o que entregamos, e o desvio explicado.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Marco', 'Planejado', 'Realizado', 'Desvio']}
          linhas={[
            ['Kick-off', 'Problema, pergunta e recorte', 'a preencher', 'A preencher no SR2'],
            ['SR1', 'Pesquisa e protótipo navegável', 'a preencher', 'A preencher no SR2'],
            [
              'Sprints 1 a 4',
              'Ciclo completo, auditoria, gestão e analytics',
              'a preencher',
              'A preencher no SR2',
            ],
            ['Semana 11', 'Validação com a CAM', 'a preencher', 'A preencher no SR2'],
          ]}
        />
        <Lista
          itens={[
            'A coluna "realizado" só é preenchida no fim, com o que de fato aconteceu.',
            'Desvio sem explicação não conta. Cada linha diz por que mudou.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'futuro',
    titulo: 'Trabalho futuro declarado',
    resumo: 'o que o semestre não cobre, dito às claras em vez de escondido.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Item', 'Por que ficou de fora']}
          linhas={[
            [
              'Banco de dados ligado ao sistema em execução',
              'O esquema do banco, com as regras de acesso (RLS), está escrito e testado. Mas o app roda sobre a base de teste (seed). Ver ADR-011',
            ],
            [
              'Autenticação (login) real por perfil',
              'O seletor de perfil é simulado. As regras que resolveriam isso já existem no esquema guardado',
            ],
            [
              'Integração com a folha de pagamento',
              'Fora do escopo desde a proposta. O produto calcula e guarda o histórico para conferência, não paga',
            ],
            [
              'Limite de tentativas (rate limit) persistente no painel',
              'O contador vive na memória do processo. Em funções sem servidor fixo (serverless) isso funciona só na medida do possível, e está declarado',
            ],
            [
              'Política de segurança de conteúdo (CSP) com código único por pedido (nonce)',
              'A política atual usa unsafe-inline, herdado da configuração inicial do framework',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
