# O banco que existe, mas não está ligado

O Prumo roda **sem banco**: os dados vivem em memória, gerados por script com semente fixa.
`git clone && npm run dev` funciona sem nenhuma credencial, e é assim de propósito.

Ainda assim, `supabase/migrations/` traz um schema PostgreSQL completo, com políticas de RLS
e gatilhos, testado contra um banco de verdade. Este documento explica por que ele existe,
o que ele contém e como usá-lo se um dia for preciso.

## Por que ele existe se não é usado

A persistência chegou a ser integrada ao app e depois foi removida — o porquê está em
`decisoes.md`, ADR-011 e ADR-012. Resumo: o Supabase é escolha de stack no briefing, não
requisito da disciplina, e o custo (contas de demonstração, middleware três vezes maior,
setup obrigatório para a equipe) não se pagava.

O schema ficou porque:

1. **É evidência técnica.** Modelagem, RLS por perfil e invariantes em gatilho são material
   concreto para o SR1, e a análise de segurança se apoia nele.
2. **Custa zero.** Os testes pulam sozinhos sem `DATABASE_URL_TESTE`; ninguém precisa de
   Postgres para trabalhar no projeto.
3. **A volta atrás é barata.** As telas falam com `src/lib/dados/`, não com o seed. Ligar uma
   fonte persistente é acrescentar um driver ao lado de `driver-seed.ts`.

## O que o schema contém

| Migração | Conteúdo |
| --- | --- |
| `..._esquema.sql` | Tipos, tabelas, índices e constraints das entidades do §8.2 |
| `..._funcoes_e_gatilhos.sql` | Identidade do usuário, auditoria append-only, máquina de estados, janela de lançamento, regra imutável |
| `..._rls.sql` | Políticas de RLS por perfil |
| `..._configuracao.sql` | `configuracao_site` e `log_releases` |

### O RBAC como política de dados

O §8.1 vira `using` de política, não `if` de aplicação:

```sql
create policy avaliacoes_leitura on avaliacoes
  for select to authenticated
  using (app.le_tudo() or gestor_id = app.gestor_atual());
```

Um gestor que consultasse a API do banco diretamente receberia apenas as próprias linhas.

### Quatro invariantes acima da autorização

São gatilhos, não políticas — por isso valem **inclusive para a service role**, que ignora RLS:

1. `trilha_append_only` — evento de auditoria não se altera nem se apaga.
2. `ciclo_transicao_valida` — o ciclo avança um estado por vez e nunca volta.
3. `lancamento_dentro_da_janela` — lançamento fora do prazo é recusado pelo banco.
4. `regra_imutavel` — as faixas de uma regra vigente não se editam; muda-se de versão.

## Como usar

Precisa de qualquer PostgreSQL 16 — local, container, Supabase, Neon, o que for.

```bash
# 1. Aplicar o schema
psql "$DATABASE_URL" -f supabase/testes/stubs-locais.sql   # só fora do Supabase
for m in supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$m"; done

# 2. Semear a base sintética
DATABASE_URL=postgresql://... npm run semear -- --limpar
```

`stubs-locais.sql` recria o mínimo que o Supabase já traz pronto: o schema `auth`, a função
`auth.uid()` e os papéis `anon`, `authenticated` e `service_role`. Num projeto Supabase, pule
esse passo.

A semeadura respeita a ordem que os gatilhos exigem: os ciclos entram em rascunho, sobem para
lançamento aberto, recebem os 171 lançamentos e só então avançam um estado por vez.
Consequência boa — a trilha de auditoria nasce com os eventos reais, não fabricados.

## Como testar as políticas

Política escrita não é política funcionando. A suíte aplica as migrações num banco limpo e
exercita cada perfil como o PostgREST faria, setando `request.jwt.claims`:

```bash
DATABASE_URL_TESTE=postgresql://... npm run testar-rls
```

São 23 verificações: quem lê o quê, quem escreve o quê, os quatro invariantes e a semeadura
completa da base sintética contra o schema real. Sem a variável, a suíte é pulada e o resto
dos testes continua rodando.

## Se um dia for preciso ligar

O caminho está mapeado:

1. Um `driver-supabase.ts` (ou `driver-postgres.ts`) implementando `RepositorioDados`, ao lado
   de `src/lib/dados/driver-seed.ts`. Os mapeadores de domínio → banco já existem em
   `src/lib/dados/mapeadores.ts`.
2. Seleção de driver por variável de ambiente em `src/lib/dados/index.ts`.
3. Autenticação para que `auth.uid()` tenha o que responder — sem sessão, as políticas de RLS
   não têm como distinguir perfil.

O passo 3 é o que traz de volta o custo que motivou a remoção. Vale a pena se a persistência
virar requisito; não valia só para dizer que existe.
