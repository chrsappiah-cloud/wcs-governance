-- Founder bootstrap for existing Supabase auth user
-- Replace YOUR_FOUNDER_EMAIL, then run in SQL editor (service role).

insert into public.profiles (id, email, full_name)
select id, email, 'Founder'
from auth.users
where email = 'YOUR_FOUNDER_EMAIL'
on conflict (id) do update set email = excluded.email;

insert into public.user_role_assignments (user_id, role_id, scope_id)
select p.id, r.id, s.id
from public.profiles p,
     public.roles r,
     public.resource_scopes s
where p.email = 'YOUR_FOUNDER_EMAIL'
  and r.key = 'founder_admin'
  and s.key = 'org-global'
on conflict do nothing;

-- WCS founder (uncomment and use after sign-up):
-- where p.email = 'chrsappiah@gmail.com'
