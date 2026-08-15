-- =============================================================================
-- Prumo — esquema base (F3)
--
-- Tudo que estava em memória nas fases 1–2 (src/lib/seed) vira tabela aqui,
-- com a MESMA forma de dados. O motor de cálculo continua sendo função pura na
-- aplicação: o banco guarda insumo e resultado, não regra de negócio.
--
-- Nenhum dado real de pessoa ou da SESAU entra aqui. Ver docs/privacidade.md.
-- =============================================================================

create schema if not exists app;

comment on schema app is
  'Funções auxiliares do Prumo usadas pelas políticas de RLS.';

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------

create type perfil_usuario as enum ('cam', 'area_tecnica', 'gestor', 'auditoria');

create type estado_ciclo as enum (
  'rascunho',
  'lancamento_aberto',
  'em_validacao',
  'homologado',
  'publicado'
);

create type direcao_indicador as enum ('maior_melhor', 'menor_melhor');

create type periodicidade_indicador as enum (
  'mensal', 'bimestral', 'trimestral', 'semestral', 'anual'
);

create type status_lancamento as enum ('rascunho', 'enviado', 'validado', 'rejeitado');

create type status_contestacao as enum (
  'aberta', 'em_analise', 'respondida', 'acatada', 'recusada'
);

create type tipo_evento as enum (
  'ciclo_criado',
  'ciclo_estado_alterado',
  'indicador_criado',
  'indicador_alterado',
  'regra_versionada',
  'lancamento_registrado',
  'lancamento_alterado',
  'avaliacao_calculada',
  'contestacao_aberta',
  'contestacao_respondida'
);

-- -----------------------------------------------------------------------------
-- Cadastros
-- -----------------------------------------------------------------------------

create table areas (
  id    text primary key,
  sigla text not null,
  nome  text not null
);

create table gestores (
  id      text primary key,
  nome    text not null,
  cargo   text not null,
  area_id text not null references areas (id) on delete restrict
);

create index gestores_area_idx on gestores (area_id);

-- Quem faz login. O id é o mesmo de auth.users: a identidade vem do Supabase
-- Auth e o papel no processo vem daqui.
create table usuarios (
  id        uuid primary key,
  nome      text not null,
  perfil    perfil_usuario not null,
  area_id   text references areas (id) on delete restrict,
  gestor_id text references gestores (id) on delete restrict,

  -- Um usuário de área técnica sem área não teria o que lançar; um gestor sem
  -- vínculo não teria resultado para ver. O banco recusa os dois casos.
  constraint usuario_area_tecnica_tem_area
    check (perfil <> 'area_tecnica' or area_id is not null),
  constraint usuario_gestor_tem_vinculo
    check (perfil <> 'gestor' or gestor_id is not null)
);

create index usuarios_perfil_idx on usuarios (perfil);

create table indicadores (
  id            text primary key,
  area_id       text not null references areas (id) on delete restrict,
  nome          text not null,
  unidade       text not null,
  direcao       direcao_indicador not null,
  fonte         text not null,
  periodicidade periodicidade_indicador not null,
  meta          numeric not null,
  peso          numeric not null check (peso > 0)
);

create index indicadores_area_idx on indicadores (area_id);

-- Regra de pontuação VERSIONADA: alterar cria nova versão, nunca edita a
-- vigente. Sem isso, um ciclo homologado deixaria de reproduzir o próprio
-- resultado. As faixas ficam em jsonb porque são dado de configuração lido
-- inteiro pelo motor — não há consulta por faixa isolada.
create table regras_pontuacao (
  id                   text primary key,
  versao               integer not null,
  descricao            text not null,
  vigente_de           text not null,
  vigente_ate          text,
  faixas               jsonb not null,
  pontuacao_maxima     numeric not null check (pontuacao_maxima > 0),
  faixas_gratificacao  jsonb not null,
  arredondamento       jsonb not null,
  teto_atingimento     numeric not null check (teto_atingimento >= 1),
  sem_lancamento       text not null,

  constraint regra_versao_unica unique (versao),
  constraint regra_vigencia_coerente
    check (vigente_ate is null or vigente_ate >= vigente_de)
);

create table ciclos (
  id                        text primary key,
  competencia               text not null unique,
  estado                    estado_ciclo not null default 'rascunho',
  janela_lancamento_inicio  timestamptz not null,
  janela_lancamento_fim     timestamptz not null,
  regra_id                  text not null references regras_pontuacao (id) on delete restrict,

  constraint ciclo_janela_coerente
    check (janela_lancamento_fim > janela_lancamento_inicio)
);

create index ciclos_estado_idx on ciclos (estado);

-- -----------------------------------------------------------------------------
-- Movimento
-- -----------------------------------------------------------------------------

create table lancamentos (
  id            uuid primary key default gen_random_uuid(),
  indicador_id  text not null references indicadores (id) on delete restrict,
  ciclo_id      text not null references ciclos (id) on delete restrict,
  valor         numeric not null check (valor >= 0),
  evidencia     text not null check (length(trim(evidencia)) >= 5),
  autor         text not null,
  registrado_em timestamptz not null default now(),
  status        status_lancamento not null default 'enviado'
);

create index lancamentos_ciclo_idx on lancamentos (ciclo_id);
create index lancamentos_indicador_ciclo_idx on lancamentos (indicador_id, ciclo_id);

create table avaliacoes (
  id           uuid primary key default gen_random_uuid(),
  gestor_id    text not null references gestores (id) on delete restrict,
  ciclo_id     text not null references ciclos (id) on delete restrict,
  score        numeric not null check (score >= 0 and score <= 100),
  faixa        jsonb,
  -- A memória de cálculo é o produto: guarda cada passo que levou ao score.
  memoria      jsonb not null,
  avisos       jsonb not null default '[]'::jsonb,
  regra_id     text not null references regras_pontuacao (id) on delete restrict,
  versao_regra integer not null,
  calculado_em timestamptz not null default now(),

  constraint avaliacao_unica_por_ciclo unique (gestor_id, ciclo_id)
);

create index avaliacoes_ciclo_idx on avaliacoes (ciclo_id);

create table contestacoes (
  id           uuid primary key default gen_random_uuid(),
  gestor_id    text not null references gestores (id) on delete restrict,
  ciclo_id     text not null references ciclos (id) on delete restrict,
  indicador_id text references indicadores (id) on delete restrict,
  motivo       text not null check (length(trim(motivo)) >= 20),
  aberta_em    timestamptz not null default now(),
  status       status_contestacao not null default 'aberta',
  resposta     text
);

create index contestacoes_gestor_idx on contestacoes (gestor_id);
create index contestacoes_ciclo_idx on contestacoes (ciclo_id);

-- Trilha append-only. O gatilho que impede alteração está na migração 0002:
-- RLS sozinha não bastaria, porque a service role a ignora.
create table eventos_auditoria (
  id        bigserial primary key,
  quando    timestamptz not null default now(),
  autor     text not null,
  perfil    text not null,
  tipo      tipo_evento not null,
  entidade  text not null,
  descricao text not null,
  antes     jsonb,
  depois    jsonb
);

create index eventos_quando_idx on eventos_auditoria (quando desc);
create index eventos_entidade_idx on eventos_auditoria (entidade);
create index eventos_tipo_idx on eventos_auditoria (tipo);

comment on table eventos_auditoria is
  'Append-only: correção entra como novo evento, com o valor anterior preservado.';
