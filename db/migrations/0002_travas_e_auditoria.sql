-- =============================================================================
-- Prumo: as quatro travas e a trilha de auditoria escrita pelo próprio banco
--
-- O que está aqui NÃO é regra de cálculo: é invariante estrutural. Coisas que
-- não podem depender da aplicação lembrar de checar, porque um script de
-- manutenção, um psql aberto ou uma segunda aplicação passariam por cima.
-- São gatilhos, e não permissões, justamente para valer também para o dono do
-- banco.
--
--   1. trilha_append_only           evento de auditoria não se altera nem se apaga
--   2. ciclo_transicao_valida       o ciclo avança um estado por vez e não volta
--   3. lancamento_dentro_da_janela  lançamento fora do prazo é recusado
--   4. regra_imutavel               regra publicada não se edita; muda-se de versão
--
-- QUEM e QUANDO. A aplicação diz ao banco quem está escrevendo e que horas são
-- com `set_config('app.autor' | 'app.perfil' | 'app.agora', ..., true)` dentro
-- da transação (ver `src/lib/dados/driver-postgres.ts`). O "agora" vem da
-- aplicação, como manda a regra da casa: o relógio é injetado. Sem esses
-- valores (um psql manual), o evento sai como 'sistema' e com a hora do banco.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Contexto da escrita
-- -----------------------------------------------------------------------------

create or replace function app.contexto(chave text, padrao text)
returns text
language sql
stable
as $$
  select coalesce(nullif(current_setting('app.' || chave, true), ''), padrao);
$$;

