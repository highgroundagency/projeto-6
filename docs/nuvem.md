# Arquitetura nativa na nuvem

Esta é a terceira lente exigida pela matriz, ao lado de Segurança da Informação e de
Aprendizado de Máquina. O documento responde ao que a matriz pede em cada semana:
**componentes de infraestrutura, integração entre eles, fluxo/pipeline de dados,
processamento, desempenho e evolução da arquitetura**.

O recorte para a banca, em duas frases: o MVP é uma aplicação sem estado, publicada em
funções serverless, com a autorização pretendida morando no banco e não na aplicação. Nada
aqui é servidor que a equipe administre, e cada restrição da nuvem virou uma decisão
declarada de produto.

## Onde cada componente executa

| Componente | Onde roda | Por que ali |
| --- | --- | --- |
| Páginas e telas | Função serverless, por requisição | O recorte de release depende do dia **e** da sessão, então não há como pré-renderizar: `force-dynamic` é consequência da regra |
| Porta do painel | Middleware na borda, antes da função | Barrar antes de acordar a função é mais barato e mais seguro |
| Assets, fontes e chunks | CDN, com hash imutável no nome | Cache eterno, e a invalidação vira consequência do build |
| Modelos de ML | Fora do runtime: treinam offline, viram JSON versionado | Partida a frio com scikit-learn custaria segundos (ADR-022) |
| Dados do protótipo | Memória do processo, semente fixa | `git clone && npm run dev` sobe sem nenhuma credencial |
| Persistência prevista | Postgres gerenciado, com RLS | Autorização no banco vale para qualquer caminho de escrita |

## O pipeline de dados, ponta a ponta

1. A área técnica envia valor e evidência num POST de formulário. `zod` valida na entrada e
   recusa com motivo, antes de qualquer escrita.
2. A camada de dados grava o lançamento **e escreve o evento na trilha no mesmo passo**. Não
   existe caminho de escrita que não registre.
3. A CAM fecha a janela; o estado do ciclo avança um passo e a transição também vira evento.
4. O motor puro recebe lançamentos, indicadores e a versão da regra vigente na competência, e
   devolve score, faixa e memória de cálculo.
5. A tela exibe a memória que saiu do mesmo cálculo, nunca uma recontagem paralela.
6. O painel da gestão agrega e exporta CSV; a auditoria lê a trilha e não escreve nada.

**O pipeline é síncrono de propósito.** Fila e processamento em lote resolveriam um volume que
este caso não tem: são dezenas de indicadores por competência mensal. Escolher a arquitetura
pelo volume que se sonha ter é como comprar caminhão para carregar feira.

## Restrição da nuvem que virou decisão de produto

| Restrição | O que mudou |
| --- | --- |
| Função sem estado, várias instâncias simultâneas | O contador do rate limit vive na memória de uma instância: é **best-effort**, e está declarado assim em vez de fingir garantia |
| Partida a frio cobra por dependência pesada | O treino de ML saiu do runtime (ADR-022) |
| Sistema de arquivos efêmero | Config vai para env var e para o Git, nunca para arquivo gravado em execução |
| Segredo não pode morar no repositório | Sem `ADMIN_COOKIE_SECRET`, o painel simplesmente não existe: responde 404 |
| Deploy é um push | A vitrine foi versionada em código para abrir por commit (ADR-021) |

## Doze fatores, conferidos

| Fator | Como está aqui |
| --- | --- |
| Base de código | Um repositório, muitos deploys: produção e prévia por branch |
| Dependências | `package.json` com lockfile; nada instalado à mão |
| Configuração | Variáveis de ambiente, com `.env.example` versionado |
| Serviços de apoio | Banco como recurso plugável: driver trocável em `src/lib/dados/` |
| Build, release, run | Separados: `next build` congela o artefato, o deploy publica |
| Processos | Sem estado; o que precisa durar vai para cookie assinado ou para o Git |
| Concorrência | Escala horizontal por instância, sem sessão pegajosa |
| Descartabilidade | Partida rápida, desligamento sem ritual |
| Paridade dev/prod | O mesmo build de produção é o que `verificar-vazamento` sobe |
| Logs | Fluxo de eventos na saída padrão, coletado pela plataforma |
| Processos administrativos | `semear`, `verificar-vazamento` e `dossie` como scripts do repositório |

## Escala: até onde isto aguenta

| Dimensão | Hoje no protótipo | Em produção |
| --- | --- | --- |
| Áreas técnicas | 10 sintéticas | Dezenas, custo linear e trivial |
| Indicadores | 30 sintéticos | Centenas, sem mudança de arquitetura |
| Gestores avaliados | Dezenas | Milhares: o cálculo é por gestor e paraleliza sozinho |
| Trilha de auditoria | Centenas de eventos | Cresce para sempre por desenho; pede índice por ciclo e arquivamento de competência antiga |

**O gargalo real não é técnico, é de calendário.** Todas as áreas lançam nos mesmos dois dias
do mês. Serverless resolve exatamente esse formato de carga (pico curto, vale longo), e é a
razão principal da escolha.

## Limitações declaradas

- **Nenhuma métrica de produção foi medida.** O MVP não recebeu carga real; os números acima
  são raciocínio de capacidade, não benchmark. Dizer o contrário seria inventar evidência.
- **O banco não está no caminho de execução.** O schema com RLS existe, é testado contra um
  Postgres real, e está desligado (ADR-011). A arquitetura de persistência é projeto, não
  operação.
- **Sem multi-região, sem CDN de dados, sem cache distribuído.** Nada disso se justifica na
  escala do caso, e ligá-los para exibição seria o oposto do que esta lente ensina.
- **Rate limit e estado do ciclo vivem na memória do processo**, o que em serverless é
  best-effort por instância. Ver `docs/seguranca.md`.

## O que falta para virar produção

1. Ligar o schema de `supabase/migrations/` ao runtime.
2. Autenticação institucional no lugar do seletor simulado, com as políticas de RLS assumindo
   o controle de autorização.
3. Rate limit persistente.
4. CSP com nonce por requisição no lugar do `unsafe-inline` herdado do framework.
5. Observabilidade além do health check `/api/status`: série temporal de erro e latência.
6. Rotina de backup e **teste de restauração**, que num sistema que paga gratificação não é
   opcional.

## Onde ler o resto

`docs/arquitetura.md` traz os diagramas C4. `docs/decisoes.md` guarda os porquês, com
ADR-011 (banco desligado), ADR-021 (vitrine versionada) e ADR-022 (ML offline) sendo as três
decisões que a nuvem determinou diretamente.
