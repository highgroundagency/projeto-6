# Arquitetura

## Visão de contexto (C4 nível 1)

```mermaid
C4Context
  title Prumo — contexto
  Person(cam, "CAM", "Comissão de Avaliação de Metas: gere ciclos, regras e homologação")
  Person(area, "Área técnica", "Informa os indicadores da própria área")
  Person(gestor, "Gestor avaliado", "Consulta o próprio resultado e contesta")
  Person(auditoria, "Auditoria", "Fiscaliza; vê tudo, edita nada")
  Person(professor, "Professor", "Avalia o registro do projeto")

  System(prumo, "Prumo", "Registro do projeto e MVP do cálculo da gratificação")
  System_Ext(drive, "Google Drive", "Repositório oficial de documentos da equipe")
  System_Ext(ml, "Pipeline de ML", "Notebooks offline que exportam JSON")

  Rel(cam, prumo, "Gere ciclos, homologa e publica")
  Rel(area, prumo, "Lança indicadores com evidência")
  Rel(gestor, prumo, "Consulta resultado e memória de cálculo")
  Rel(auditoria, prumo, "Lê a trilha de auditoria")
  Rel(professor, prumo, "Lê o registro semanal")
  Rel(prumo, drive, "Link para os documentos")
  Rel(ml, prumo, "Artefatos JSON consumidos pela tela de analytics")
```

## Visão de contêineres (C4 nível 2)

```mermaid
C4Container
  title Prumo — contêineres
  Person(usuario, "Usuário", "CAM, área técnica, gestor, auditoria ou professor")

  Container_Boundary(vercel, "Vercel") {
    Container(browser, "Navegador", "HTML + CSS", "Recebe HTML renderizado no servidor; quase nenhum JavaScript de aplicação")
    Container(app, "Next.js App Router", "TypeScript, React Server Components", "Porta de entrada, registro, painel e telas do sistema")
    Container(middleware, "Middleware", "Edge runtime", "Primeira camada de proteção de /admin")
    Container(rotas, "Route handlers", "Node runtime", "Login, configuração, lançamento, contestação, exportação e health check")
  }

  Container_Boundary(dados, "Dados") {
    ContainerDb(seed, "Seed em memória", "TypeScript", "Base sintética com semente fixa (fases 1–2)")
    ContainerDb(arquivo, "config-site.json", "JSON local", "Configuração de release em desenvolvimento")
    ContainerDb(supabase, "Supabase (F3)", "Postgres + Auth + RLS", "Entidades, auditoria, configuracao_site e log_releases")
  }

  Container_Boundary(offline, "Offline") {
    Container(notebooks, "Notebooks", "Python, scikit-learn, pandas", "EDA, classificação, regressão e clustering")
    ContainerDb(artefatos, "src/data/ml/*.json", "JSON versionado", "Resultados e métricas exportados")
  }

  Rel(usuario, browser, "Acessa")
  Rel(browser, app, "HTTPS")
  Rel(app, middleware, "Passa por")
  Rel(browser, rotas, "Formulários HTML (POST)")
  Rel(app, seed, "Lê")
  Rel(app, arquivo, "Lê e grava em dev")
  Rel(app, supabase, "Lê e grava a partir da F3")
  Rel(notebooks, artefatos, "Exportam")
  Rel(app, artefatos, "Lê na tela de analytics")
```

## Fluxo de dados do cálculo

```mermaid
flowchart LR
  A[Área técnica<br/>informa o valor] -->|zod valida| B[Lançamento<br/>+ evidência + autor]
  B --> C{Ciclo em<br/>janela aberta?}
  C -->|não| D[Recusa com motivo<br/>registrado na trilha]
  C -->|sim| E[Trilha de auditoria<br/>append-only]
  E --> F[Motor de cálculo<br/>função pura]
  G[Regra vigente<br/>versionada] --> F
  F --> H[Avaliação<br/>score + faixa]
  F --> I[Memória de cálculo<br/>passo a passo]
  H --> J[Gestor avaliado]
  I --> J
  H --> K[Painel da gestão<br/>agregados e CSV]
```

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

**Postgres gerenciado (Supabase, a partir da F3).** RLS no banco permite espelhar o RBAC do
§8.1 como política de dados, não como `if` na aplicação. Auth, storage e Postgres no mesmo
provedor evitam integração extra num semestre curto.

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
