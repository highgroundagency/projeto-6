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
      'Fechar o pacote do SR2: aplicar os ajustes da validação, consolidar as três lentes e comparar planejado com realizado.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ajustes de prioridade alta da validação com a CAM aplicados.',
      'Documentação técnica, análise de segurança e análise de privacidade em versão final.',
      'Comparativo planejado × realizado do semestre, com os desvios explicados.',
      'Ensaio do pitch final, cronometrado.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao:
          'O comparativo planejado × realizado mostra o que não foi feito, com o motivo.',
        porque:
          'Relatório que só lista acerto não é relatório. O que ficou de fora e por quê é o que mostra que houve priorização.',
      },
      {
        decisao: 'Congelar funcionalidade nova a partir desta semana.',
        porque:
          'Feature entrando na véspera é feature sem teste e sem ensaio. O que não está pronto agora vira trabalho futuro declarado.',
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
      { integrante: 'joao-pedro', contribuicao: 'Ajustes de interface da validação.' },
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
      'o que foi escolhido, o que foi recusado, e o que a arquitetura aguenta antes de precisar mudar.',
    Conteudo: () => (
      <>
        <Secao
          titulo="As escolhas, com a alternativa recusada ao lado"
          descricao="Trade-off sem a alternativa nomeada não é trade-off: é justificativa."
        >
          <Tabela
            colunas={['Escolhido', 'Recusado', 'Por quê']}
            linhas={[
              [
                'Funções serverless',
                'Contêiner sempre ligado',
                'A carga é sazonal: pico no fechamento da competência, silêncio no resto do mês. Máquina ligada 30 dias para trabalhar 3 é custo sem serviço',
              ],
              [
                'Postgres gerenciado com RLS',
                'Banco em máquina própria',
                'Autorização no banco vale para todo caminho de escrita, e ninguém da equipe precisa aplicar correção de segurança de madrugada',
              ],
              [
                'Renderização no servidor a cada requisição',
                'Site estático regerado por webhook',
                'O que o visitante pode ver depende do dia E da sessão dele. Estático exigiria uma versão por combinação, ou vazaria conteúdo futuro no HTML',
              ],
              [
                'Treino de ML offline, resultado em JSON',
                'Inferência sob demanda numa função',
                'Partida a frio com scikit-learn custa segundos para exibir número que muda entre deploys. E o JSON versionado é auditável (ADR-022)',
              ],
              [
                'Deploy por push no Git',
                'Pipeline própria com aprovação manual',
                'Uma equipe de seis, num semestre, gasta mais mantendo a esteira do que ganha com ela',
              ],
              [
                'Config em variável de ambiente e no Git',
                'Painel de administração escrevendo em banco',
                'Conteúdo versionado deixa histórico de quem mudou o quê. Formulário não deixa (§7.3)',
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
              ['Áreas técnicas', '10 sintéticas', 'Dezenas: o custo é linear e trivial'],
              ['Indicadores', '30 sintéticos', 'Centenas, sem mudança de arquitetura'],
              [
                'Gestores avaliados',
                'Dezenas na base sintética',
                'Milhares: o cálculo é por gestor e paraleliza sozinho',
              ],
              [
                'Competências',
                'Mensal',
                'Mensal continua sendo o pico; o resto do mês é leitura',
              ],
              [
                'Trilha de auditoria',
                'Centenas de eventos em memória',
                'Cresce para sempre por desenho. Em produção pede índice por ciclo e arquivamento por competência antiga, e isso está declarado como pendência',
              ],
            ]}
          />
          <Nota>
            O gargalo real não é técnico: é a janela de lançamento. Todas as áreas informam nos
            mesmos dois dias do mês, e é ali que a função escala. Serverless resolve exatamente
            esse formato de carga, e é a razão principal da escolha.
          </Nota>
        </Secao>

        <Secao titulo="O que falta para virar produção">
          <Lista
            itens={[
              'Ligar o schema de `supabase/migrations/` ao runtime: ele está escrito, testado contra um Postgres real, e desligado (ADR-011).',
              'Autenticação institucional de verdade no lugar do seletor de perfil simulado, com as políticas de RLS já escritas assumindo o controle.',
              'Rate limit persistente: o contador atual vive na memória de uma instância, e em serverless isso é best-effort declarado.',
              'CSP com nonce por requisição no lugar do unsafe-inline herdado do bootstrap do framework.',
              'Observabilidade além do health check: hoje há `/api/status`, e falta série temporal de erro e latência.',
              'Rotina de backup e teste de restauração do banco, que num sistema que paga gratificação não é opcional.',
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
          descricao="Princípio que não aponta para um arquivo é declaração de intenção."
        >
          <Tabela
            colunas={['Princípio', 'Onde está no código']}
            linhas={[
              [
                'Minimização',
                'A base sintética não tem CPF, e-mail nem telefone, e há teste que falha se aparecerem',
              ],
              [
                'Finalidade',
                'O sistema calcula o percentual devido; folha de pagamento está fora do escopo desde a proposta',
              ],
              [
                'Transparência',
                'A memória de cálculo abre cada passo até a origem, para o próprio avaliado',
              ],
              [
                'Segurança',
                'Trilha append-only, regra versionada e políticas de RLS escritas em supabase/migrations/',
              ],
              ['Prestação de contas', 'Cada evento guarda quem, quando, antes e depois'],
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
                'Tela "meu resultado": score, faixa, histórico e memória de cálculo do próprio avaliado',
              ],
              [
                'Correção',
                'Contestação com resposta da comissão; correção de lançamento gera evento novo sem apagar o anterior',
              ],
              ['Anonimização', 'Ranking anonimizável no painel da gestão'],
              ['Portabilidade', 'Exportação em CSV'],
              ['Informação sobre compartilhamento', 'Não há compartilhamento com terceiros'],
              [
                'Revisão de decisão automatizada (art. 20)',
                'O cálculo é determinístico e a memória mostra cada passo; o ML sinaliza e nunca bloqueia',
              ],
            ]}
          />
        </Secao>

        <Secao titulo="O art. 20 é o centro deste projeto">
          <Lista
            itens={[
              'Decisão automatizada que afeta interesse do titular exige direito a revisão, e gratificação afeta remuneração.',
              'Por isso o cálculo não é caixa-preta: a regra é dado versionado e a memória de cálculo mostra a conta inteira.',
              'Por isso, também, nenhuma saída dos modelos de machine learning entra na conta. Eles informam onde olhar; quem decide é a comissão, e a decisão é contestável.',
            ]}
          />
          <Nota>
            Esta é a razão pela qual a lente de Direito não é um anexo do projeto. Ela
            determinou uma decisão de arquitetura: o motor de cálculo ser função pura e
            auditável, e o ML ficar fora dele.
          </Nota>
        </Secao>
      </>
    ),
  },
  {
    id: 'planejado',
    titulo: 'Planejado × realizado',
    resumo: 'o que foi prometido em cada marco, o que saiu, e o desvio explicado.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Marco', 'Planejado', 'Realizado', 'Desvio']}
          linhas={[
            ['Kick-off', 'Problema, pergunta e recorte', 'a preencher', 'A preencher no SR2'],
            ['SR1', 'Pesquisa e protótipo navegável', 'a preencher', 'A preencher no SR2'],
            [
              'Sprints 1–4',
              'Ciclo completo, auditoria, gestão e analytics',
              'a preencher',
              'A preencher no SR2',
            ],
            ['Semana 11', 'Validação com a CAM', 'a preencher', 'A preencher no SR2'],
          ]}
        />
        <Lista
          itens={[
            'A coluna "realizado" é preenchida no fim, com o que aconteceu, não antes.',
            'Desvio sem explicação não conta: cada linha diz por que mudou.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'futuro',
    titulo: 'Trabalho futuro declarado',
    resumo: 'o que o semestre não cobre, dito na cara em vez de escondido.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Item', 'Por que ficou de fora']}
          linhas={[
            [
              'Persistência em banco no runtime',
              'O schema com RLS está escrito e testado, mas o app roda no seed, ver ADR-011',
            ],
            [
              'Autenticação real por perfil',
              'O seletor é simulado; as políticas que resolveriam isso existem no schema guardado',
            ],
            [
              'Integração com a folha de pagamento',
              'Fora do escopo desde a proposta: o produto calcula e audita, não paga',
            ],
            [
              'Rate limit persistente no painel',
              'O contador vive na memória do processo; em serverless isso é best-effort e está declarado',
            ],
            [
              'CSP com nonce por requisição',
              'A política atual usa unsafe-inline, herdado do bootstrap do framework',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
