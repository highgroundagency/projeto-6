import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
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
      'Fechar o desenho da arquitetura do MVP. Ter o motor de cálculo (a parte que faz a conta da nota) rodando de ponta a ponta. Ele roda sobre a base de teste, feita só de dados inventados.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Fechamos o desenho das tabelas do sistema, seguindo o que o cliente contou na reunião. Ele guarda os distritos, as unidades de saúde e o tipo de cada uma. Guarda os indicadores e os itens medidos que formam cada um. Guarda a regra da nota, com número de versão e metas e pesos por tipo de unidade. Guarda os ciclos, que são os meses avaliados, e os números informados. Por fim, guarda o histórico de quem mudou o quê.',
      'Escrevemos o motor de cálculo, a parte do sistema que faz a conta da nota. É uma conta que não depende de nada de fora. O passo a passo que a tela mostra (a memória de cálculo) sai dessa mesma conta.',
      'Publicamos os desenhos da arquitetura em docs/arquitetura.md. São dois, no padrão C4: o de contexto e o de contêiner. C4 é um jeito conhecido de desenhar sistemas em níveis de zoom.',
      'Montamos a base de teste, gerada por programa e sempre igual. Ela cria os 3 distritos e as 12 unidades, de 4 tipos. Cria também os 7 indicadores e os 11 itens medidos que os formam.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A regra da nota fica guardada como dado, com número de versão, e não como código.',
        porque:
          'A portaria muda. Se a regra estivesse escrita dentro do programa, toda mudança exigiria mexer no código e publicar versão nova. E o ciclo antigo deixaria de reproduzir a própria nota.',
      },
      {
        decisao: 'O motor de cálculo não lê nem grava nada fora dele, não olha o relógio e não sorteia nada.',
        porque:
          'Assim testamos as bordas de cada faixa e o arredondamento sem ligar servidor nenhum. E o mesmo dado de entrada dá sempre o mesmo número.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ainda não temos a planilha real prometida na reunião. Por isso a equipe definiu sozinha as metas e os pesos por tipo de unidade. O cliente precisa conferir esses valores.',
    ],
  },

  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ligar as telas de lançamento e de resultado ao motor de cálculo.',
      'Escrever testes para os casos extremos da conta antes do Pré-SR1.',
      'Listar as perguntas sobre arquitetura que a banca deve fazer.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'joao-henrique', contribuicao: 'Modelo de dados (o desenho das tabelas) e motor de cálculo.' },
      { integrante: 'rafael', contribuicao: 'Gerador da base de teste, sempre igual.' },
      {
        integrante: 'fernando',
        contribuicao: 'Testes dos casos extremos e documentação técnica.',
      },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Arquitetura do MVP', url: '#doc-s5-arquitetura' },
      { tipo: 'documento', rotulo: 'Modelo de dados', url: '#doc-s5-modelo' },
      {
        tipo: 'documento',
        rotulo: 'Nuvem: arquitetura nativa e fluxo de dados',
        url: '#doc-s5-nuvem',
      },
      { tipo: 'codigo', rotulo: 'Motor de cálculo no repositório', url: URL_REPOSITORIO },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'nuvem',
    titulo: 'Nuvem: arquitetura nativa e fluxo de dados',
    resumo:
      'onde cada parte do sistema roda, como elas conversam entre si, e o que a nuvem mudou no produto.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Onde cada parte roda"
          descricao="A matriz de avaliação pede as peças de infraestrutura e como elas se ligam. Estas são as peças do MVP. Nenhuma delas é um servidor que a equipe precise cuidar."
        >
          <Tabela
            colunas={['Componente', 'Onde roda', 'Por que ali']}
            linhas={[
              [
                'Páginas e telas',
                'Na Vercel, como função sem servidor fixo (serverless). Roda uma vez por pedido',
                'O que fica visível depende do dia e de quem está logado. Por isso a página não pode ser montada antes. O modo `force-dynamic` vem dessa regra, não de preguiça',
              ],
              [
                'Porta do painel',
                'Num filtro (middleware) na borda da rede, antes da função',
                'Barrar antes de acordar a função custa menos e é mais seguro. Quem não está logado nunca chega ao código do painel',
              ],
              [
                'Arquivos estáticos (assets) e fontes',
                'Numa rede de distribuição (CDN). O nome de cada arquivo leva um código (hash) que nunca muda',
                'Arquivo com código no nome pode ficar guardado no cache para sempre. Quando o site é gerado de novo, o nome muda e o cache velho cai sozinho',
              ],
              [
                'Modelos de ML',
                'Fora da nuvem. Treinamos os modelos antes, fora do site, e guardamos o resultado num arquivo JSON no Git',
                'Carregar a biblioteca scikit-learn a cada pedido custaria segundos de espera na partida. E o número só muda quando publicamos uma versão nova (ADR-022)',
              ],
              [
                'Dados do protótipo',
                'Na memória do programa, gerados sempre iguais',
                'Sem banco, `git clone && npm run dev` sobe sem senha nenhuma. O desenho do banco de verdade está escrito, mas desligado (ADR-011)',
              ],
              [
                'Persistência prevista',
                'Postgres gerenciado pelo provedor, com as regras de acesso do banco (RLS)',
                'Permissão que mora no banco vale para qualquer caminho de gravação. Vale até para um caminho que ainda não existe',
              ],
            ]}
          />
        </Secao>

        <Secao
          titulo="O fluxo de dados, ponta a ponta"
          descricao="O caminho de um número, do teclado da unidade até a folha do gerente."
        >
          <Lista
            itens={[
              'A unidade informa cada item medido, junto com a evidência. Pode ser um valor direto, ou um numerador e um denominador. O envio é um formulário comum (POST). A biblioteca zod confere os dados na entrada e recusa o que está errado, dizendo o motivo.',
              'A camada de dados grava o lançamento e, no mesmo passo, ESCREVE UM EVENTO no histórico. Não existe caminho que grave sem registrar.',
              'A SEAB fecha a janela de lançamento. O ciclo avança um passo, e essa mudança também vira evento no histórico.',
              'O motor de cálculo junta os itens medidos e forma cada indicador. Aplica as metas e os pesos do tipo da unidade, na versão da regra que vale para o mês. Devolve a nota (score), a faixa e a memória de cálculo, com cada passo da conta.',
              'A tela mostra a memória de cálculo que saiu dessa mesma conta. Nunca refaz a conta por fora.',
              'O painel da gestão soma os resultados e exporta em CSV. A auditoria lê o histórico e não escreve nada.',
            ]}
          />
          <Nota>
            Cada passo roda na hora, um atrás do outro, e isso é de propósito. Fila e
            processamento em lote servem para um volume que este caso não tem. São dezenas de
            indicadores por mês, não milhões de eventos por minuto. Escolher a arquitetura pelo
            volume que se sonha ter é como comprar caminhão para carregar feira.
          </Nota>
        </Secao>

        <Secao
          titulo="O que a nuvem decidiu no produto"
          descricao="Limites da nuvem que viraram decisão de desenho do produto, e não nota de rodapé."
        >
          <Tabela
            colunas={['Restrição da nuvem', 'O que mudou no produto']}
            linhas={[
              [
                'A função não guarda estado, e várias cópias rodam ao mesmo tempo',
                'O contador que limita tentativas (rate limit) vive na memória de uma cópia só. Ele ajuda, mas não garante. Deixamos isso escrito em vez de fingir garantia',
              ],
              [
                'Biblioteca pesada deixa a partida lenta',
                'O treino dos modelos de ML saiu do programa que roda no site. A tela lê um arquivo JSON com a semente, o commit e a data do treino. Semente é o número que fixa o sorteio',
              ],
              [
                'O disco some a cada execução',
                'A configuração vai para variável de ambiente e para o Git. Nunca para arquivo gravado enquanto o site roda',
              ],
              [
                'Segredo não pode morar no repositório',
                'A senha do painel e o segredo do cookie só existem em variável de ambiente. Sem elas, o painel simplesmente não existe: responde 404',
              ],
              [
                'Publicar é dar um push',
                'A vitrine ficou guardada em código e abre por commit. Ninguém precisa entrar no painel do provedor e colar valor à mão (ADR-021)',
              ],
            ]}
          />
        </Secao>

        <Secao titulo="Doze fatores, conferidos">
          <Tabela
            colunas={['Fator', 'Como está aqui']}
            linhas={[
              [
                'Base de código',
                'Um repositório só, com várias publicações: produção e uma prévia por branch',
              ],
              [
                'Dependências',
                'Todas listadas em package.json, com lockfile. Nada instalado à mão',
              ],
              [
                'Configuração',
                'Em variáveis de ambiente, com um `.env.example` guardado no Git',
              ],
              [
                'Serviços de apoio',
                'O banco é tratado como peça que se encaixa: dá para trocar o driver',
              ],
              [
                'Build, release, run',
                'Separados: `next build` congela o pacote, e o deploy publica esse pacote',
              ],
              [
                'Processos',
                'Sem estado. O que precisa durar vai para cookie assinado ou para o Git',
              ],
              [
                'Concorrência',
                'Cresce criando mais cópias da função. Nenhum usuário fica preso a uma cópia',
              ],
              ['Descartabilidade', 'Liga rápido e desliga sem cerimônia'],
              [
                'Paridade dev/prod',
                'A verificação de vazamento roda sobre o mesmo build que vai para produção',
              ],
              ['Logs', 'Os registros saem na saída padrão, e a plataforma recolhe'],
              [
                'Processos administrativos',
                'Semear a base e verificar o site são scripts do repositório',
              ],
            ]}
          />
        </Secao>
      </>
    ),
  },
  {
    id: 'arquitetura',
    titulo: 'Arquitetura do MVP',
    resumo:
      'as camadas do sistema, o que cada uma resolve e por que o motor de cálculo fica isolado.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Camada', 'O que resolve', 'Por que separada']}
          linhas={[
            [
              'Conteúdo (content/)',
              'O diário semanal e os documentos, guardados no Git como TSX',
              'Entra no Git com histórico. O painel decide quando aparece, não o que diz',
            ],
            [
              'Regra (lib/calculo/)',
              'A nota (score), a faixa e a memória de cálculo',
              'É uma conta que não depende de nada de fora. Dá para testar os casos extremos sem ligar nada',
            ],
            [
              'Dados (lib/dados/)',
              'De onde vêm unidades, indicadores e lançamentos',
              'Separa as telas da origem dos dados. Trocar a base de teste por um banco não obriga a reescrever tela',
            ],
            [
              'Liberação (lib/releases.ts)',
              'O que está visível hoje',
              'Uma conta que não depende de nada de fora, feita sobre o cronograma. O "hoje" entra como dado, vindo de fora',
            ],
          ]}
        />
        <Lista
          itens={[
            'Nenhuma camada pula a do meio. A tela fala com a camada de dados, e a de dados fala com a origem.',
            'O motor de cálculo não conhece tela nem banco. Recebe números e devolve números, com a conta aberta.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'modelo',
    titulo: 'Modelo de dados',
    resumo:
      'as tabelas do MVP, seguindo o que o cliente contou na reunião de 22/08, e o que cada uma guarda.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Entidade', 'Guarda', 'Observação']}
          linhas={[
            [
              'Distrito sanitário',
              'Nome',
              'Três na base de teste. Cada um tem uma gerência distrital, que também recebe nota',
            ],
            [
              'Tipo de unidade',
              'Nome e sigla (USF, CAPS, UPA, POLI)',
              'O tipo decide quais indicadores valem para a unidade, com qual meta e qual peso',
            ],
            [
              'Unidade',
              'Nome, distrito e tipo',
              'Doze na base de teste. É quem informa os números e quem recebe a nota',
            ],
            [
              'Indicador',
              'Nome, unidade de medida, direção e fonte',
              'Sete no catálogo. Não tem meta nem peso próprios: isso fica na regra',
            ],
            [
              'Subindicador',
              'Nome e tipo: índice, ou razão com numerador e denominador',
              'Onze. É o item que a unidade de fato preenche. O indicador é a junção deles',
            ],
            [
              'Regra',
              'Faixas de nota, metas e pesos por tipo de unidade (aplicabilidades), período em que vale e versão',
              'Mudar a regra cria uma versão nova. O mês avaliado escolhe qual versão vale',
            ],
            [
              'Ciclo',
              'O mês avaliado (competência), o estado, a janela de lançamento e o início da revisão',
              'Só avança um passo por vez. Os dias finais são a janela de revisão',
            ],
            [
              'Lançamento',
              'Valor OU numerador e denominador, evidência, autor e data',
              'Corrigir é fazer um lançamento novo. O antigo não é sobrescrito',
            ],
            [
              'Avaliação',
              'A nota (score), a faixa e a memória de cálculo da unidade no ciclo, passo a passo',
              'Dá para refazer: recalcular um mês antigo dá o mesmo número. A nota do distrito é a média das unidades',
            ],
            [
              'Evento de auditoria',
              'Quem, quando, o quê, antes e depois',
              'Só cresce: o histórico nunca é editado, só recebe linha nova',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
