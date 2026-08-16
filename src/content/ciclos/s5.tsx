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
      'onde cada componente roda, como eles se integram, e as decisões que a nuvem impôs ao produto.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Onde cada componente executa"
          descricao="A matriz pede componentes de infraestrutura e integração entre eles. Estes são os do MVP, e nenhum deles é servidor que a equipe administre."
        >
          <Tabela
            colunas={['Componente', 'Onde roda', 'Por que ali']}
            linhas={[
              [
                'Páginas e telas',
                'Função serverless na Vercel, por requisição',
                'O recorte de release depende do dia e da sessão, então não há como pré-renderizar: `force-dynamic` é consequência da regra, não preguiça',
              ],
              [
                'Porta do painel',
                'Middleware na borda, antes da função',
                'Barrar antes de acordar a função é mais barato e mais seguro: quem não tem sessão nunca chega ao código do painel',
              ],
              [
                'Assets e fontes',
                'CDN, com hash imutável no nome do arquivo',
                'Chunk com hash pode ter cache eterno, e a invalidação vira consequência do build',
              ],
              [
                'Modelos de ML',
                'Fora da nuvem: treinam offline e viram JSON versionado',
                'Carregar scikit-learn por requisição custaria segundos de partida a frio para exibir número que só muda entre deploys (ADR-022)',
              ],
              [
                'Dados do protótipo',
                'Memória do processo, com semente fixa',
                'Sem banco, `git clone && npm run dev` sobe sem credencial nenhuma. O schema de verdade está escrito e desligado (ADR-011)',
              ],
              [
                'Persistência prevista',
                'Postgres gerenciado, com RLS no banco',
                'Autorização que mora no banco vale para qualquer caminho de escrita, inclusive um que ainda não existe',
              ],
            ]}
          />
        </Secao>

        <Secao
          titulo="O fluxo de dados, ponta a ponta"
          descricao="O caminho de um número, do teclado da área técnica até a folha do gestor."
        >
          <Lista
            itens={[
              'A área técnica envia valor e evidência num POST comum de formulário; zod valida na entrada e recusa com motivo.',
              'A camada de dados grava o lançamento e ESCREVE UM EVENTO na trilha, no mesmo passo. Não há caminho que grave sem registrar.',
              'A CAM fecha a janela; o estado do ciclo avança um passo, e a transição também vira evento.',
              'O motor puro recebe lançamentos, indicadores e a versão da regra vigente na competência, e devolve score, faixa e memória de cálculo.',
              'A tela exibe a memória que saiu do mesmo cálculo, nunca uma recontagem paralela.',
              'O painel da gestão agrega e exporta em CSV; a auditoria lê a trilha, e escreve nada.',
            ]}
          />
          <Nota>
            O pipeline é síncrono de propósito. Fila e processamento em lote resolveriam volume
            que este caso não tem: são dezenas de indicadores por competência mensal, não
            milhões de eventos por minuto. Escolher a arquitetura pelo volume que se sonha ter é
            como comprar caminhão para carregar feira.
          </Nota>
        </Secao>

        <Secao
          titulo="O que a nuvem decidiu no produto"
          descricao="Restrição de infraestrutura que virou decisão de desenho, não observação de rodapé."
        >
          <Tabela
            colunas={['Restrição da nuvem', 'O que mudou no produto']}
            linhas={[
              [
                'Função sem estado, e várias instâncias ao mesmo tempo',
                'O contador do rate limit vive na memória de uma instância: é best-effort, e está declarado como tal em vez de fingir garantia',
              ],
              [
                'Partida a frio cobra por dependência pesada',
                'O treino de ML saiu do runtime; a tela lê um JSON com semente, commit e data do treino',
              ],
              [
                'Sistema de arquivos efêmero',
                'Config vai para env var e para o Git, nunca para arquivo gravado em execução',
              ],
              [
                'Segredo não pode morar no repositório',
                'A senha do painel e o segredo do cookie só existem em variável de ambiente; sem elas, o painel simplesmente não existe (responde 404)',
              ],
              [
                'Deploy é um push',
                'A vitrine foi versionada em código para abrir por commit, sem alguém abrir painel de provedor e colar valor à mão (ADR-021)',
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
                'Um repositório, muitos deploys: produção e prévia por branch',
              ],
              ['Dependências', 'Declaradas em package.json com lockfile; nada instalado à mão'],
              ['Configuração', 'Em variáveis de ambiente, com `.env.example` versionado'],
              ['Serviços de apoio', 'Banco tratado como recurso plugável: driver trocável'],
              [
                'Build, release, run',
                'Separados: `next build` congela o artefato, o deploy o publica',
              ],
              [
                'Processos',
                'Sem estado; o que precisa durar vai para cookie assinado ou para o Git',
              ],
              [
                'Concorrência',
                'Escala horizontal por instância de função, sem sessão pegajosa',
              ],
              ['Descartabilidade', 'Partida rápida e desligamento sem ritual'],
              [
                'Paridade dev/prod',
                'O mesmo build de produção é o que a verificação de vazamento sobe',
              ],
              ['Logs', 'Fluxo de eventos na saída padrão, coletado pela plataforma'],
              [
                'Processos administrativos',
                'Semeadura e verificação como scripts do repositório',
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
