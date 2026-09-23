# Arquitetura

## Visão de contexto (C4 nível 1)

Os quatro primeiros atores são os que o cliente nomeou na reunião de 22/08 (ADR-034).

```mermaid
C4Context
  title Prumo — contexto
  Person(unidade, "Gerente de unidade", "Preenche os subindicadores da unidade e recebe a nota dela")
  Person(distrital, "Gerente distrital", "Acompanha as unidades do distrito e revisa na janela; avaliado pela média")
  Person(seab, "Coordenação da SEAB", "Define a régua, cobra, homologa e publica")
  Person(admin, "Administrador", "Cuida da plataforma e da trilha, não das notas")
  Person(professor, "Professor", "Avalia o registro do projeto")

  System(prumo, "Prumo", "Registro do projeto e MVP do cálculo da gratificação")
  System_Ext(drive, "Google Drive", "Repositório oficial de documentos da equipe")
  System_Ext(ml, "Pipeline de ML", "Notebooks offline que exportam JSON")

  Rel(unidade, prumo, "Lança subindicadores com evidência")
  Rel(distrital, prumo, "Revisa lançamentos e consulta a média do distrito")
  Rel(seab, prumo, "Gere ciclos, homologa e publica")
  Rel(admin, prumo, "Mantém cadastros e confere a trilha")
  Rel(professor, prumo, "Lê o registro semanal")
  Rel(prumo, drive, "Link para os documentos")
  Rel(ml, prumo, "Artefatos JSON consumidos pela tela de analytics")
```

## Visão de contêineres (C4 nível 2)

```mermaid
C4Container
  title Prumo — contêineres
  Person(usuario, "Usuário", "SEAB, administrador, gerente distrital, gerente de unidade ou professor")

  Container_Boundary(vercel, "Vercel") {
    Container(browser, "Navegador", "HTML + CSS", "Recebe HTML renderizado no servidor; quase nenhum JavaScript de aplicação")
    Container(app, "Next.js App Router", "TypeScript, React Server Components", "Porta de entrada, registro, painel e telas do sistema")
    Container(middleware, "Middleware", "Edge runtime", "Primeira camada de proteção de /admin")
    Container(rotas, "Route handlers", "Node runtime", "Login, configuração, lançamento, contestação, exportação e health check")
  }

  Container_Boundary(dados, "Dados") {
    ContainerDb(seed, "Seed em memória", "TypeScript", "Base sintética com semente fixa — a fonte ativa")
    ContainerDb(arquivo, "config-site.json", "JSON local", "Configuração de release em desenvolvimento")
    ContainerDb(schema, "Schema PostgreSQL", "SQL versionado", "Escrito e testado, NÃO ligado ao app; ainda no domínio anterior à ADR-034 — ver docs/banco.md")
  }

  Container_Boundary(offline, "Offline") {
    Container(notebooks, "Notebooks", "Python, scikit-learn, pandas", "EDA, classificação, regressão e clustering")
    ContainerDb(artefatos, "src/content/ml/resultados.json", "JSON versionado", "Resultados e métricas exportados")
  }

  Rel(usuario, browser, "Acessa")
  Rel(browser, app, "HTTPS")
  Rel(app, middleware, "Passa por")
  Rel(browser, rotas, "Formulários HTML (POST)")
  Rel(app, seed, "Lê")
  Rel(app, arquivo, "Lê e grava em dev")
  Rel(seed, schema, "Semeável por npm run semear")
  Rel(notebooks, artefatos, "Exportam")
  Rel(app, artefatos, "Lê na tela de analytics")
```

## Visão de componentes (C4 nível 3)

Abertura do contêiner com mais lógica de negócio, o **Next.js App Router**. O estilo é
**monólito modularizado em camadas**, e o desenho existe para deixar isso visível: cada
camada é uma fronteira, e nenhuma seta pula a camada do meio.

A regra que o desenho tem de sustentar é a inversão de dependência para dentro: a camada de
domínio não conhece tela, rota, banco nem relógio. Toda seta que a cruza aponta **para ela**,
nunca a partir dela.

