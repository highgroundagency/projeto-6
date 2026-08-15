# Segurança

Este documento cobre o sistema **e o próprio mecanismo administrativo do site** (§7). A
superfície de ataque que a equipe criou para si mesma é analisada aqui com a mesma régua
usada para o resto — esconder isso seria pior do que ter o risco.

## STRIDE

| Ameaça | Onde se aplica | Mitigação atual | Estado |
| --- | --- | --- | --- |
| **S**poofing — fingir ser a CAM | Painel `/admin` | Senha única conferida só no servidor, em tempo constante; cookie httpOnly assinado com HMAC-SHA256; 30 dias de validade | Implementado |
| **S**poofing — fingir ser outro perfil no sistema | Seletor de perfil | **Não mitigado, por design**: o seletor é login simulado e não protege nada, o que a tela declara. Ele é cookie por visitante, então trocar de perfil não afeta terceiros. As políticas de RLS que resolveriam isso estão escritas e testadas em `supabase/migrations/`, mas não ligadas ao app | Risco aceito e declarado |
| **T**ampering — adulterar o cookie de sessão | `/admin/*` | Payload assinado; qualquer alteração invalida a assinatura; comparação em tempo constante | Implementado |
| **T**ampering — adulterar o overlay de visão | Cookie `prumo_visao` | Mesmo esquema de assinatura; conteúdo revalidado com zod após verificar a assinatura | Implementado |
| **T**ampering — alterar resultado já homologado | Motor de cálculo | Regra versionada: alterar cria nova versão e não toca na vigente; recálculo do ciclo antigo reproduz o mesmo número | Implementado |
| **R**epudiation — negar que informou um valor | Lançamentos | Trilha append-only com autor, timestamp, antes e depois; correção entra como novo evento. Em memória, depende de a camada de escrita ser o único caminho; no schema guardado, um gatilho garante o mesmo até para a service role | Parcial |
| **I**nformation disclosure — vazar conteúdo de release futuro | Registro e telas | Gate no servidor; carregadores preguiçosos; `import 'server-only'`; rota não liberada devolve 404; verificação automatizada em CI | Implementado e testado |
| **I**nformation disclosure — vazar dado pessoal | Toda a base | Nenhum dado real entra no repositório; seed sintético com semente fixa; teste que recusa CPF, e-mail, telefone e matrícula na base | Implementado |
| **D**enial of service — força bruta no login | `/api/admin/entrar` | 5 tentativas por 10 minutos por IP, com erro genérico | Parcial — ver limitação abaixo |
| **D**enial of service — sobrecarga da aplicação | Toda a aplicação | Limites da plataforma (Vercel); páginas leves e sem consulta pesada | Delegado à plataforma |
| **E**levation of privilege — acessar `/admin` sem sessão | `/admin/*`, `/api/admin/*` | Middleware **e** revalidação da sessão dentro de cada page e route handler | Implementado |
| **E**levation of privilege — agir fora do próprio perfil | APIs do sistema | Cada route handler confere o perfil antes de agir e recusa com motivo | Implementado (sobre login simulado) |
| **T**ampering — adulterar a demonstração alheia | `/api/sistema/ciclo` | O estado do ciclo é compartilhado por todos os visitantes da instância e a transição não volta. Exige sessão de admin (`exigirAdmin`), e o controle não é renderizado para quem não a tem | Implementado |

## OWASP Top 10 (2021) — estado

| Risco | Estado | Observação |
| --- | --- | --- |
| A01 Quebra de controle de acesso | **Parcial** | Painel protegido em duas camadas, e o avanço de ciclo passou a exigir a mesma sessão. No resto do sistema o RBAC roda sobre seletor simulado; as políticas de RLS existem e estão testadas, mas não estão ligadas ao app |
| A02 Falhas criptográficas | **Coberto** | HMAC-SHA256 via Web Crypto; segredo só em env; nenhuma senha persistida |
| A03 Injeção | **Coberto** | O app não emite SQL; toda entrada validada por zod; JSX escapa saída por padrão. O script de semeadura usa consultas parametrizadas |
| A04 Design inseguro | **Coberto** | Regra versionada e auditoria append-only são decisões de design contra adulteração |
| A05 Configuração incorreta | **Parcial** | CSP, X-Frame-Options, nosniff, Referrer-Policy e HSTS aplicados. CSP ainda usa `unsafe-inline` |
| A06 Componentes vulneráveis | **Parcial** | `npm audit` acusa 3 avisos altos transitivos do Next (postcss, sharp), corrigíveis só com Next 16 — fora do escopo fixado no briefing. São dependências de build, não de runtime da aplicação |
| A07 Falhas de identificação | **Parcial** | O sistema não autentica (perfil simulado). O painel usa senha única, sem MFA, com rate limit best-effort |
| A08 Integridade de software e dados | **Coberto** | Conteúdo versionado no Git; painel não edita conteúdo por formulário |
| A09 Falhas de log e monitoração | **Parcial** | Auditoria da aplicação é completa; log de acesso fica com a plataforma |
| A10 SSRF | **N/A** | A aplicação não faz requisição a URL informada por usuário |

## O mecanismo de admin como superfície de ataque

O painel foi criado pela equipe para controlar o que o professor vê. Isso é, por
definição, um alvo. Os riscos, sem maquiagem:

