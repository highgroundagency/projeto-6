-- =============================================================================
-- Prumo: esquema do banco LIGADO à aplicação (domínio v2, pós-reunião de 22/08)
--
-- É a remodelagem que docs/banco.md declarava pendente (ADR-034): distritos,
-- tipos de unidade, unidades, subindicadores e aplicabilidade na regra
-- versionada. As tabelas espelham os tipos de `src/lib/calculo/tipos.ts`, com
-- a mesma forma de dado, para que o driver só troque camelCase por snake_case.
--
-- O motor de cálculo continua sendo função pura na aplicação: o banco guarda
-- insumo e resultado, não regra de negócio. As invariantes que não podem
-- depender da aplicação lembrar (as quatro travas) estão na 0002.
--
-- Decisões de tipo:
--
-- * Datas e instantes ficam em `text`, no formato que a aplicação já usa
--   (`YYYY-MM-DD`, `YYYY-MM` e ISO 8601 em UTC). Regra da casa: data nunca é
--   `Date`. Guardar como texto devolve exatamente o que entrou, e a comparação
--   lexicográfica continua valendo. Um `check` segura o formato.
-- * Número é `double precision`, o mesmo `number` do JavaScript: o que o motor
--   calculou volta idêntico, sem a conversão de `numeric` para string do `pg`.
-- * Toda tabela tem `ordem` (identidade crescente): a aplicação depende da
--   ordem de inserção em alguns lugares (o último lançamento vence), e SQL sem
--   `order by` não promete ordem nenhuma.
--
-- Nenhum dado real de pessoa ou da SESAU entra aqui. Ver docs/privacidade.md.
-- =============================================================================

create schema if not exists app;

comment on schema app is 'Funções auxiliares do Prumo usadas pelos gatilhos.';

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------

create type estado_ciclo as enum (
  'rascunho',
  'lancamento_aberto',
  'em_validacao',
  'homologado',
  'publicado'
);

create type direcao_indicador as enum ('maior_melhor', 'menor_melhor', 'faixa_ideal');

create type periodicidade_indicador as enum (
  'mensal', 'bimestral', 'trimestral', 'semestral', 'anual'
);

create type tipo_subindicador as enum ('indice', 'razao');

create type escopo_gerente as enum ('unidade', 'distrito');

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
  'lancamento_recusado',
  'avaliacao_calculada',
  'contestacao_aberta',
  'contestacao_respondida'
);