```mermaid
C4Component
  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="2")
  title Prumo — componentes do App Router

  Person(usuario, "Usuário", "SEAB, administrador, gerente distrital, gerente de unidade ou professor")

  Container_Boundary(portoes, "Camada de portões") {
    Component(middleware, "middleware.ts", "Edge runtime", "Barra /admin antes de acordar a função")
    Component(gates, "exigirFeature + exigirPerfil", "TypeScript", "Os dois portões, nessa ordem, antes de montar a tela. Quem não tem direito recebe 404")
    Component(features, "lib/features.ts", "TypeScript", "Tela → ciclo que a libera e perfis que a enxergam")
    Component(guard, "lib/admin/guard.ts", "TypeScript", "Sessão, senha e limite de tentativas")
  }

  Container_Boundary(apresentacao, "Camada de apresentação") {
    Component(registro, "app/page.tsx + registro", "React Server Components", "As oito seções do briefing e o diário semanal")
    Component(telas, "components/sistema/telas", "React Server Components", "As oito telas do MVP, sem portão por dentro")
    Component(memoria, "components/sistema/memoria.tsx", "React Server Components", "A conta aberta, passo a passo. Só exibe: não recalcula")
  }

  Container_Boundary(aplicacao, "Camada de aplicação") {
    Component(rotas, "app/api/**/route.ts", "Node runtime", "Onze rotas: login, config, lançamento, contestação, ciclo e exportação")
    Component(visao, "lib/visao.ts", "TypeScript", "Resolve admin, data simulada e ciclos visíveis")
    Component(store, "lib/config/store.ts", "TypeScript", "Estado de release, com driver trocável")
  }

  Container_Boundary(dominio, "Camada de domínio: puro, sem I/O e sem relógio") {
    Component(motor, "lib/calculo/motor.ts", "TypeScript puro", "A nota, a faixa e a memória. Dois métodos: atingimento e notas")
    Component(releases, "lib/releases.ts", "TypeScript puro", "O que está visível hoje, derivado do cronograma")
    Component(cronograma, "lib/cronograma.ts", "TypeScript puro", "Fonte única de verdade das datas")
    Component(datas, "lib/datas.ts", "TypeScript puro", "Aritmética civil em America/Recife")
  }

  Container_Boundary(acesso, "Camada de acesso a dados") {
    Component(repo, "lib/dados/index.ts", "TypeScript", "Repositório com driver único. A tela nunca fala com o seed direto")
    Component(mapeadores, "lib/dados/mapeadores.ts", "TypeScript", "Traduz a forma da origem para a do domínio")
  }

  ContainerDb(seed, "Seed em memória", "TypeScript", "Base sintética com semente fixa")
  ContainerDb(config, "config-site.json", "JSON local", "Estado de release em desenvolvimento")
  ContainerDb(ciclos, "content/ciclos", "TSX server-only", "Um arquivo por ciclo. Nunca contém 'use client'")

  Rel(usuario, middleware, "Pede /admin")
  Rel(usuario, registro, "Lê o registro do projeto")
  Rel(usuario, telas, "Usa as telas do sistema")
  Rel(usuario, rotas, "Envia formulário HTML")

  Rel(middleware, guard, "Confere a sessão")
  Rel(telas, gates, "Passa pelos dois portões")
  Rel(gates, features, "Consulta ciclo e perfis")
  Rel(gates, visao, "Pergunta release e perfil ativos")

  Rel(registro, visao, "Pergunta o que este visitante vê")
  Rel(registro, ciclos, "Renderiza só o que já abriu")
  Rel(visao, releases, "Calcula os ciclos visíveis")
  Rel(visao, store, "Lê trava, adiantamento e data simulada")
  Rel(releases, cronograma, "Lê as dezoito datas")
  Rel(releases, datas, "Compara datas civis")

  Rel(telas, repo, "Pede unidades e lançamentos")
  Rel(telas, motor, "Calcula e recebe a memória")
  Rel(memoria, motor, "Exibe a memória gravada")
  Rel(rotas, repo, "Grava lançamento e contestação")
  Rel(rotas, store, "Grava configuração de release")
  Rel(repo, mapeadores, "Converte a forma da origem")
  Rel(mapeadores, seed, "Lê a base sintética")
  Rel(store, config, "Lê e grava em desenvolvimento")
```

O que o desenho mostra e vale dizer em voz alta:

- **Nenhuma seta sai do domínio.** `motor.ts`, `releases.ts`, `cronograma.ts` e `datas.ts` não
  apontam para tela, rota, repositório nem arquivo. É o que permite testar o cálculo inteiro
  sem subir nada, e é por isso que o mesmo mês fechado devolve sempre o mesmo número.
- **O portão vem antes da tela, e são dois.** Release primeiro, perfil depois. Uma sanfona
  fechada não esconde nada do HTML, então a ordem é a proteção, não o CSS.
- **A tela nunca fala com o seed.** Ela fala com o repositório, e é isso que mantém a porta
  aberta para uma fonte persistente sem reescrever tela nenhuma.

## Visão de código (C4 nível 4)

O nível 4 abre o componente de maior risco do sistema: o **motor de cálculo**. É a única parte
em que um erro vira dinheiro errado no salário de alguém, e é a que a banca vai querer ver por
dentro.

