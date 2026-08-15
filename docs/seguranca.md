# Segurança

Este documento cobre o sistema **e o próprio mecanismo administrativo do site** (§7). A
superfície de ataque que a equipe criou para si mesma é analisada aqui com a mesma régua
usada para o resto — esconder isso seria pior do que ter o risco.

## STRIDE

| Ameaça | Onde se aplica | Mitigação atual | Estado |
| --- | --- | --- | --- |
| **S**poofing — fingir ser a CAM | Painel `/admin` | Senha única conferida só no servidor, em tempo constante; cookie httpOnly assinado com HMAC-SHA256; 30 dias de validade | Implementado |
| **S**poofing — fingir ser outro perfil no sistema | Seletor de perfil / Supabase Auth | Com Supabase configurado, o perfil vem da tabela `usuarios` vinculada ao Auth e as políticas de RLS filtram no banco. Sem Supabase, o seletor é simulado e não protege nada — declarado na própria tela | Implementado (F3) |
| **T**ampering — adulterar o cookie de sessão | `/admin/*` | Payload assinado; qualquer alteração invalida a assinatura; comparação em tempo constante | Implementado |
| **T**ampering — adulterar o overlay de visão | Cookie `prumo_visao` | Mesmo esquema de assinatura; conteúdo revalidado com zod após verificar a assinatura | Implementado |
| **T**ampering — alterar resultado já homologado | Motor de cálculo | Regra versionada: alterar cria nova versão e não toca na vigente; recálculo do ciclo antigo reproduz o mesmo número | Implementado |
| **R**epudiation — negar que informou um valor | Lançamentos | Trilha append-only com autor, timestamp, antes e depois; correção entra como novo evento. Na F3, gatilho no banco impede alteração até pela service role | Implementado |
| **I**nformation disclosure — vazar conteúdo de release futuro | Registro e telas | Gate no servidor; carregadores preguiçosos; `import 'server-only'`; rota não liberada devolve 404; verificação automatizada em CI | Implementado e testado |
| **I**nformation disclosure — vazar dado pessoal | Toda a base | Nenhum dado real entra no repositório; seed sintético com semente fixa; teste que recusa CPF, e-mail, telefone e matrícula na base | Implementado |
| **D**enial of service — força bruta no login | `/api/admin/entrar` | 5 tentativas por 10 minutos por IP, com erro genérico | Parcial — ver limitação abaixo |
| **D**enial of service — sobrecarga da aplicação | Toda a aplicação | Limites da plataforma (Vercel); páginas leves e sem consulta pesada | Delegado à plataforma |
| **E**levation of privilege — acessar `/admin` sem sessão | `/admin/*`, `/api/admin/*` | Middleware **e** revalidação da sessão dentro de cada page e route handler | Implementado |
| **E**levation of privilege — agir fora do próprio perfil | APIs do sistema | Cada route handler confere o perfil antes de agir e recusa com motivo | Implementado (sobre login simulado) |

## OWASP Top 10 (2021) — estado

| Risco | Estado | Observação |
| --- | --- | --- |
| A01 Quebra de controle de acesso | **Coberto (F3)** | Painel em duas camadas; sistema com RLS por perfil no banco, verificada por 21 testes contra um PostgreSQL real |
| A02 Falhas criptográficas | **Coberto** | HMAC-SHA256 via Web Crypto; segredo só em env; nenhuma senha persistida |
| A03 Injeção | **Coberto** | Sem SQL na F2; toda entrada validada por zod; JSX escapa saída por padrão |
| A04 Design inseguro | **Coberto** | Regra versionada e auditoria append-only são decisões de design contra adulteração |
| A05 Configuração incorreta | **Parcial** | CSP, X-Frame-Options, nosniff, Referrer-Policy e HSTS aplicados. CSP ainda usa `unsafe-inline` |
| A06 Componentes vulneráveis | **Parcial** | `npm audit` acusa 3 avisos altos transitivos do Next (postcss, sharp), corrigíveis só com Next 16 — fora do escopo fixado no briefing. São dependências de build, não de runtime da aplicação |
| A07 Falhas de identificação | **Parcial** | Sistema usa Supabase Auth (e-mail e senha, sem MFA). Painel administrativo mantém senha única sem MFA e rate limit best-effort |
| A08 Integridade de software e dados | **Coberto** | Conteúdo versionado no Git; painel não edita conteúdo por formulário |
| A09 Falhas de log e monitoração | **Parcial** | Auditoria da aplicação é completa; log de acesso fica com a plataforma |
| A10 SSRF | **N/A** | A aplicação não faz requisição a URL informada por usuário |

## O mecanismo de admin como superfície de ataque

O painel foi criado pela equipe para controlar o que o professor vê. Isso é, por
definição, um alvo. Os riscos, sem maquiagem:

**A senha padrão `0321` é pública.** Ela está no briefing da disciplina e neste
repositório. Quem ler o enunciado consegue entrar num deploy que não trocou
`ADMIN_SENHA`. Mitigação: trocar a variável no ambiente de produção. Enquanto não for
trocada, o risco real é limitado — o painel não edita conteúdo, não expõe dado pessoal e
só controla a data de liberação de material que será público de qualquer forma.

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

## O que a F3 fechou

**Autorização no banco.** O RBAC do §8.1 virou política de RLS. Um gestor que consultasse a
API do Supabase diretamente receberia apenas as próprias avaliações — o filtro não está na
tela, está no `using` da política. São 21 testes exercitando cada perfil como o PostgREST
faria, aplicando as migrações reais num PostgreSQL descartável.

**Invariantes acima da autorização.** Três regras são gatilho, não política, e por isso
valem inclusive para a service role:

1. `trilha_append_only` — evento de auditoria não se altera nem se apaga.
2. `ciclo_transicao_valida` — o ciclo avança um estado por vez e nunca volta.
3. `lancamento_dentro_da_janela` — lançamento fora do prazo é recusado no banco.

Somam-se a `regra_imutavel`, que impede editar as faixas de uma regra vigente: muda-se de
versão, não de conteúdo.

**Persistência da configuração.** `configuracao_site` tem leitura liberada até para `anon`
(é ela que decide o release do visitante) e nenhuma política de escrita — gravar só pelo
servidor, com a service role. Isso encerra a limitação do ADR-004.

## Limitações conhecidas

1. As contas de demonstração compartilham senha. Servem para a banca, não para produção.
2. Sem Supabase configurado, o seletor de perfil não é autenticação e está rotulado como tal
   no código e na tela.
3. O painel administrativo (§7) usa mecanismo próprio, separado do Supabase Auth. São dois
   públicos distintos — a equipe e os perfis do processo — mas é uma superfície a mais.
4. A CSP usa `'unsafe-inline'` em `script-src` e `style-src`. O próximo passo é nonce por
   requisição.
5. Não há proteção CSRF explícita além de `sameSite=lax` — suficiente para formulários
   `POST` de mesma origem, insuficiente se algum dia houver API pública.
6. Não há MFA nem recuperação de senha no Supabase Auth.