**A senha padrão `0321` é pública.** Ela está no briefing da disciplina e neste
repositório, que é público. Quem ler o enunciado consegue entrar num deploy que não trocou
`ADMIN_SENHA`. Mitigação: trocar a variável no ambiente de produção. Enquanto não for
trocada, o risco real é limitado — o painel não edita conteúdo, não expõe dado pessoal e
só controla a data de liberação de material que será público de qualquer forma.

**Nada no site aponta para o painel.** O rodapé já teve um ponto discreto levando a
`/admin/entrar`; ele saiu na ADR-015, porque um link rotulado "Painel administrativo" é
encontrado por Ctrl+F, por leitor de tela e por quem passa o mouse no canto. Isso reduz o
tropeço, **não** é controle de acesso: este repositório é público e este próprio documento
descreve o mecanismo, como o §7 exige. Quem protege é a senha trocada em produção.

**Autenticação por senha única, sem identidade.** Não há usuário, não há MFA, não há
revogação individual. Todo mundo da equipe usa a mesma senha, e o log de liberações
registra "painel" como autor. É adequado para seis pessoas num semestre; não seria para
um sistema real.

**Rate limit é best-effort.** O contador vive na memória do processo. Em serverless há
várias instâncias e elas reciclam: um atacante distribuído ganha tentativas extras a cada
instância fria. Está assim declarado no código (`src/lib/admin/rate-limit.ts`). **A F3 não
mudou isso**: o painel administrativo não usa Supabase Auth, então o contador continua em
memória. Movê-lo para uma tabela é trabalho pendente, e não fingimos o contrário.

**Middleware não é suficiente sozinho.** Já houve classe de bug no Next em que o
middleware podia ser contornado por cabeçalho forjado. Por isso toda page e todo route
handler de `/admin` revalidam a sessão por conta própria (`exigirAdmin`), e a falha
devolve **404**, não 401 — não confirmamos a existência do painel para quem não deveria
saber dele.

**Sem segredo, o painel deixa de existir.** Em produção, `ADMIN_COOKIE_SECRET` ausente ou
menor que 16 caracteres faz o painel falhar fechado. Preferimos indisponibilidade a
assinar cookie com valor previsível.

## O RBAC: o que está escrito e o que está ligado

Vale distinguir duas coisas que costumam ser confundidas.

**Escrito e testado.** `supabase/migrations/` traz o RBAC do §8.1 como políticas de RLS: a
CAM gere, a área técnica só alcança a própria área, o gestor só a própria avaliação, a
auditoria lê e não escreve. Mais quatro invariantes em gatilho, que valem inclusive para a
service role: trilha append-only, transição de ciclo um passo por vez, janela de lançamento
e regra imutável. São 21 verificações contra um PostgreSQL real (`npm run testar-rls`).

**Ligado ao app.** Nada disso. O app não usa banco (ADR-011): o perfil vem de um seletor
simulado, sem autenticação, e quem separa as visões é a própria aplicação. Isso é adequado
para um protótipo com dados sintéticos e inadequado para qualquer coisa além disso — e é por
isso que a tela diz "Perfil simulado" em vez de fingir um login.

A consequência prática precisa ser dita com precisão, porque a formulação óbvia erra o alvo.
**Num deploy público, qualquer visitante troca de perfil** — e isso é quase inofensivo: o
perfil é cookie do próprio visitante, ninguém afeta ninguém, e não há dado real para ver.

O que importava era a **escrita em estado compartilhado**. `src/lib/sistema/estado.ts` guarda
as alterações em variáveis de módulo, na memória do processo: elas valem para todos os
visitantes daquela instância. Três ações escrevem ali, e elas não são equivalentes:

| Ação | Efeito em terceiros | Decisão |
| --- | --- | --- |
| Avançar o estado do ciclo | Irreversível pela interface. Sair de `lancamento_aberto` fecha a janela para todo mundo | **Exige sessão de admin** (ADR-015); o controle nem aparece para os demais |
| Registrar lançamento | Aditivo; entra na trilha com autor e timestamp | Aberto — é o fluxo que a banca precisa experimentar |
| Abrir contestação | Aditivo; entra na lista do ciclo | Aberto, mesma razão |

O risco residual é o de qualquer protótipo com escrita aberta: alguém polui a base sintética
com lançamentos. Reseta no redeploy, aparece na auditoria e não expõe ninguém.

## Limitações conhecidas

1. O seletor de perfil não é autenticação. Está rotulado como tal no código e na tela, mas
   num deploy público qualquer pessoa alterna entre os quatro perfis. A única credencial real
   do projeto é a sessão de admin, e ela não vem do seletor.
2. A camada de escrita do sistema vive em memória: alterações se perdem no reinício e podem
   não valer entre requisições em serverless. Lançamento e contestação seguem abertos a
   qualquer visitante, por decisão — ver a tabela acima.
3. Esconder o link do painel é redução de tropeço, não segurança. O repositório é público e
   este documento descreve o mecanismo; a proteção efetiva é `ADMIN_SENHA` trocada em produção.
4. A CSP usa `'unsafe-inline'` em `script-src` e `style-src`. O próximo passo é nonce por
   requisição.
5. Não há proteção CSRF explícita além de `sameSite=lax` — suficiente para formulários
   `POST` de mesma origem, insuficiente se algum dia houver API pública.
