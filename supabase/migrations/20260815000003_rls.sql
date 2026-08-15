-- =============================================================================
-- Prumo — Row Level Security (F3)
--
-- O RBAC do §8.1 vira política de dados, não `if` na aplicação:
--
--   CAM           gere ciclos, indicadores e regras; homologa; vê tudo
--   Área técnica  lança e edita indicadores DA PRÓPRIA ÁREA, no prazo
--   Gestor        vê o PRÓPRIO resultado e abre contestação
--   Auditoria     vê tudo, escreve nada
--
-- Regra geral: negar por padrão. Cada permissão abaixo é uma exceção explícita.
-- A ausência de política de DELETE é intencional — no Prumo nada se apaga.
-- =============================================================================

alter table areas             enable row level security;
alter table gestores          enable row level security;
alter table usuarios          enable row level security;
alter table indicadores       enable row level security;
alter table regras_pontuacao  enable row level security;
alter table ciclos            enable row level security;
alter table lancamentos       enable row level security;
alter table avaliacoes        enable row level security;
alter table contestacoes      enable row level security;
alter table eventos_auditoria enable row level security;

grant usage on schema public to anon, authenticated;
grant usage on schema app to authenticated;

-- GRANT e RLS são camadas diferentes: a política filtra linhas, mas sem o
-- privilégio de tabela o comando nem chega a ser avaliado. Estas tabelas são
-- escritas só pela CAM — quem restringe isso é a política, não o grant.
grant select, insert, update on areas, gestores, indicadores, regras_pontuacao, ciclos
  to authenticated;
grant select, insert, update on lancamentos to authenticated;
grant select, insert, update on avaliacoes to authenticated;
grant select, insert, update on contestacoes to authenticated;
grant select, insert on eventos_auditoria to authenticated;
grant select on usuarios to authenticated;
grant usage on all sequences in schema public to authenticated;

-- -----------------------------------------------------------------------------
-- Cadastros: todo mundo autenticado lê; só a CAM escreve
-- -----------------------------------------------------------------------------

create policy areas_leitura on areas
  for select to authenticated using (true);

create policy areas_escrita on areas
  for all to authenticated using (app.eh_cam()) with check (app.eh_cam());

create policy gestores_leitura on gestores
  for select to authenticated using (true);

create policy gestores_escrita on gestores
  for all to authenticated using (app.eh_cam()) with check (app.eh_cam());

create policy indicadores_leitura on indicadores
  for select to authenticated using (true);

create policy indicadores_escrita on indicadores
  for all to authenticated using (app.eh_cam()) with check (app.eh_cam());

create policy regras_leitura on regras_pontuacao
  for select to authenticated using (true);

-- Insere versão nova, sim; editar a vigente é barrado pelo gatilho `regra_imutavel`.
create policy regras_escrita on regras_pontuacao
  for all to authenticated using (app.eh_cam()) with check (app.eh_cam());

create policy ciclos_leitura on ciclos
  for select to authenticated using (true);

create policy ciclos_escrita on ciclos
  for all to authenticated using (app.eh_cam()) with check (app.eh_cam());

-- -----------------------------------------------------------------------------
-- Usuários: cada um enxerga a própria linha; a CAM enxerga todas
-- -----------------------------------------------------------------------------

-- Sem política de escrita: vincular pessoa a perfil é ato administrativo e
-- passa pela service role, fora do alcance de quem está logado.
create policy usuarios_leitura on usuarios
  for select to authenticated
  using (id = auth.uid() or app.eh_cam());

-- -----------------------------------------------------------------------------
-- Lançamentos
-- -----------------------------------------------------------------------------

create policy lancamentos_leitura on lancamentos
  for select to authenticated
  using (
    app.le_tudo()
    or exists (
      select 1 from indicadores i
      where i.id = lancamentos.indicador_id
        and i.area_id = app.area_atual()
    )
    or exists (
      select 1
      from indicadores i
      join gestores g on g.area_id = i.area_id
      where i.id = lancamentos.indicador_id
        and g.id = app.gestor_atual()
    )
  );

-- A área técnica só lança o que é dela. A janela de prazo é garantida pelo
-- gatilho `lancamento_dentro_da_janela`, que vale inclusive para a service role.
create policy lancamentos_insercao on lancamentos
  for insert to authenticated
  with check (
    app.eh_cam()
    or (
      app.perfil_atual() = 'area_tecnica'
      and exists (
        select 1 from indicadores i
        where i.id = lancamentos.indicador_id
          and i.area_id = app.area_atual()
      )
    )
  );

create policy lancamentos_correcao on lancamentos
  for update to authenticated
  using (
    app.eh_cam()
    or (
      app.perfil_atual() = 'area_tecnica'
      and exists (
        select 1 from indicadores i
        where i.id = lancamentos.indicador_id
          and i.area_id = app.area_atual()
      )
    )
  )
  with check (
    app.eh_cam()
    or (
      app.perfil_atual() = 'area_tecnica'
      and exists (
        select 1 from indicadores i
        where i.id = lancamentos.indicador_id
          and i.area_id = app.area_atual()
      )
    )
  );

-- -----------------------------------------------------------------------------
-- Avaliações: o gestor vê a própria; a área técnica não vê nenhuma
-- -----------------------------------------------------------------------------

create policy avaliacoes_leitura on avaliacoes
  for select to authenticated
  using (app.le_tudo() or gestor_id = app.gestor_atual());

create policy avaliacoes_escrita on avaliacoes
  for all to authenticated using (app.eh_cam()) with check (app.eh_cam());

-- -----------------------------------------------------------------------------
-- Contestações
-- -----------------------------------------------------------------------------

create policy contestacoes_leitura on contestacoes
  for select to authenticated
  using (app.le_tudo() or gestor_id = app.gestor_atual());

create policy contestacoes_abertura on contestacoes
  for insert to authenticated
  with check (
    app.eh_cam()
    or (app.perfil_atual() = 'gestor' and gestor_id = app.gestor_atual())
  );

-- Responder é ato da comissão: o gestor abre, mas não decide o desfecho.
create policy contestacoes_resposta on contestacoes
  for update to authenticated
  using (app.eh_cam()) with check (app.eh_cam());

-- -----------------------------------------------------------------------------
-- Trilha de auditoria
-- -----------------------------------------------------------------------------

create policy eventos_leitura on eventos_auditoria
  for select to authenticated using (app.le_tudo());

-- Qualquer autenticado pode acrescentar (é o que os gatilhos fazem em nome
-- dele). Alterar e apagar não têm política — e o gatilho fecha a porta que a
-- service role deixaria aberta.
create policy eventos_insercao on eventos_auditoria
  for insert to authenticated with check (true);
