-- =============================================================================
-- Stubs para rodar as migrações num PostgreSQL comum.
--
-- No Supabase, o schema `auth`, a função `auth.uid()` e os papéis `anon`,
-- `authenticated` e `service_role` já existem. Este arquivo recria o mínimo
-- necessário para que as MESMAS migrações rodem numa instância local e as
-- políticas de RLS possam ser exercitadas de verdade.
--
-- NÃO faz parte das migrações: é usado apenas por `npm run testar-rls`.
-- =============================================================================

create schema if not exists auth;

/**
 * Réplica fiel do que o Supabase faz: o `uid` vem do claim `sub` do JWT, que o
 * PostgREST publica em `request.jwt.claims`. Nos testes, basta setar esse GUC
 * para "logar" como alguém.
 */
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    ''
  )::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', ''),
    'anon'
  );
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

grant anon, authenticated, service_role to current_user;
