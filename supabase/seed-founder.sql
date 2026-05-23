-- Founder bootstrap for existing Supabase auth user
-- Replace email if needed, then run in SQL editor (service role).

insert into public.profiles (id, email, full_name, status)
select id, email, 'Dr Christopher Appiah-Thompson', 'active'
from auth.users
where email = 'chrsappiah@gmail.com'
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      status = 'active';

insert into public.user_role_assignments (user_id, role_id, scope_id, assigned_by)
select p.id, r.id, s.id, p.id
from public.profiles p
cross join public.roles r
cross join public.resource_scopes s
where p.email = 'chrsappiah@gmail.com'
  and r.key = 'founder_admin'
  and s.key = 'org-global'
on conflict (user_id, role_id, scope_id) do nothing;

-- Example delegated staff (uncomment and set UUIDs after creating auth users):
-- select public.assign_role_for_scope('<uuid>', 'content_manager', 'website-main', '<founder-uuid>');
-- select public.assign_role_for_scope('<uuid>', 'engineer', 'etherealveil-rd-2026', '<founder-uuid>');
-- select public.assign_role_for_scope('<uuid>', 'rd_coordinator', 'etherealveil-rd-2026', '<founder-uuid>');
