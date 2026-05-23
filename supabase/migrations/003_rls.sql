-- Helper functions, JWT claims hook, and Row Level Security

create or replace function public.user_has_permission_for_scope(
  p_user_id uuid,
  p_permission_key text,
  p_scope_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.permissions p on p.id = rp.permission_id
    join public.resource_scopes s on s.id = ura.scope_id
    where ura.user_id = p_user_id
      and p.key = p_permission_key
      and s.key = p_scope_key
  );
$$;

create or replace function public.is_founder_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    join public.resource_scopes s on s.id = ura.scope_id
    where ura.user_id = p_user_id
      and r.key = 'founder_admin'
      and s.key = 'org-global'
  );
$$;

-- UI helper: list effective permissions for signed-in user
create or replace function public.my_permissions()
returns table (permission_key text, scope_key text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.key, s.key
  from public.user_role_assignments ura
  join public.role_permissions rp on rp.role_id = ura.role_id
  join public.permissions p on p.id = rp.permission_id
  join public.resource_scopes s on s.id = ura.scope_id
  where ura.user_id = auth.uid()

  union

  select p.key, s.key
  from public.permissions p
  cross join public.resource_scopes s
  where public.is_founder_admin(auth.uid());
$$;

-- Custom Access Token Hook — enable in Supabase Dashboard → Auth → Hooks
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  user_role text;
  staff_flag boolean;
  staff_status text;
  v_user_id uuid;
begin
  v_user_id := (event ->> 'user_id')::uuid;
  claims := event -> 'claims';

  select pr.status into staff_status from public.profiles pr where pr.id = v_user_id;

  select
    coalesce(
      (
        select r.key
        from public.user_role_assignments ura
        join public.roles r on r.id = ura.role_id
        join public.resource_scopes s on s.id = ura.scope_id
        where ura.user_id = v_user_id and s.key = 'org-global'
        order by ura.id asc
        limit 1
      ),
      'user'
    ),
    exists (select 1 from public.user_role_assignments ura where ura.user_id = v_user_id)
  into user_role, staff_flag;

  claims := jsonb_set(claims, '{org_role}', to_jsonb(user_role), true);
  claims := jsonb_set(claims, '{is_staff}', to_jsonb(staff_flag), true);
  claims := jsonb_set(claims, '{staff_status}', to_jsonb(coalesce(staff_status, 'inactive')), true);
  claims := jsonb_set(claims, '{founder_access}', to_jsonb(public.is_founder_admin(v_user_id)), true);

  return jsonb_build_object('claims', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

grant execute on function public.user_has_permission_for_scope(uuid, text, text) to authenticated;
grant execute on function public.is_founder_admin(uuid) to authenticated;
grant execute on function public.my_permissions() to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.approval_requests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rd_projects enable row level security;
alter table public.rd_evidence_records enable row level security;

create policy "profiles read own or founder"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_founder_admin(auth.uid()));

create policy "founder or access admin can manage role assignments"
  on public.user_role_assignments
  for all
  to authenticated
  using (
    public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(auth.uid(), 'manage_access', 'org-global')
  )
  with check (
    public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(auth.uid(), 'manage_access', 'org-global')
  );

create policy "assignments visible to self or access admin"
  on public.user_role_assignments
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(auth.uid(), 'manage_access', 'org-global')
    or public.user_has_permission_for_scope(auth.uid(), 'view_audit_logs', 'org-global')
  );

create policy "approval requests visible to involved staff"
  on public.approval_requests
  for select
  to authenticated
  using (
    requested_by = auth.uid()
    or public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(auth.uid(), 'view_audit_logs', 'org-global')
  );

create policy "authorized staff can view rd projects"
  on public.rd_projects
  for select
  to authenticated
  using (
    public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(
      auth.uid(),
      'create_rd_record',
      (select s.key from public.resource_scopes s where s.id = rd_projects.scope_id)
    )
    or public.user_has_permission_for_scope(
      auth.uid(),
      'approve_rd_record',
      (select s.key from public.resource_scopes s where s.id = rd_projects.scope_id)
    )
  );

create policy "authorized staff can insert rd evidence"
  on public.rd_evidence_records
  for insert
  to authenticated
  with check (
    recorded_by = auth.uid()
    and (
      public.is_founder_admin(auth.uid())
      or public.user_has_permission_for_scope(
        auth.uid(),
        'create_rd_record',
        (
          select s.key
          from public.rd_projects rp
          join public.resource_scopes s on s.id = rp.scope_id
          where rp.id = rd_evidence_records.rd_project_id
        )
      )
    )
  );

create policy "authorized staff can read rd evidence"
  on public.rd_evidence_records
  for select
  to authenticated
  using (
    public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(
      auth.uid(),
      'create_rd_record',
      (
        select s.key
        from public.rd_projects rp
        join public.resource_scopes s on s.id = rp.scope_id
        where rp.id = rd_evidence_records.rd_project_id
      )
    )
    or public.user_has_permission_for_scope(
      auth.uid(),
      'approve_rd_record',
      (
        select s.key
        from public.rd_projects rp
        join public.resource_scopes s on s.id = rp.scope_id
        where rp.id = rd_evidence_records.rd_project_id
      )
    )
  );

create policy "audit logs visible to founder and auditors"
  on public.audit_logs
  for select
  to authenticated
  using (
    public.is_founder_admin(auth.uid())
    or public.user_has_permission_for_scope(auth.uid(), 'view_audit_logs', 'org-global')
  );

create policy "audit logs insert by authenticated actor"
  on public.audit_logs
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

revoke update, delete on public.audit_logs from authenticated, anon;
