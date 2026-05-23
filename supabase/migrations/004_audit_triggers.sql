-- Database-level audit triggers for sensitive governance tables

create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_scope_key text;
begin
  if tg_table_name = 'user_role_assignments' then
    v_scope_key := (
      select s.key from public.resource_scopes s
      where s.id = coalesce(new.scope_id, old.scope_id)
    );
  elsif tg_table_name = 'rd_evidence_records' then
    v_scope_key := (
      select s.key
      from public.rd_projects rp
      join public.resource_scopes s on s.id = rp.scope_id
      where rp.id = coalesce(new.rd_project_id, old.rd_project_id)
    );
  elsif tg_table_name = 'approval_requests' then
    v_scope_key := (
      select s.key from public.resource_scopes s
      where s.id = coalesce(new.scope_id, old.scope_id)
    );
  end if;

  if tg_op = 'INSERT' then
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, scope_key, after_state)
    values (auth.uid(), lower(tg_op), tg_table_name, new.id::text, v_scope_key, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, scope_key, before_state, after_state)
    values (auth.uid(), lower(tg_op), tg_table_name, new.id::text, v_scope_key, to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, scope_key, before_state)
    values (auth.uid(), lower(tg_op), tg_table_name, old.id::text, v_scope_key, to_jsonb(old));
    return old;
  end if;

  return null;
end;
$$;

create trigger audit_user_role_assignments
  after insert or update or delete on public.user_role_assignments
  for each row execute function public.audit_trigger();

create trigger audit_approval_requests
  after insert or update or delete on public.approval_requests
  for each row execute function public.audit_trigger();

create trigger audit_rd_evidence_records
  after insert or update or delete on public.rd_evidence_records
  for each row execute function public.audit_trigger();

-- Application-level audit helper (server actions / route handlers)
create or replace function public.write_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_scope_key text default null,
  p_before_state jsonb default null,
  p_after_state jsonb default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, scope_key, before_state, after_state
  )
  values (
    auth.uid(), p_action, p_entity_type, p_entity_id, p_scope_key, p_before_state, p_after_state
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.write_audit_log(text, text, text, text, jsonb, jsonb) to authenticated;

-- Founder bootstrap (run once via service role after first sign-up)
create or replace function public.bootstrap_founder(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_id bigint;
  v_scope_id bigint;
begin
  select id into v_role_id from public.roles where key = 'founder_admin';
  select id into v_scope_id from public.resource_scopes where key = 'org-global';

  insert into public.user_role_assignments (user_id, role_id, scope_id, assigned_by)
  values (p_user_id, v_role_id, v_scope_id, p_user_id)
  on conflict (user_id, role_id, scope_id) do nothing;
end;
$$;

revoke all on function public.bootstrap_founder(uuid) from public;
grant execute on function public.bootstrap_founder(uuid) to service_role;

create or replace function public.assign_role_for_scope(
  p_user_id uuid,
  p_role_key text,
  p_scope_key text,
  p_assigned_by uuid
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_id bigint;
  v_scope_id bigint;
  v_assignment_id bigint;
begin
  if not (
    public.is_founder_admin(p_assigned_by)
    or public.user_has_permission_for_scope(p_assigned_by, 'manage_access', 'org-global')
  ) then
    raise exception 'Forbidden';
  end if;

  select id into v_role_id from public.roles where key = p_role_key;
  select id into v_scope_id from public.resource_scopes where key = p_scope_key;

  insert into public.user_role_assignments (user_id, role_id, scope_id, assigned_by)
  values (p_user_id, v_role_id, v_scope_id, p_assigned_by)
  on conflict (user_id, role_id, scope_id) do update set assigned_by = excluded.assigned_by
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

grant execute on function public.assign_role_for_scope(uuid, text, text, uuid) to authenticated;