O C4 não define notação própria para este nível, então vale o diagrama de classes, com as
funções puras como operações e os tipos como estruturas.

```mermaid
classDiagram
  direction LR

  class RegraDePontuacao {
    +string id
    +number versao
    +string vigenteDe
    +string vigenteAte
    +MetodoDeCalculo metodo
    +Aplicabilidade[] aplicabilidades
    +GraduacaoSubindicador[] graduacoes
    +GraduacaoIndicador[] segundaGraduacao
    +FaixaPontuacao[] faixas
    +FaixaGratificacao[] faixasGratificacao
    +TratamentoSemLancamento semLancamento
    +number tetoAtingimento
    +number pontuacaoMaxima
  }

  class Aplicabilidade {
    +string tipoUnidadeId
    +string indicadorId
    +number meta
    +number peso
  }

  class Degrau {
    +number de
    +number ate
    +number nota
  }

  class GraduacaoSubindicador {
    +string subindicadorId
    +Degrau[] degraus
  }

  class GraduacaoIndicador {
    +string indicadorId
    +Degrau[] degraus
  }

  class Lancamento {
    +string subindicadorId
    +number valor
    +number numerador
    +number denominador
    +string registradoEm
  }

  class Motor {
    <<módulo puro>>
    +calcularAvaliacao(EntradaCalculo) Avaliacao
    +apurarSubindicador(sub, lanc, modo, rejeitarRazaoInvalida) PassoSubindicador
    +notaDoDegrau(valor, degraus) number
    +graduacaoDoSubindicador(regra, subId) GraduacaoSubindicador
    +segundaGraduacaoDoIndicador(regra, indId) GraduacaoIndicador
    +calcularAtingimento(valor, meta, direcao, teto) Atingimento
    +faixaDoAtingimento(atingimento, regra) FaixaPontuacao
    +faixaDoScore(score, regra) FaixaGratificacao
    +aplicabilidadeDe(regra, tipoId, indId) Aplicabilidade
    +regraVigente(competencia, regras) RegraDePontuacao
    +calcularAvaliacaoDistrital(Entrada) AvaliacaoDistrital
    +arredondar(valor, casas, modo) number
  }

  class PassoSubindicador {
    +string subindicadorId
    +number numerador
    +number denominador
    +number valor
    +number nota
    +string aviso
  }

  class PassoMemoria {
    +string indicadorId
    +PassoSubindicador[] subPassos
    +number valor
    +number meta
    +number atingimento
    +number mediaDasNotas
    +number nota
    +number pontos
    +number peso
    +number contribuicao
  }

  class MemoriaDeCalculo {
    +string regraId
    +number versaoRegra
    +MetodoDeCalculo metodo
    +PassoMemoria[] passos
    +number somaPesos
    +number somaContribuicoes
    +number score
    +string formula
  }

  class Avaliacao {
    +string unidadeId
    +string cicloId
    +number score
    +FaixaGratificacao faixa
    +MemoriaDeCalculo memoria
    +string[] avisos
  }

  RegraDePontuacao "1" *-- "muitos" Aplicabilidade : define meta e peso por tipo
  RegraDePontuacao "1" *-- "muitos" GraduacaoSubindicador : define a régua de cada subindicador
  RegraDePontuacao "1" *-- "0..muitos" GraduacaoIndicador : define a segunda gradação
  GraduacaoSubindicador "1" *-- "muitos" Degrau : ordena os degraus
  GraduacaoIndicador "1" *-- "muitos" Degrau : ordena os degraus

  Motor ..> RegraDePontuacao : lê a regra vigente da competência
  Motor ..> Lancamento : apura o último lançamento de cada subindicador
  Motor ..> PassoSubindicador : produz um por subindicador
  PassoMemoria "1" *-- "muitos" PassoSubindicador : agrega em um passo de indicador
  MemoriaDeCalculo "1" *-- "muitos" PassoMemoria : registra a conta linha a linha
  Avaliacao "1" *-- "1" MemoriaDeCalculo : carrega a conta junto do número
  Motor ..> Avaliacao : devolve número e memória juntos
```

A cadeia de uma nota, na ordem em que o código a executa:

1. `regraVigente(competencia, regras)` escolhe a versão da regra pela competência. Nunca por
   "a mais nova": um mês de fevereiro recalculado em dezembro continua usando a regra de
   fevereiro.
2. `aplicabilidadeDe(regra, tipoUnidade, indicador)` decide se aquele indicador vale para
   aquele tipo de unidade. Se não vale, ele não entra na conta nem na memória: para aquele
   tipo, ele simplesmente não existe.
