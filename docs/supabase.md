# Supabase — como colocar de pé

Manual da equipe para sair do seed em memória e ir para o banco de verdade.

## O que muda quando o Supabase entra

| | Sem Supabase (F1–F2) | Com Supabase (F3) |
| --- | --- | --- |
| Dados | Seed em memória, semente fixa | Postgres, persistente |
| Escrita | Some no reinício do processo | Persistente e auditada |
| Perfil | Seletor simulado, sem autenticação | Supabase Auth + tabela `usuarios` |
| Autorização | `if` na aplicação | **Políticas de RLS no banco** |
| Configuração de release | Env var, somente leitura em produção | Tabela `configuracao_site`, gravável |
| Trilha de auditoria | Memória | Tabela append-only, garantida por gatilho |

O app **detecta sozinho**: com `SUPABASE_URL` e `SUPABASE_ANON_KEY` definidas, o driver do
Supabase assume. Sem elas, o seed continua funcionando — é o que permite
`git clone && npm run dev` sem nenhuma credencial.

Para forçar o seed mesmo com o Supabase configurado (útil para demonstrar sem tocar na
base real): `NEXT_PUBLIC_DATA_MODE=seed`.

## Passo a passo

### 1. Criar o projeto

Crie um projeto no Supabase e anote, em *Project Settings → API*:

| Variável | Onde achar |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Chave `anon` / `public` |
| `SUPABASE_SERVICE_ROLE` | Chave `service_role` — **nunca** exponha no cliente |

### 2. Aplicar as migrações

Os quatro arquivos de `supabase/migrations/` rodam em ordem. Pelo SQL Editor do painel,
cole um por vez; pela CLI, `supabase db push`.

| Migração | O que cria |
| --- | --- |
| `..._esquema.sql` | Tipos, tabelas, índices e constraints |
| `..._funcoes_e_gatilhos.sql` | Identidade do usuário, auditoria append-only, máquina de estados, janela de lançamento, regra imutável |
| `..._rls.sql` | Políticas de RLS por perfil |
| `..._configuracao.sql` | `configuracao_site` e `log_releases` |

### 3. Semear a base sintética

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE=... npm run semear -- --limpar --contas
```

`--contas` cria quatro logins de demonstração, um por perfil:

| E-mail | Perfil | Enxerga |
| --- | --- | --- |
| `cam@prumo.exemplo` | CAM | tudo; homologa e publica |
| `area@prumo.exemplo` | Área técnica | só os lançamentos da própria área |
| `gestor@prumo.exemplo` | Gestor avaliado | só o próprio resultado |
| `auditoria@prumo.exemplo` | Auditoria | tudo; escreve nada |

Senha padrão em `SENHA_DEMO` (default `prumo-demo-2026`). **Troque antes de qualquer uso
que não seja demonstração.**

> A ordem da semeadura obedece aos gatilhos do banco: os ciclos entram em rascunho, sobem
> para lançamento aberto, recebem os lançamentos e só então avançam um estado por vez.
> Consequência boa: a trilha de auditoria nasce com os eventos reais, não fabricados.

### 4. Configurar o ambiente

Na Vercel (ou em `.env.local`):

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...        # só no servidor
ADMIN_COOKIE_SECRET=...          # obrigatória em produção
```

## Como a autorização funciona

O RBAC do §8.1 é **política de dados**, não `if` na aplicação:

```sql
create policy avaliacoes_leitura on avaliacoes
  for select to authenticated
  using (app.le_tudo() or gestor_id = app.gestor_atual());
```

Um gestor que consultasse `/avaliacoes` direto pela API do Supabase receberia apenas as
próprias linhas — o filtro está no banco, não na tela.

Três invariantes valem **até para a service role**, porque são gatilhos e não políticas:

1. A trilha de auditoria não pode ser alterada nem apagada.
2. O ciclo avança um estado por vez e nunca volta.
3. Lançamento só entra com a janela aberta.

## Testar as políticas

Política escrita não é política funcionando. A suíte aplica as migrações reais num
PostgreSQL descartável e exercita cada perfil como o PostgREST faria:

```bash
# Sobe um Postgres qualquer e aponte para ele
DATABASE_URL_TESTE=postgresql://postgres@localhost:5432/prumo_teste npm run testar-rls
```

São 23 verificações: quem lê o quê, quem escreve o quê, e os três invariantes acima —
mais a semeadura completa da base sintética contra o schema real.

Sem a variável, a suíte é pulada com aviso e o resto dos testes continua rodando.

## O que ainda não está feito

- As contas de demonstração usam senha compartilhada: serve para banca, não para produção.
- Não há fluxo de recuperação de senha nem convite por e-mail.
- O painel administrativo (§7) continua com senha própria, separada do Supabase Auth — são
  dois mecanismos distintos, para dois públicos distintos, e isso está em `seguranca.md`.