create or replace function app.agora()
returns text
language sql
stable
as $$
  select app.contexto(
    'agora',
    to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
$$;

/** O mesmo rótulo de `ROTULO_ESTADO` em src/lib/calculo/tipos.ts. */
create or replace function app.rotulo_estado(estado estado_ciclo)
returns text
language sql
immutable
as $$
  select case estado
    when 'rascunho'          then 'Rascunho'
    when 'lancamento_aberto' then 'Lançamento aberto'
    when 'em_validacao'      then 'Em validação'
    when 'homologado'        then 'Homologado'
    when 'publicado'         then 'Publicado'
  end;
$$;

-- -----------------------------------------------------------------------------
-- Trava 1: trilha de auditoria append-only
-- -----------------------------------------------------------------------------

create or replace function app.impedir_alteracao_da_trilha()
returns trigger
language plpgsql
as $$
begin
  raise exception
    'A trilha de auditoria é append-only: eventos não podem ser alterados nem apagados.'
    using errcode = 'restrict_violation';
end;
$$;

create trigger trilha_append_only
  before update or delete on eventos_auditoria
  for each row execute function app.impedir_alteracao_da_trilha();

-- TRUNCATE não dispara gatilho de linha: sem este, `truncate` apagaria tudo.
create trigger trilha_sem_truncate
  before truncate on eventos_auditoria
  for each statement execute function app.impedir_alteracao_da_trilha();

/** Único caminho de escrita na trilha. Devolve o id do evento criado. */
create or replace function app.registrar_evento(
  p_tipo      tipo_evento,
  p_entidade  text,
  p_descricao text,
  p_antes     jsonb,
  p_depois    jsonb
)
returns text
language plpgsql
as $$
declare
  v_seq bigint := nextval(pg_get_serial_sequence('eventos_auditoria', 'seq'));
  v_id  text   := 'ev-db-' || lpad(v_seq::text, 6, '0');
begin
  insert into eventos_auditoria (id, seq, quando, autor, perfil, tipo, entidade, descricao, antes, depois)
  values (
    v_id,
    v_seq,
    app.agora(),
    app.contexto('autor', 'sistema'),
    app.contexto('perfil', 'sistema'),
    p_tipo,
    p_entidade,
    p_descricao,
    p_antes,
    p_depois
  );
  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Trava 2: máquina de estados do ciclo
-- -----------------------------------------------------------------------------

/**
 * O ciclo avança um estado por vez, na ordem do enum, e nunca volta.
 *
 * Voltar de "homologado" para "lançamento aberto" permitiria reabrir um
 * resultado já publicado sem deixar rastro: exatamente o que a planilha
 * permite hoje e que este projeto existe para impedir.
 */
create or replace function app.validar_transicao_ciclo()
returns trigger
language plpgsql
as $$
declare
  posicao_atual  integer;
  posicao_futura integer;
begin
  if new.estado = old.estado then
    return new;
  end if;

  posicao_atual  := array_position(enum_range(null::estado_ciclo), old.estado);
  posicao_futura := array_position(enum_range(null::estado_ciclo), new.estado);

  if posicao_futura <> posicao_atual + 1 then
    raise exception
      'Transição de ciclo inválida: % → %. O ciclo avança um estado por vez e não volta.',
      old.estado, new.estado
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger ciclo_transicao_valida
  before update of estado on ciclos
  for each row execute function app.validar_transicao_ciclo();

-- O resto do ciclo (competência, janela, regra) não muda depois de criado.
create or replace function app.impedir_edicao_do_ciclo()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
     or new.competencia is distinct from old.competencia
     or new.janela_lancamento_inicio is distinct from old.janela_lancamento_inicio
     or new.janela_lancamento_fim is distinct from old.janela_lancamento_fim
     or new.revisao_inicio is distinct from old.revisao_inicio
     or new.regra_id is distinct from old.regra_id then
    raise exception 'Ciclo %: só o estado muda depois de criado.', old.id
      using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

create trigger ciclo_so_muda_estado
  before update on ciclos
  for each row execute function app.impedir_edicao_do_ciclo();

create or replace function app.registrar_transicao_ciclo()
returns trigger
language plpgsql
as $$
begin
  if new.estado is distinct from old.estado then
    perform app.registrar_evento(
      'ciclo_estado_alterado',
      new.id,
      format('Ciclo %s: %s → %s.', new.competencia,
             app.rotulo_estado(old.estado), app.rotulo_estado(new.estado)),
      jsonb_build_object('estado', old.estado),
      jsonb_build_object('estado', new.estado)
    );
  end if;
  return new;
end;
$$;

create trigger ciclo_transicao_auditada
  after update of estado on ciclos
  for each row execute function app.registrar_transicao_ciclo();

create or replace function app.registrar_criacao_ciclo()
returns trigger
language plpgsql
as $$
begin
  perform app.registrar_evento(
    'ciclo_criado',
    new.id,
    format('Ciclo da competência %s criado com a regra %s.', new.competencia, new.regra_id),
    null,
    jsonb_build_object('competencia', new.competencia, 'estado', new.estado, 'regraId', new.regra_id)
  );
  return new;
end;
$$;

create trigger ciclo_criacao_auditada
  after insert on ciclos
  for each row execute function app.registrar_criacao_ciclo();

-- -----------------------------------------------------------------------------
-- Trava 3: janela de lançamento
-- -----------------------------------------------------------------------------

/**
 * Lançamento só entra com o ciclo em "lançamento aberto".
 *
 * A aplicação já checa isso (e registra a tentativa recusada), mas a regra
 * vale para qualquer caminho de escrita.
 */
create or replace function app.exigir_janela_aberta()
returns trigger
language plpgsql
as $$
declare
  estado_do_ciclo estado_ciclo;
begin
  select estado into estado_do_ciclo from ciclos where id = new.ciclo_id;

  if estado_do_ciclo is null then
    raise exception 'Ciclo % não existe.', new.ciclo_id using errcode = 'foreign_key_violation';
  end if;

  if estado_do_ciclo <> 'lancamento_aberto' then
    raise exception
      'Ciclo % está em "%": a janela de lançamento não está aberta.',
      new.ciclo_id, app.rotulo_estado(estado_do_ciclo)
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger lancamento_dentro_da_janela
  before insert or update on lancamentos
  for each row execute function app.exigir_janela_aberta();

-- Lançamento não se apaga: correção é linha nova, e o antigo fica na trilha.
create or replace function app.impedir_remocao()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Em %, nada se apaga: correção entra como registro novo.', tg_table_name
    using errcode = 'restrict_violation';
end;
$$;

create trigger lancamento_sem_remocao
  before delete on lancamentos
  for each row execute function app.impedir_remocao();

create or replace function app.registrar_lancamento()
returns trigger
language plpgsql
as $$
declare
  anterior lancamentos;
begin
  -- O "antes" do diff é o lançamento VIGENTE (o último), não o primeiro: numa
  -- segunda correção, comparar com o original mentiria sobre o que mudou.
  select * into anterior
  from lancamentos
  where ciclo_id = new.ciclo_id
    and subindicador_id = new.subindicador_id
    and unidade_id = new.unidade_id
    and id <> new.id
  order by ordem desc
  limit 1;

  perform app.registrar_evento(
    (case when anterior.id is null then 'lancamento_registrado'
          else 'lancamento_alterado' end)::tipo_evento,
    new.id,
    format('%s de %s pela %s no ciclo %s.',
           case when anterior.id is null then 'Lançamento' else 'Correção' end,
           new.subindicador_id, new.unidade_id, new.ciclo_id),
    case when anterior.id is null then null
         else jsonb_build_object(
           'valor', anterior.valor,
           'numerador', anterior.numerador,
           'denominador', anterior.denominador,
           'status', anterior.status)
    end,
    jsonb_build_object(
      'valor', new.valor,
      'numerador', new.numerador,
      'denominador', new.denominador,
      'status', new.status)
  );

  return new;
end;
$$;

create trigger lancamento_auditado
  after insert on lancamentos
  for each row execute function app.registrar_lancamento();

-- -----------------------------------------------------------------------------
-- Contestações
-- -----------------------------------------------------------------------------

create or replace function app.registrar_contestacao()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform app.registrar_evento(
      'contestacao_aberta',
      new.id,
      format('Contestação aberta por %s sobre o ciclo %s.', new.gerente_id, new.ciclo_id),
      null,
      jsonb_build_object('status', new.status, 'indicadorId', new.indicador_id)
    );
  elsif new.status is distinct from old.status then
    perform app.registrar_evento(
      'contestacao_respondida',
      new.id,
      format('Contestação %s: %s → %s.', new.id, old.status, new.status),
      jsonb_build_object('status', old.status, 'resposta', old.resposta),
      jsonb_build_object('status', new.status, 'resposta', new.resposta)
    );
  end if;
  return new;
end;
$$;

create trigger contestacao_auditada
  after insert or update on contestacoes
  for each row execute function app.registrar_contestacao();

-- -----------------------------------------------------------------------------
-- Trava 4: regra publicada é imutável
-- -----------------------------------------------------------------------------

/**
 * Mudou a portaria? Cria-se uma versão nova, com vigência futura. Editar a
 * vigente faria um ciclo já homologado passar a devolver outro número.
 *
 * A única mudança aceita é encerrar a vigência (preencher `vigente_ate`
 * uma vez), que é o que acontece quando a versão seguinte é publicada.
 */
create or replace function app.impedir_edicao_de_regra()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
     or new.versao is distinct from old.versao
     or new.descricao is distinct from old.descricao
     or new.vigente_de is distinct from old.vigente_de
     or new.faixas is distinct from old.faixas
     or new.pontuacao_maxima is distinct from old.pontuacao_maxima
     or new.faixas_gratificacao is distinct from old.faixas_gratificacao
     or new.arredondamento is distinct from old.arredondamento
     or new.teto_atingimento is distinct from old.teto_atingimento
     or new.sem_lancamento is distinct from old.sem_lancamento
     or new.metodo is distinct from old.metodo
     or new.graduacoes is distinct from old.graduacoes
     or new.segunda_graduacao is distinct from old.segunda_graduacao
     or (old.vigente_ate is not null and new.vigente_ate is distinct from old.vigente_ate) then
    raise exception
      'Regra % é imutável: crie uma nova versão em vez de editar esta.', old.id
      using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

create trigger regra_imutavel
  before update on regras_pontuacao
  for each row execute function app.impedir_edicao_de_regra();

create trigger regra_sem_remocao
  before delete on regras_pontuacao
  for each row execute function app.impedir_remocao();

/**
 * A aplicabilidade (meta e peso por tipo de unidade) é parte da regra, então
 * vale a mesma trava: não se edita, não se apaga, e não se acrescenta depois
 * que algum ciclo já saiu do rascunho usando aquela regra.
 */
create or replace function app.proteger_aplicabilidade()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    raise exception
      'Aplicabilidade da regra % é imutável: crie uma nova versão da regra.', old.regra_id
      using errcode = 'restrict_violation';
  end if;

  if exists (
    select 1 from ciclos where regra_id = new.regra_id and estado <> 'rascunho'
  ) then
    raise exception
      'Regra % já está em uso: aplicabilidade nova exige uma nova versão.', new.regra_id
      using errcode = 'restrict_violation';
  end if;

  return new;
end;
$$;

create trigger aplicabilidade_imutavel
  before insert or update or delete on aplicabilidades
  for each row execute function app.proteger_aplicabilidade();

create or replace function app.registrar_versao_de_regra()
returns trigger
language plpgsql
as $$
begin
  perform app.registrar_evento(
    'regra_versionada',
    new.id,
    format('Regra de pontuação v%s publicada com vigência a partir de %s.', new.versao, new.vigente_de),
    null,
    jsonb_build_object('versao', new.versao, 'vigenteDe', new.vigente_de)
  );
  return new;
end;
$$;

create trigger regra_versionada_auditada
  after insert on regras_pontuacao
  for each row execute function app.registrar_versao_de_regra();

-- -----------------------------------------------------------------------------
-- Avaliação é resultado de ciclo fechado
-- -----------------------------------------------------------------------------

create or replace function app.exigir_ciclo_homologado()
returns trigger
language plpgsql
as $$
declare
  estado_do_ciclo estado_ciclo;
begin
  select estado into estado_do_ciclo from ciclos where id = new.ciclo_id;
  if estado_do_ciclo not in ('homologado', 'publicado') then
    raise exception
      'Ciclo % está em "%": nota só existe para ciclo homologado.',
      new.ciclo_id, app.rotulo_estado(estado_do_ciclo)
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger avaliacao_de_ciclo_fechado
  before insert or update on avaliacoes
  for each row execute function app.exigir_ciclo_homologado();

create trigger avaliacao_distrital_de_ciclo_fechado
  before insert or update on avaliacoes_distritais
  for each row execute function app.exigir_ciclo_homologado();
