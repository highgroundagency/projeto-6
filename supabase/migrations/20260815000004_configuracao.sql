-- =============================================================================
-- Prumo — configuração do site e log de liberações (F3)
--
-- É o que resolve a limitação declarada em docs/decisoes.md (ADR-004): até
-- aqui, produção não tinha onde gravar a configuração de release, porque o
-- filesystem da Vercel é read-only. Agora tem.
-- =============================================================================

create table configuracao_site (
  -- Linha única, garantida pelo check: configuração de site não é coleção.
  id                serial primary key,
  adiantamento_dias integer not null default 7
    check (adiantamento_dias >= 0 and adiantamento_dias <= 120),
  override_release  text,
  travas            jsonb not null default '{}'::jsonb,
  atualizado_em     timestamptz not null default now(),

  constraint configuracao_linha_unica check (id = 1)
);

insert into configuracao_site (id) values (1);

create table log_releases (
  id     bigserial primary key,
  quando timestamptz not null default now(),
  autor  text not null,
  campo  text not null,
  de     text not null,
  para   text not null
);

create index log_releases_quando_idx on log_releases (quando desc);

-- O log de liberações é histórico: também não se reescreve.
create trigger log_releases_append_only
  before update or delete on log_releases
  for each row execute function app.impedir_alteracao_da_trilha();

alter table configuracao_site enable row level security;
alter table log_releases enable row level security;

-- O site público precisa ler a configuração ANTES de qualquer login: é ela que
-- decide qual release o visitante enxerga. Por isso a leitura é liberada até
-- para `anon`. Não há dado pessoal aqui — só datas e travas de publicação.
grant select on configuracao_site to anon, authenticated;
grant select on log_releases to authenticated;

create policy configuracao_leitura_publica on configuracao_site
  for select to anon, authenticated using (true);

create policy log_leitura on log_releases
  for select to authenticated using (app.le_tudo());

-- Nenhuma política de escrita, de propósito: quem grava é a service role, a
-- partir do painel administrativo já protegido por senha (§7.1). Assim não
-- existe caminho de escrita a partir de uma sessão de navegador.
