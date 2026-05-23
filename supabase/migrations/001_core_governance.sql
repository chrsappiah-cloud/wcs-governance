-- World Class Scholars — core governance schema (idempotent)

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  status text not null default 'active' check (status in ('active', 'suspended', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.roles (
  id bigserial primary key,
  key text unique not null,
  name text not null,
  description text
);

create table if not exists public.permissions (
  id bigserial primary key,
  key text unique not null,
  description text
);

create table if not exists public.role_permissions (
  role_id bigint not null references public.roles (id) on delete cascade,
  permission_id bigint not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.resource_scopes (
  id bigserial primary key,
  key text unique not null,
  kind text not null check (kind in ('org', 'website', 'ios_app', 'rd_project', 'grant', 'environment')),
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_role_assignments (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id bigint not null references public.roles (id) on delete cascade,
  scope_id bigint not null references public.resource_scopes (id) on delete cascade,
  assigned_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (user_id, role_id, scope_id)
);

create table if not exists public.approval_requests (
  id bigserial primary key,
  request_type text not null,
  scope_id bigint references public.resource_scopes (id),
  requested_by uuid references public.profiles (id),
  approved_by uuid references public.profiles (id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_user_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  scope_key text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rd_projects (
  id bigserial primary key,
  scope_id bigint unique not null references public.resource_scopes (id),
  title text not null,
  technical_uncertainty text not null,
  objective text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.rd_evidence_records (
  id bigserial primary key,
  rd_project_id bigint not null references public.rd_projects (id) on delete cascade,
  evidence_type text not null check (
    evidence_type in ('hypothesis', 'experiment', 'result', 'cost_link', 'meeting_note', 'decision', 'artifact')
  ),
  title text not null,
  summary text,
  linked_commit text,
  linked_build text,
  linked_cost_ref text,
  recorded_by uuid references public.profiles (id),
  recorded_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists user_role_assignments_user_idx on public.user_role_assignments (user_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists rd_evidence_project_idx on public.rd_evidence_records (rd_project_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