-- Formatos de texto usados como data.
create domain competencia_txt as text check (value ~ '^\d{4}-(0[1-9]|1[0-2])$');
create domain dia_txt as text check (value ~ '^\d{4}-\d{2}-\d{2}$');
create domain instante_txt as text check (value ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$');

-- -----------------------------------------------------------------------------
-- Rede: Secretaria → distrito sanitário → unidade
-- -----------------------------------------------------------------------------

create table distritos (
  id    text primary key,
  nome  text not null,
  ordem bigint generated always as identity unique
);

create table tipos_unidade (
  id    text primary key,
  nome  text not null,
  sigla text not null,
  ordem bigint generated always as identity unique
);

create table unidades (
  id          text primary key,
  nome        text not null,
  distrito_id text not null references distritos (id) on delete restrict,
  tipo_id     text not null references tipos_unidade (id) on delete restrict,
  ordem       bigint generated always as identity unique
);

create index unidades_distrito_idx on unidades (distrito_id);
create index unidades_tipo_idx on unidades (tipo_id);

create table gerentes (
  id          text primary key,
  nome        text not null,
  cargo       text not null,
  escopo      escopo_gerente not null,
  unidade_id  text references unidades (id) on delete restrict,
  distrito_id text references distritos (id) on delete restrict,
  ordem       bigint generated always as identity unique,

  -- O mesmo contrato do tipo `Gerente`: exatamente um dos dois vínculos, e o
  -- certo para o escopo. Duplicar o distrito de quem já tem unidade seria
  -- pedir divergência.
  constraint gerente_vinculo_coerente check (
    (escopo = 'unidade' and unidade_id is not null and distrito_id is null)
    or (escopo = 'distrito' and distrito_id is not null and unidade_id is null)
  )
);

-- -----------------------------------------------------------------------------
-- Catálogo: indicador calculado, subindicador preenchido
-- -----------------------------------------------------------------------------

create table indicadores (
  id             text primary key,
  nome           text not null,
  unidade_medida text not null,
  direcao        direcao_indicador not null,
  fonte          text not null,
  periodicidade  periodicidade_indicador not null,
  ordem          bigint generated always as identity unique
);

create table subindicadores (
  id                 text primary key,
  indicador_id       text not null references indicadores (id) on delete restrict,
  nome               text not null,
  tipo               tipo_subindicador not null,
  rotulo_numerador   text,
  rotulo_denominador text,
  ordem              bigint generated always as identity unique
);

create index subindicadores_indicador_idx on subindicadores (indicador_id);

-- -----------------------------------------------------------------------------
-- Regra de pontuação VERSIONADA
-- -----------------------------------------------------------------------------

-- Alterar cria nova versão, nunca edita a vigente (gatilho na 0002). As réguas
-- ficam em jsonb porque são configuração lida inteira pelo motor: não há
-- consulta por faixa isolada.
create table regras_pontuacao (
  id                  text primary key,
  versao              integer not null unique check (versao > 0),
  descricao           text not null,
  vigente_de          competencia_txt not null,
  vigente_ate         competencia_txt,
  faixas              jsonb not null default '[]'::jsonb,
  pontuacao_maxima    double precision not null check (pontuacao_maxima > 0),
  faixas_gratificacao jsonb not null,
  arredondamento      jsonb not null,
  teto_atingimento    double precision not null check (teto_atingimento > 0),
  sem_lancamento      text not null check (sem_lancamento in ('zera_com_aviso', 'ignora', 'usa_meta')),
  metodo              text check (metodo in ('atingimento', 'notas')),
  graduacoes          jsonb,
  segunda_graduacao   jsonb,
  ordem               bigint generated always as identity unique,

  constraint regra_vigencia_coerente check (vigente_ate is null or vigente_ate >= vigente_de)
);

-- Indicador × tipo de unidade, com a meta e o peso daquela versão da regra.
create table aplicabilidades (
  regra_id        text not null references regras_pontuacao (id) on delete restrict,
  tipo_unidade_id text not null references tipos_unidade (id) on delete restrict,
  indicador_id    text not null references indicadores (id) on delete restrict,
  meta            double precision not null,
  peso            double precision not null check (peso > 0),
  ordem           bigint generated always as identity unique,

  primary key (regra_id, tipo_unidade_id, indicador_id)
);

-- -----------------------------------------------------------------------------
-- Ciclo de avaliação
-- -----------------------------------------------------------------------------

create table ciclos (
  id                       text primary key,
  competencia              competencia_txt not null unique,
  estado                   estado_ciclo not null default 'rascunho',
  janela_lancamento_inicio instante_txt not null,
  janela_lancamento_fim    instante_txt not null,
  revisao_inicio           dia_txt not null,
  regra_id                 text not null references regras_pontuacao (id) on delete restrict,
  ordem                    bigint generated always as identity unique,

  constraint ciclo_janela_coerente check (janela_lancamento_fim > janela_lancamento_inicio)
);

create index ciclos_estado_idx on ciclos (estado);

-- -----------------------------------------------------------------------------
-- Movimento
-- -----------------------------------------------------------------------------

create sequence lancamentos_id_seq;

-- Correção não sobrescreve: entra uma linha nova, e o último registrado vence.
create table lancamentos (
  id             text primary key default ('lanc-db-' || lpad(nextval('lancamentos_id_seq')::text, 6, '0')),
  subindicador_id text not null references subindicadores (id) on delete restrict,
  unidade_id     text not null references unidades (id) on delete restrict,
  ciclo_id       text not null references ciclos (id) on delete restrict,
  valor          double precision check (valor >= 0),
  numerador      double precision check (numerador >= 0),
  denominador    double precision check (denominador >= 0),
  evidencia      text not null check (length(trim(evidencia)) >= 5),
  autor          text not null,
  registrado_em  instante_txt not null,
  status         status_lancamento not null default 'enviado',
  ordem          bigint generated always as identity unique,

  -- 'indice' preenche valor; 'razao', numerador e denominador. Um dos dois.
  constraint lancamento_tem_numero check (
    valor is not null or (numerador is not null and denominador is not null)
  )
);

create index lancamentos_ciclo_idx on lancamentos (ciclo_id);
create index lancamentos_vigente_idx on lancamentos (ciclo_id, subindicador_id, unidade_id, ordem desc);

-- A nota de uma unidade num ciclo. A memória de cálculo é o produto: guarda
-- cada passo que levou ao score.
create table avaliacoes (
  unidade_id   text not null references unidades (id) on delete restrict,
  ciclo_id     text not null references ciclos (id) on delete restrict,
  score        double precision not null check (score >= 0 and score <= 100),
  faixa        jsonb,
  memoria      jsonb not null,
  avisos       jsonb not null default '[]'::jsonb,
  regra_id     text not null references regras_pontuacao (id) on delete restrict,
  versao_regra integer not null,
  ordem        bigint generated always as identity unique,

  primary key (unidade_id, ciclo_id)
);

create index avaliacoes_ciclo_idx on avaliacoes (ciclo_id);

create table avaliacoes_distritais (
  distrito_id text not null references distritos (id) on delete restrict,
  ciclo_id    text not null references ciclos (id) on delete restrict,
  score       double precision not null check (score >= 0 and score <= 100),
  faixa       jsonb,
  por_unidade jsonb not null,
  avisos      jsonb not null default '[]'::jsonb,
  ordem       bigint generated always as identity unique,

  primary key (distrito_id, ciclo_id)
);

create index avaliacoes_distritais_ciclo_idx on avaliacoes_distritais (ciclo_id);

create sequence contestacoes_id_seq;

create table contestacoes (
  id           text primary key default ('cont-db-' || lpad(nextval('contestacoes_id_seq')::text, 6, '0')),
  gerente_id   text not null references gerentes (id) on delete restrict,
  ciclo_id     text not null references ciclos (id) on delete restrict,
  indicador_id text references indicadores (id) on delete restrict,
  motivo       text not null check (length(trim(motivo)) >= 5),
  aberta_em    instante_txt not null,
  status       status_contestacao not null default 'aberta',
  resposta     text,
  ordem        bigint generated always as identity unique
);

create index contestacoes_gerente_idx on contestacoes (gerente_id);

-- Trilha append-only. O gatilho que impede alteração está na 0002.
create table eventos_auditoria (
  id        text primary key,
  seq       bigserial unique,
  quando    instante_txt not null,
  autor     text not null,
  perfil    text not null,
  tipo      tipo_evento not null,
  entidade  text not null,
  descricao text not null,
  antes     jsonb,
  depois    jsonb
);

create index eventos_seq_idx on eventos_auditoria (seq desc);
create index eventos_tipo_idx on eventos_auditoria (tipo);

comment on table eventos_auditoria is
  'Append-only: correção entra como novo evento, com o valor anterior preservado.';