3. `apurarSubindicador` transforma o lançamento em valor: valor direto, ou numerador ÷
   denominador × 100. Denominador zero e numerador maior que denominador viram aviso, não
   `#DIV/0!` nem nota cheia silenciosa.
4. `notaDoDegrau` converte o valor em nota de 0 a 1 pela régua da regra, no método de notas.
   A ordem dos degraus é que permite a faixa ideal, aquela em que passar do alvo também perde
   ponto.
5. A média das notas passa por `segundaGraduacaoDoIndicador`, quando a regra define uma.
6. O peso de cada indicador multiplica a nota, e a soma é dividida pela **soma dos pesos que
   entraram na conta**. É aí que mora a redistribuição do art. 8º: indicador sem lançamento
   sai, e o peso dele sai junto.
7. `faixaDoScore` traduz o número na classe: insatisfatório, regular, satisfatório, excelente.

Cada passo escreve sua linha na `MemoriaDeCalculo`. Nenhuma tela refaz a conta: elas exibem o
que o motor gravou, e é por isso que a tela não pode divergir do resultado.

## Fluxo de dados do cálculo

```mermaid
flowchart LR
  A[Unidade preenche<br/>cada subindicador] -->|zod valida| B[Lançamento<br/>+ evidência + autor]
  B --> C{Ciclo em<br/>janela aberta?}
  C -->|não| D[Recusa com motivo<br/>registrado na trilha]
  C -->|sim| E[Trilha de auditoria<br/>append-only]
  E --> F[Motor de cálculo<br/>função pura]
  G[Regra vigente<br/>com a régua por tipo] --> F
  F --> H[Avaliação da unidade<br/>score + faixa]
  F --> I[Memória de cálculo<br/>com sub-passos]
  H --> L[Avaliação distrital<br/>média das unidades]
  H --> J[Gerente]
  I --> J
  L --> K[Painel da gestão<br/>agregados por distrito e CSV]
```

O motor compõe cada indicador pela média simples dos subindicadores apurados (razão =
numerador ÷ denominador, em percentual) e calcula o atingimento contra a meta que a regra
versionada define para o TIPO da unidade. As fórmulas de composição e agregação são
suposições declaradas, a validar com a planilha prometida pelo cliente.

## Decisões e por quês

**Serverless na Vercel.** O projeto é acadêmico e tem picos de acesso concentrados em
apresentações. Serverless entrega custo zero em repouso e escala nas bancas sem
provisionamento. O preço é o filesystem read-only, que forçou a decisão sobre o config
store (ver ADR-004 em `decisoes.md`).

**Server Components como padrão.** As telas são renderizadas no servidor e enviam quase
nenhum JavaScript de aplicação. Três consequências diretas: LCP baixo, superfície de
ataque menor no cliente e — a mais importante para este projeto — **conteúdo de release
futuro nunca chega ao navegador**, porque o módulo sequer é avaliado.

**Formulários HTML puros.** Login, lançamento, contestação e todas as ações do painel são
`<form method="post">` para route handlers. Sem estado de cliente, sem hidratação, sem
dependência de JavaScript habilitado. Também simplifica a CSP.

**Persistência: decisão adiada, com o trabalho preparatório feito.** O MVP roda com dados
sintéticos em memória, o que basta para demonstrar o processo inteiro e dispensa credencial
para qualquer pessoa da equipe rodar o projeto. O schema PostgreSQL — com RBAC espelhado em
políticas de RLS e quatro invariantes em gatilho — está escrito, versionado e testado
contra um banco real, mas não ligado à aplicação; desde a remodelagem pós-reunião
(ADR-034) ele modela o domínio anterior, com a pendência declarada em `banco.md`. O porquê
está em `decisoes.md` (ADR-011 e ADR-012). Se a persistência virar requisito, a troca é
acrescentar um driver e atualizar o SQL: as telas falam com `src/lib/dados/`, não com a
fonte.

**Pipeline de ML offline.** Treinar modelo em requisição não faz sentido aqui: os dados
mudam por ciclo, não por segundo. Os notebooks rodam offline, exportam JSON versionado e a
aplicação apenas lê. Isso mantém o app rápido e torna cada número da tela de analytics
rastreável até o notebook que o gerou.

**Observabilidade.** `/status` e `/api/status` expõem versão, commit, modo de dados, driver
de configuração, release público e latência de coleta. Logs estruturados ficam a cargo da
plataforma (Vercel), que já agrega por requisição.

**Ambientes.** Cada pull request gera um preview na Vercel — o que é, ao mesmo tempo, a
evidência de CI/CD pedida pela disciplina e o ambiente onde a equipe confere o que o
professor vai ver antes de publicar.
