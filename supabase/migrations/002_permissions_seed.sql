-- Seed roles, permissions, scopes, role-permission map (idempotent)

insert into public.roles (key, name, description) values
  ('founder_admin', 'Founder Admin', 'Ultimate owner and override authority'),
  ('platform_admin', 'Platform Admin', 'Infrastructure, deployment, security'),
  ('product_manager', 'Product Manager', 'Roadmap and release coordination'),
  ('content_manager', 'Content Manager', 'Website announcements and content'),
  ('ios_release_manager', 'iOS Release Manager', 'App release operations'),
  ('rd_coordinator', 'R&D Coordinator', 'R&D evidence oversight'),
  ('finance_grants_manager', 'Finance & Grants Manager', 'Grant reporting and expenditure mapping'),
  ('support_lead', 'Support Lead', 'Support and incident workflows'),
  ('engineer', 'Engineer', 'Product and system development'),
  ('contractor', 'Contractor', 'Scoped external contributor')
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('manage_access', 'Assign and revoke roles and scopes'),
  ('manage_domains', 'Manage domain/DNS'),
  ('manage_billing', 'Manage billing and owner-level commercial settings'),
  ('publish_content', 'Create and publish website content'),
  ('edit_ui_copy', 'Edit user-facing product and website copy'),
  ('manage_media', 'Upload and organize media assets'),
  ('manage_release', 'Prepare release operations and metadata'),
  ('approve_release', 'Approve release to production or App Store'),
  ('view_finance', 'View finance and grant records'),
  ('approve_grant_report', 'Approve milestone and acquittal reporting'),
  ('create_rd_record', 'Create experimental evidence entries'),
  ('approve_rd_record', 'Approve curated R&D evidence records'),
  ('export_evidence_pack', 'Export structured evidence packages'),
  ('view_audit_logs', 'View audit and governance logs'),
  ('manage_support_cases', 'Manage support and issue workflows')
on conflict (key) do nothing;

insert into public.resource_scopes (key, kind, label) values
  ('org-global', 'org', 'World Class Scholars Global'),
  ('website-main', 'website', 'Main Website'),
  ('etherealveil-ios', 'ios_app', 'EtherealVeil iOS'),
  ('wcslib-ios', 'ios_app', 'WCSLiB iOS'),
  ('wcs-platform-rd-2026', 'rd_project', 'WCS Platform R&D 2026'),
  ('etherealveil-rd-2026', 'rd_project', 'EtherealVeil R&D 2026'),
  ('grant-rd-funding-2026', 'grant', 'R&D Funding 2026'),
  ('production', 'environment', 'Production Environment'),
  ('staging', 'environment', 'Staging Environment')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on true
where
  (r.key = 'founder_admin')
  or (r.key = 'platform_admin' and p.key in ('manage_release', 'approve_release', 'view_audit_logs'))
  or (r.key = 'content_manager' and p.key in ('publish_content', 'edit_ui_copy', 'manage_media'))
  or (r.key = 'ios_release_manager' and p.key in ('manage_release'))
  or (r.key = 'rd_coordinator' and p.key in ('create_rd_record', 'approve_rd_record', 'export_evidence_pack'))
  or (r.key = 'finance_grants_manager' and p.key in ('view_finance', 'approve_grant_report', 'export_evidence_pack'))
  or (r.key = 'support_lead' and p.key in ('manage_support_cases'))
  or (r.key = 'engineer' and p.key in ('create_rd_record', 'manage_release'))
  or (r.key = 'product_manager' and p.key in ('manage_release', 'publish_content'))
on conflict do nothing;

insert into public.rd_projects (scope_id, title, technical_uncertainty, objective, status)
select s.id,
  'EtherealVeil adaptive interface R&D',
  'Whether adaptive UI pacing reduces cognitive load without increasing abandonment is unknown at project start.',
  'Investigate adaptive pacing algorithms for early-stage memory support interfaces.',
  'active'
from public.resource_scopes s
where s.key = 'etherealveil-rd-2026'
on conflict (scope_id) do nothing;

insert into public.rd_projects (scope_id, title, technical_uncertainty, objective, status)
select s.id,
  'WCS Platform governance backbone R&D',
  'Whether a unified RBAC + RLS model scales across web, iOS, and grant reporting without privilege sprawl is unresolved.',
  'Build and validate a founder-controlled governance backbone for multi-product operations.',
  'active'
from public.resource_scopes s
where s.key = 'wcs-platform-rd-2026'
on conflict (scope_id) do nothing;
