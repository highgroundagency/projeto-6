import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import { URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/**
 * Semana 5: Arquitetura, de 19 a 25/09.
 *
 * O TEXTO CONTA O QUE ACONTECEU, com data e fonte: a planilha da Secretaria em
 * 22/09 (ADR-041), a regra v3 e os sete tipos em 23/09 (ADR-041 e ADR-042), o
 * C4 em quatro níveis e a base por unidade na lente de ML (ADR-043 e ADR-044).
 * Até 24/09 este arquivo dizia que a semana "ainda não aconteceu", com a semana
 * já pública e em curso.
 *
 * O selo não aparece para o visitante (ADR-026): ele lê isto como fato, e é
 * por isso que só entra o que tem fonte no repositório.
 *
 * CONFERIDO EM 02/10, a pedido do Gabriel, frase a frase contra o repositório:
 * o git log e os deploys de produção no GitHub, as ADR-041 a 047,
 * docs/retomada.md, docs/perguntas-para-a-sesau.md, docs/uso-de-ia.md, o seed,
 * src/lib/features.ts, src/content/travas.ts e o CSV de ml/data. O que não batia
 * mudou antes do selo:
 * - "Em 19/09, meu resultado entrou no ar" não aconteceu para o visitante. A tela
 *   é do ciclo s6, e a produção lia o adiantamento como zero até o deploy de
 *   2aede44 (docs/releases.md). As oito telas abriram juntas em 25/09.
 * - "Liberar as quatro telas" saiu dos próximos passos: aconteceu em 25/09.
 * - "Os meses fechados seguem na v1 e na v2" virou "até maio": junho fechou
 *   pela v3 (ADR-046).
 * - O art. 20 da LGPD saiu do porquê da regra 1: o próprio site o lê como
 *   explicação de decisão automatizada (docs/privacidade.md, slide 11 do SR1).
 * - "Sem nenhuma pessoa" virou "sem nome, CPF, matrícula, e-mail ou telefone":
 *   o risco de identificação indireta está nos riscos da Semana 6.
 * - O teste de pureza segura importe e relógio, não `fetch`; a frase diz isso.
 * - No documento de nuvem, "Processos: sem estado" passou a dizer onde a escrita
 *   do protótipo morava NA SEMANA 5: na memória do servidor (ADR-046). A troca
 *   pelo diário no cookie é de 03/10 (ADR-048) e fica fora deste registro.
 * Validados: objetivo, avanços, decisões, bloqueios, feedback e próximos
 * passos. Em `rascunho`: responsáveis, que cada integrante confirma, e
 * evidências, porque o link do repositório depende de NEXT_PUBLIC_REPO_URL na
 * Vercel e ninguém o abriu no site publicado.
 *
 * DATAS: são as do git, gravadas em UTC. Em Recife, a v3 e os sete tipos são de
 * 22/09 às 21:46, e as oito telas foram para produção em 24/09 às 22:43.
 *
 * O feedback do cliente tem fonte: a resposta da Secretaria de 22/09 está em
 * docs/retomada.md e em docs/perguntas-para-a-sesau.md (pergunta 5).
 */
export const registro = {
  ciclo: 's5',
  marcador: 'PRUMO-MARCADOR-CICLO-s5',

  objetivo: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo:
      'Fechar o desenho da arquitetura do MVP. Ter o motor de cálculo (a parte que faz a conta da nota) rodando de ponta a ponta. Ele roda sobre a base de teste, feita só de dados inventados.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Em 22/09, a Secretaria enviou a planilha que usa hoje, sem os nomes. Lemos as fórmulas uma a uma.',
      'Em 23/09, a regra v3 entrou no motor. Ela segue o método da planilha: média das notas, peso redistribuído e nota de 0 a 1. As regras v1 e v2 continuam de pé, e nenhum mês fechado mudou.',
      'Em 23/09, os tipos de unidade passaram a ser os sete da portaria: USF, UBT, UBT Mista, CAPS, CECON, UCIS e MAC.',
      'A base de teste, gerada por programa, agora tem 7 tipos de unidade. Ela segue com 3 distritos, 12 unidades, 8 indicadores e 12 itens medidos.',
      'Publicamos os quatro níveis do C4 em /arquitetura. C4 é um jeito de desenhar sistemas em níveis de zoom. Os níveis 3 e 4 são de 23/09.',
      'Em 23/09, a base de desempenho por unidade da Secretaria entrou em ml/data, com autorização. É dado da instituição, sem nome, CPF, matrícula, e-mail ou telefone de ninguém.',
      'Em 23/09, os cadernos de ML passaram a ler essa base, na entrega parcial de ML. Os slides da AV1 de ML ficaram em /ml.',
      'Em 25/09, as oito telas do sistema ficaram abertas ao visitante. Até ali, só três estavam no ar: painel da SEAB, indicadores e lançamento.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        decisao:
          'A regra v3 vale de junho em diante. Os meses até maio seguem nas regras v1 e v2.',
        porque:
          'Nota publicada tem prazo de recurso. Se ela mudasse depois, o prazo do art. 9º perderia o sentido (ADR-041 e docs/arquitetura.md).',
      },
      {
        decisao: 'Os tipos antigos viram os novos sem apagar as regras antigas.',
        porque: 'Assim nenhuma unidade perde nota em mês já publicado (ADR-042).',
      },
      {
        decisao:
          'A base por unidade da Secretaria entra no repositório. Dado de pessoa, nunca.',
        porque:
          'A Secretaria autorizou o dado da instituição. Dado de pessoa fica fora mesmo com autorização, e isso vale para o repositório, a base de teste e os prompts de IA (ADR-044).',
      },
      {
        decisao:
          'O motor não lê relógio nem importa nada de fora, e desde 23/09 um teste segura isso.',
        porque:
          'Assim o mesmo dado dá sempre o mesmo número. O teste falha se o motor importar arquivo, banco ou framework, sortear número ou ler o relógio.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Os cortes das classes foram digitados à mão na planilha. Não dá para tirá-los das fórmulas, e a v3 usa 0,80 como suposição.',
      'Os percentuais de cada classe estão no Decreto 36.482/2023, que ainda não temos.',
      'O Indicador 3 é bimestral, e o ciclo é mensal. O motor ainda não trata essa exceção.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        origem: 'cliente',
        texto:
          'Em 22/09, ao enviar a planilha, a Secretaria respondeu como a conta é feita hoje: “é tudo manual, via procv e afins”.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Levar à Secretaria as perguntas abertas: cortes das classes, decreto e Indicador 3.',
      'Fechar o pacote do SR1, com riscos, escopo revisado e backlog com estado.',
    ],
  },

  /* Os responsáveis foram INFERIDOS pela frente de cada um (src/content/equipe.ts),
     e não registrados. O repositório só sustenta duas linhas: a do João Pedro
     (autor do commit 84faccd) e a do Gabriel (validador das linhas de uso de IA
     de 19 a 24/09 em docs/uso-de-ia.md). O git registra o Claude como autor da
     v3, dos tipos, do C4 e do teste da regra 1. Fica em rascunho até cada
     integrante confirmar ou corrigir a própria linha. */
  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'joao-henrique',
        contribuicao: 'Regra v3 no motor, os sete tipos da portaria e o C4 em quatro níveis.',
      },
      {
        integrante: 'rafael',
        contribuicao: 'Lente de ML: os cadernos sobre a base por unidade e a entrega parcial.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao:
          'Subiu a base por unidade e os cadernos para o repositório (commit 84faccd).',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Leitura da planilha e as perguntas que ficaram para a Secretaria.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'A fronteira da regra 1 e o teste que varre ml/data.',
      },
      {
        integrante: 'gabriel',
        contribuicao: 'Revisou e assinou as linhas de uso de IA da semana.',
      },
      {
        integrante: 'kerry',
        contribuicao: 'Apoia a leitura da planilha e anota as dúvidas.',
      },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'prototipo', rotulo: 'As telas no ar', url: '/sistema' },
      { tipo: 'documento', rotulo: 'Arquitetura em quatro níveis', url: '/arquitetura' },
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
              'O motor de cálculo junta os itens medidos e forma cada indicador. Aplica a régua e os pesos do tipo da unidade, na versão da regra que vale para o mês. Devolve a nota (score), a faixa e a memória de cálculo, com cada passo da conta.',
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
                'O segredo do cookie só existe em variável de ambiente. Sem ele, o painel simplesmente não existe: responde 404. A senha tem um padrão público, e o que protege o painel é trocá-la em produção',
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
                'Sem estado que precise durar. O que dura vai para cookie assinado ou para o Git. A escrita do protótipo fica na memória do servidor e some no reinício (ADR-046)',
              ],
              [
                'Vínculo de porta',
                'O app sobe o próprio servidor HTTP numa porta, com `next start`. Na Vercel, a plataforma faz essa ligação',
              ],
              [
                'Concorrência',
                'Cresce criando mais cópias da função. Nenhum usuário fica preso a uma cópia',
              ],
              ['Descartabilidade', 'Liga rápido e desliga sem cerimônia'],
              [
                'Paridade dev/prod',
                'A verificação de vazamento sobe um build de produção (`next build` e `next start`), e não o modo de desenvolvimento',
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
              'Nome e sigla (USF, UBT, UBT Mista, CAPS, CECON, UCIS, MAC)',
              'Sete, os mesmos que a portaria nomeia. O tipo decide quais indicadores valem para a unidade, com qual meta e qual peso',
            ],
            [
              'Unidade',
              'Nome, distrito e tipo',
              'Doze na base de teste. É quem informa os números e quem recebe a nota',
            ],
            [
              'Indicador',
              'Nome, unidade de medida, direção e fonte',
              'Oito no catálogo. Não tem meta nem peso próprios: isso fica na regra',
            ],
            [
              'Subindicador',
              'Nome e tipo: índice, ou razão com numerador e denominador',
              'Doze. É o item que a unidade de fato preenche. O indicador é a junção deles',
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
  {
    id: 'planilha',
    titulo: 'A planilha do cliente, lida fórmula a fórmula',
    resumo:
      'o que a planilha real ensinou, o que ela corrigiu no nosso motor, e as três coisas que ela mostra sobre o problema.',
    Conteudo: () => (
      <>
        <Nota>
          Em 22/09 a Secretaria enviou, sem os nomes, a planilha que usa hoje. A planilha com as
          fórmulas não entra no repositório: entra a regra que aprendemos lendo as fórmulas. A
          base de desempenho por unidade, com tipo, distrito e números, sem nome de unidade,
          entrou em ml/data com autorização da Secretaria (ADR-044). Não há nome, CPF, e-mail
          nem telefone de ninguém neste documento, e não havia no arquivo.
        </Nota>

        <Secao
          titulo="O que a gente tinha assumido errado"
          descricao="Três suposições estavam escritas no código como suposições, de propósito. A planilha respondeu as três."
        >
          <Tabela
            colunas={['O que a gente fazia', 'O que a planilha faz', 'Quem estava certo']}
            linhas={[
              [
                'Média dos valores dos subindicadores, e uma nota no fim',
                'Cada subindicador vira nota primeiro, e a média é das notas',
                'A planilha. Os dois caminhos dão números diferentes, e quem está perto de um degrau sente a diferença',
              ],
              [
                'Indicador sem lançamento zera e puxa a nota para baixo',
                'Ele sai da conta, e o peso dele sai do denominador junto',
                'A planilha, e é a redistribuição que o art. 8º manda. A fórmula do resultado geral faz exatamente isso',
              ],
              [
                'Nota de 0 a 10, com faixas de atingimento',
                'Nota de 0 a 1, por degraus escritos dentro da própria régua',
                'A planilha. A escala de 0 a 10 era invenção nossa',
              ],
            ]}
          />
          <Nota>
            As três entraram como a regra v3. As regras v1 e v2 continuam publicadas e devolvem
            os mesmos números dos meses que já fecharam. O motor ganhou um segundo caminho de
            conta, e é a regra que escolhe qual usar (ADR-041). Era para isto que a regra virou
            dado.
          </Nota>
        </Secao>

        <Secao
          titulo="O que ela ensinou que a gente nem sabia perguntar"
          descricao="Coisas que não estavam em nenhuma das nossas listas de dúvida."
        >
          <Lista
            itens={[
              'Existe uma terceira direção. Há subindicador em que passar do alvo TAMBÉM perde ponto: atender pouco é subtratamento, atender demais no mesmo mês costuma ser procedimento picado. Uma régua de "maior é melhor" e "menor é melhor" não sabe dizer isso, e premiaria o exagero.',
              'Numerador maior que denominador é ERRO, não desempenho acima de 100%. A planilha escreve a palavra ERRO na célula. O nosso motor deixava passar, e uma vírgula fora do lugar virava nota cheia em silêncio.',
              'Os tipos de unidade são sete, e a gente tinha quatro, dos quais dois não existem. UPA e Policlínica não estão na portaria. Os tipos certos são USF, UBT, UBT Mista, CAPS, CECON, UCIS e MAC, e ainda têm porte (USF 1 a 8, MAC 1 a 4).',
              'A classificação final é por nome, não por percentual: aparecem "Satisfatório" e "Excelente" escritos na planilha. As nossas faixas chamavam isso de "parcial" e "integral", que não é como ninguém lá fala.',
            ]}
          />
        </Secao>

        <Secao
          titulo="As três coisas que a planilha mostra sobre o problema"
          descricao="Não são descuido de ninguém. São o que acontece quando a fórmula é arrastada célula a célula e editada à mão durante anos. É o problema que este projeto existe para resolver, e agora ele tem evidência em vez de retórica."
        >
          <Tabela
            colunas={['Quantas linhas', 'O que acontece nelas', 'Efeito']}
            linhas={[
              [
                '190 de 228',
                'Seguem a régua certa: pesos 0,2 / 0,2 / 0,2 / 0,4, somando 1,0',
                'Nenhum. É a conta correta, e é a maioria',
              ],
              [
                '6',
                'Seguem outra conta: a planilha divide a soma dos pontos por 1,7, e não por 1,0. Em cinco delas, o indicador 3 entra nos pontos com peso 0,8, e não 0,2',
                'Quem cai nessas linhas é avaliado numa régua diferente de todo mundo. São as NDI e SAE, dois tipos de unidade que a portaria não nomeia',
              ],
              [
                '32',
                'Usam uma função que só existe no Google Planilhas',
                'Aberta no Excel, a célula não recalcula: mostra o último número que o Google gravou. São as linhas dos oito distritos',
              ],
            ]}
          />
          <Nota>
            O que o Prumo oferece contra isso não é uma planilha melhor. É a conta num lugar só,
            escrita como dado versionado, com teste que falha quando a soma dos pesos de um tipo
            não fecha. Uma régua diferente para seis linhas deixa de ser possível, em vez de
            deixar de ser notada.
          </Nota>
          <div className="mt-3">
            <Nota>
              De onde vêm estes números: da planilha com fórmulas, recebida em 22/09, que não
              está no repositório. A base por unidade de ml/data tem 244 linhas: as mesmas 196
              unidades (190 e 6) e 48 linhas de distrito, seis por distrito. A diferença está só
              nas linhas de distrito, 32 contra 48, e ainda não conferimos de onde ela vem.
            </Nota>
          </div>
        </Secao>
      </>
    ),
  },
] as const satisfies readonly Documento[]
