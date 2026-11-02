-- =============================================================================
-- Prumo: contas de acesso ao /sistema
--
-- Quem lança, contesta e avança etapa passa a entrar com login e senha. Sem
-- login, o sistema é só leitura (ADR-051).
--
-- O QUE NÃO ENTRA AQUI, por regra da casa (LGPD, regra 1 do CLAUDE.md): nome,
-- e-mail, CPF ou matrícula. A conta é um LOGIN técnico (ex.: `seab`,
-- `ger-usf-canario`) ligado a um PAPEL e, para gerente, ao cadastro de
-- `gerentes`, que já é sintético. Quem é a pessoa por trás do login é assunto
-- da Secretaria, fora do sistema.
--
-- A SENHA nunca é guardada, nem cifrada: só o hash scrypt com sal
-- (`src/lib/auth/cripto.ts`). O banco confere o formato para que um texto
-- puro não entre nem por engano.
-- =============================================================================

create sequence usuarios_id_seq;

create table usuarios (
  id               text primary key default ('usr-' || lpad(nextval('usuarios_id_seq')::text, 4, '0')),
  -- Minúsculas, sem espaço: é identificador, não nome de gente.
  login            text not null unique check (login ~ '^[a-z0-9][a-z0-9._-]{2,59}$'),
  senha_hash       text not null check (senha_hash ~ '^scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$'),
  perfil           text not null check (perfil in ('seab', 'administrador', 'gerente_distrital', 'gerente_unidade')),
  gerente_id       text references gerentes (id) on delete restrict,
  ativo            boolean not null default true,
  -- Sobe a cada troca de senha ou desativação: as sessões abertas antes param
  -- de valer na hora, porque o cookie carrega a versão em que foi emitido.
  versao_sessao    integer not null default 1 check (versao_sessao > 0),
  -- Bloqueio por tentativas: cinco senhas erradas seguidas travam a conta por
  -- 15 minutos. Fica no banco, e não na memória do servidor, para valer entre
  -- instâncias e sobreviver a reinício.
  falhas_seguidas  integer not null default 0 check (falhas_seguidas >= 0),
  bloqueado_ate    timestamptz,
  criado_em        timestamptz not null default now(),
  senha_trocada_em timestamptz not null default now(),
  ultimo_acesso_em timestamptz,

  -- Gerente sem vínculo não teria o que lançar; SEAB com vínculo seria
  -- privilégio misturado. O banco recusa os dois.
  constraint usuario_vinculo_coerente check (
    (perfil in ('gerente_unidade', 'gerente_distrital')) = (gerente_id is not null)
  )
);

create unique index usuarios_um_por_gerente on usuarios (gerente_id) where gerente_id is not null and ativo;

comment on column usuarios.senha_hash is 'Hash scrypt com sal. Nunca a senha, nem cifrada.';

/**
 * O papel da conta tem de bater com o escopo do gerente: gerente de unidade
 * aponta para um gerente de escopo 'unidade', e o distrital, 'distrito'. Sem
 * isto, uma conta de unidade ligada ao gerente distrital lançaria por todas as
 * unidades do distrito.
 */
create or replace function app.conferir_vinculo_do_usuario()
returns trigger
language plpgsql
as $$
declare
  escopo_do_gerente escopo_gerente;
begin
  if new.gerente_id is null then
    return new;
  end if;
  select escopo into escopo_do_gerente from gerentes where id = new.gerente_id;
  if (new.perfil = 'gerente_unidade' and escopo_do_gerente <> 'unidade')
     or (new.perfil = 'gerente_distrital' and escopo_do_gerente <> 'distrito') then
    raise exception
      'Conta % (%) não combina com o gerente % (escopo %).',
      new.login, new.perfil, new.gerente_id, escopo_do_gerente
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger usuario_vinculo_valido
  before insert or update of perfil, gerente_id on usuarios
  for each row execute function app.conferir_vinculo_do_usuario();
