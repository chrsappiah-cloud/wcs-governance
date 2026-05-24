-- Student management system (idempotent)
-- Run after 001-004

create table if not exists public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  student_id text unique not null,
  email text,
  full_name text,
  status text not null default 'active' check (status in ('active', 'suspended', 'expired')),
  access_until timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id)
);

create table if not exists public.student_payments (
  id bigserial primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  amount numeric not null,
  currency text not null default 'AUD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'failed')),
  payment_method text,
  payment_ref text,
  notes text,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.student_courses (
  id bigserial primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  course_key text not null,
  course_name text not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id),
  expires_at timestamptz,
  unique (student_id, course_key)
);

alter table public.students enable row level security;
alter table public.student_payments enable row level security;
alter table public.student_courses enable row level security;

create or replace function public.is_student(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where id = p_user_id and status = 'active'
  );
$$;

create or replace function public.is_student_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    join public.resource_scopes s on s.id = ura.scope_id
    where ura.user_id = p_user_id
      and r.key = 'founder_admin'
      and s.key = 'org-global'
  );
$$;

create policy "Students can view own profile"
  on public.students for select
  using (id = auth.uid() or public.is_student_admin(auth.uid()));

create policy "Admins can insert students"
  on public.students for insert
  with check (public.is_student_admin(auth.uid()));

create policy "Admins can update students"
  on public.students for update
  using (public.is_student_admin(auth.uid()));

create policy "Admins can view all payments"
  on public.student_payments for select
  using (public.is_student_admin(auth.uid()));

create policy "Admins can manage payments"
  on public.student_payments for insert
  with check (public.is_student_admin(auth.uid()));

create policy "Admins can update payments"
  on public.student_payments for update
  using (public.is_student_admin(auth.uid()));

create policy "Admins can view all courses"
  on public.student_courses for select
  using (public.is_student_admin(auth.uid()));

create policy "Admins can manage courses"
  on public.student_courses for all
  using (public.is_student_admin(auth.uid()));

grant usage on sequence public.student_payments_id_seq to authenticated;
grant usage on sequence public.student_courses_id_seq to authenticated;

grant select on public.students to authenticated;
grant insert on public.students to authenticated;
grant update on public.students to authenticated;
grant select on public.student_payments to authenticated;
grant insert on public.student_payments to authenticated;
grant update on public.student_payments to authenticated;
grant select on public.student_courses to authenticated;
grant insert on public.student_courses to authenticated;
grant update on public.student_courses to authenticated;

grant execute on function public.is_student to authenticated;
grant execute on function public.is_student_admin to authenticated;
