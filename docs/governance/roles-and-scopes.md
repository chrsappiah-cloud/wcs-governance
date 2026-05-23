# Roles and scopes

Canonical reference for World Class Scholars governance RBAC. Enforced in Postgres (RLS) and mirrored in `requirePermission()` server guards.

## Roles

| Key | Name | Primary responsibility |
|-----|------|------------------------|
| `founder_admin` | Founder Admin | Ultimate owner and override authority |
| `platform_admin` | Platform Admin | Infrastructure, deployment, security |
| `product_manager` | Product Manager | Roadmap and release coordination |
| `content_manager` | Content Manager | Website announcements and content |
| `ios_release_manager` | iOS Release Manager | App release operations |
| `rd_coordinator` | R&D Coordinator | R&D evidence oversight |
| `finance_grants_manager` | Finance & Grants Manager | Grant reporting and expenditure mapping |
| `support_lead` | Support Lead | Support and incident workflows |
| `engineer` | Engineer | Product and system development |
| `contractor` | Contractor | Scoped external contributor |

## Permissions

| Key | Description |
|-----|-------------|
| `manage_access` | Assign and revoke roles and scopes |
| `manage_domains` | Manage domain/DNS |
| `manage_billing` | Manage billing and owner-level commercial settings |
| `publish_content` | Create and publish website content |
| `edit_ui_copy` | Edit user-facing product and website copy |
| `manage_media` | Upload and organize media assets |
| `manage_release` | Prepare release operations and metadata |
| `approve_release` | Approve release to production or App Store |
| `view_finance` | View finance and grant records |
| `approve_grant_report` | Approve milestone and acquittal reporting |
| `create_rd_record` | Create experimental evidence entries |
| `approve_rd_record` | Approve curated R&D evidence records |
| `export_evidence_pack` | Export structured evidence packages |
| `view_audit_logs` | View audit and governance logs |
| `manage_support_cases` | Manage support and issue workflows |

## Resource scopes

| Key | Kind | Label |
|-----|------|-------|
| `org-global` | org | World Class Scholars Global |
| `website-main` | website | Main Website |
| `etherealveil-ios` | ios_app | EtherealVeil iOS |
| `wcslib-ios` | ios_app | WCSLiB iOS |
| `wcs-platform-rd-2026` | rd_project | WCS Platform R&D 2026 |
| `etherealveil-rd-2026` | rd_project | EtherealVeil R&D 2026 |
| `grant-rd-funding-2026` | grant | R&D Funding 2026 |
| `production` | environment | Production Environment |
| `staging` | environment | Staging Environment |

## Role → permission mapping (summary)

| Role | Permissions |
|------|-------------|
| `founder_admin` | All permissions (all scopes via assignment) |
| `platform_admin` | `manage_release`, `approve_release`, `view_audit_logs` |
| `content_manager` | `publish_content`, `edit_ui_copy`, `manage_media` |
| `ios_release_manager` | `manage_release` |
| `rd_coordinator` | `create_rd_record`, `approve_rd_record`, `export_evidence_pack` |
| `finance_grants_manager` | `view_finance`, `approve_grant_report`, `export_evidence_pack` |
| `support_lead` | `manage_support_cases` |
| `engineer` | `create_rd_record`, `manage_release` |
| `product_manager` | `manage_release`, `publish_content` |

Permissions are checked **per scope** via `user_has_permission_for_scope(user_id, permission_key, scope_key)`.

## Example assignments

| User | Role | Scope | Can do | Cannot do |
|------|------|-------|--------|-----------|
| Founder | `founder_admin` | `org-global` | Full override via `is_founder_admin()` | — |
| Content manager | `content_manager` | `website-main` | Publish website content | Access control, R&D approval |
| Engineer | `engineer` | `etherealveil-rd-2026` | Log R&D evidence, release prep | `manage_access`, grant sign-off |
| R&D coordinator | `rd_coordinator` | `etherealveil-rd-2026` | Create/approve/export R&D evidence | Unilateral spend approval |

## Assigning roles

Use SQL or the `/access` console (requires `manage_access` on `org-global`):

```sql
select public.assign_role_for_scope(
  '<user-uuid>',
  'content_manager',
  'website-main',
  '<founder-uuid>'
);
```

Verify:

```sql
select public.user_has_permission_for_scope('<user-uuid>', 'publish_content', 'website-main');
```

See also [`docs/role-matrix.md`](../role-matrix.md) for the original engineering reference.
