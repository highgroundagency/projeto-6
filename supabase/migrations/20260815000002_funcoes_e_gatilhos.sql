-- =============================================================================
-- Prumo — funções auxiliares e invariantes de negócio no banco (F3)
--
-- O que está aqui NÃO é regra de cálculo: é invariante estrutural. Coisas que
-- não podem depender da aplicação lembrar de checar, porque uma segunda
-- aplicação, um script de manutenção ou a service role passariam por cima.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Identidade do usuário atual
-- -----------------------------------------------------------------------------

-- Perfil de quem está na requisição. `security definer` porque a função lê a
-- tabela `usuarios`, que é justamente protegida pelas políticas que a chamam —
-- sem isso, a checagem entraria em recursão.
create or replace function app.usuario_atual()
returns usuarios
language sql
stable
security definer
set search_path = public, app
as $$
  select * from usuarios where id = auth.uid();
$$;

create or replace function app.perfil_atual()
returns perfil_usuario
language sql
stable
security definer
set search_path = public, app
as $$
  select perfil from usuarios where id = auth.uid();
$$;

create or replace function app.area_atual()
returns text
language sql
stable
security definer
set search_path = public, app
as $$
  select area_id from usuarios where id = auth.uid();
$$;

create or replace function app.gestor_atual()
returns text
language sql
stable
security definer
set search_path = public, app
as $$
  select gestor_id from usuarios where id = auth.uid();
$$;

create or replace function app.eh_cam()
returns boolean
language sql
stable
as $$ select app.perfil_atual() = 'cam'; $$;

/** Quem pode ler tudo: a comissão e a auditoria. */
create or replace function app.le_tudo()
returns boolean
language sql
stable
as $$ select app.perfil_atual() in ('cam', 'auditoria'); $$;

/** Identificação legível para a trilha de auditoria. */
create or replace function app.autor_atual()
returns text
language sql
stable
security definer
set search_path = public, app
as $$
  select coalesce(
    (select nome from usuarios where id = auth.uid()),
    'sistema'
  );
$$;

-- -----------------------------------------------------------------------------
-- Trilha de auditoria: append-only de verdade
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

-- Gatilho, e não apenas RLS: a service role ignora RLS, mas não ignora gatilho.
create trigger trilha_append_only
  before update or delete on eventos_auditoria
  for each row execute function app.impedir_alteracao_da_trilha();

create or replace function app.registrar_evento(
  p_tipo      tipo_evento,
  p_entidade  text,
  p_descricao text,
  p_antes     jsonb,
  p_depois    jsonb
)
returns void
language sql
security definer
set search_path = public, app
as $$
  insert into eventos_auditoria (autor, perfil, tipo, entidade, descricao, antes, depois)
  values (
    app.autor_atual(),
    coalesce(app.perfil_atual()::text, 'sistema'),
    p_tipo,
    p_entidade,
    p_descricao,
    p_antes,
    p_depois
  );
$$;

-- -----------------------------------------------------------------------------
-- Máquina de estados do ciclo
-- -----------------------------------------------------------------------------

/**
 * O ciclo avança um estado por vez, na ordem do enum, e nunca volta.
 *
 * Voltar de "homologado" para "lançamento aberto" permitiria reabrir um
 * resultado já publicado sem deixar rastro na estrutura — exatamente o tipo de
 * coisa que a planilha permite hoje e que este projeto existe para impedir.
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

create or replace function app.registrar_transicao_ciclo()
returns trigger
language plpgsql
security definer
set search_path = public, app
as $$
begin
  if new.estado is distinct from old.estado then
    perform app.registrar_evento(
      'ciclo_estado_alterado',
      new.id,
      format('Ciclo %s: %s → %s.', new.competencia, old.estado, new.estado),
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
security definer
set search_path = public, app
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
-- Janela de lançamento
-- -----------------------------------------------------------------------------

/**
 * Lançamento só entra com o ciclo em "lançamento aberto".
 *
 * A aplicação já checa isso, mas a regra vale para qualquer caminho de escrita —
 * inclusive um script rodando com a service role, que ignora RLS.
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
      new.ciclo_id, estado_do_ciclo
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger lancamento_dentro_da_janela
  before insert or update on lancamentos
  for each row execute function app.exigir_janela_aberta();

create or replace function app.registrar_lancamento()
returns trigger
language plpgsql
security definer
set search_path = public, app
as $$
declare
  anterior lancamentos;
begin
  -- Correção não sobrescreve: o valor anterior fica na trilha.
  select * into anterior
  from lancamentos
  where ciclo_id = new.ciclo_id
    and indicador_id = new.indicador_id
    and id <> new.id
  order by registrado_em desc
  limit 1;

  perform app.registrar_evento(
    -- O cast é obrigatório: um CASE entre dois literais resolve para `text`, e
    -- a função espera `tipo_evento`.
    (case
       when anterior.id is null then 'lancamento_registrado'
       else 'lancamento_alterado'
     end)::tipo_evento,
    new.id::text,
    format(
      '%s de %s no ciclo %s.',
      case when anterior.id is null then 'Lançamento' else 'Correção' end,
      new.indicador_id,
      new.ciclo_id
    ),
    case
      when anterior.id is null then null
      else jsonb_build_object('valor', anterior.valor, 'status', anterior.status)
    end,
    jsonb_build_object('valor', new.valor, 'status', new.status)
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
security definer
set search_path = public, app
as $$
begin
  if tg_op = 'INSERT' then
    perform app.registrar_evento(
      'contestacao_aberta',
      new.id::text,
      format('Contestação aberta pelo gestor %s no ciclo %s.', new.gestor_id, new.ciclo_id),
      null,
      jsonb_build_object('status', new.status)
    );
  elsif new.status is distinct from old.status then
    perform app.registrar_evento(
      'contestacao_respondida',
      new.id::text,
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
-- Regras versionadas
-- -----------------------------------------------------------------------------

/**
 * As faixas de uma regra são imutáveis depois de criadas.
 *
 * Mudou a portaria? Cria-se uma versão nova, com vigência futura. Editar a
 * vigente faria um ciclo já homologado passar a devolver outro número.
 */
create or replace function app.impedir_edicao_de_regra_vigente()
returns trigger
language plpgsql
as $$
begin
  if new.faixas is distinct from old.faixas
     or new.faixas_gratificacao is distinct from old.faixas_gratificacao
     or new.pontuacao_maxima is distinct from old.pontuacao_maxima
     or new.teto_atingimento is distinct from old.teto_atingimento
     or new.arredondamento is distinct from old.arredondamento then
    raise exception
      'Regra % é imutável: crie uma nova versão em vez de editar esta.', old.id
      using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

create trigger regra_imutavel
  before update on regras_pontuacao
  for each row execute function app.impedir_edicao_de_regra_vigente();

create or replace function app.registrar_versao_de_regra()
returns trigger
language plpgsql
security definer
set search_path = public, app
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
