# World Class Scholars — Role Matrix

Fixed role and permission keys used by RLS, server handlers, and the console UI.

## Roles

| Key | Name | Tier | Primary responsibility |
|-----|------|------|------------------------|
| `founder_admin` | Founder Admin | 0 | Ultimate owner, recovery, final approvals |
| `platform_admin` | Platform Admin | 1 | Infrastructure, deployment, security |
| `product_manager` | Product Manager | 2 | Roadmap, release coordination |
| `content_manager` | Content Manager | 2 | Website copy, media, publishing |
| `ios_release_manager` | iOS Release Manager | 2 | TestFlight, metadata, staged releases |
| `rd_coordinator` | R&D Coordinator | 2 | Experiment logs, evidence quality |
| `finance_grants_manager` | Finance & Grants Manager | 2 | Grant milestones, expenditure mapping |
| `support_lead` | Support Lead | 2 | Support and incident workflows |
| `engineer` | Engineer | 3 | Build, test, technical evidence |
| `contractor` | Contractor | 3 | Time-bound scoped delivery |

## Permissions

| Key | Used for |
|-----|----------|
| `manage_access` | Role assignments on `org-global` |
| `manage_domains` | Domain registrar / DNS (founder-owned externally) |
| `manage_billing` | Billing ownership (founder-owned externally) |
| `publish_content` | Publish website content |
| `edit_ui_copy` | Edit user-facing copy |
| `manage_media` | Media library |
| `manage_release` | Release prep, metadata, TestFlight ops |
| `approve_release` | Final production / App Store sign-off |
| `view_finance` | Read grant and finance records |
| `approve_grant_report` | Sign off milestone / acquittal reports |
| `create_rd_record` | Create contemporaneous R&D evidence |
| `approve_rd_record` | Approve curated evidence entries |
| `export_evidence_pack` | Export structured evidence packages |
| `view_audit_logs` | Read governance audit trail |
| `manage_support_cases` | Support and quality workflows |

## Scopes

| Key | Kind | Label |
|-----|------|-------|
| `org-global` | org | World Class Scholars Global |
| `website-main` | website | Main Website |
| `etherealveil-ios` | ios_app | EtherealVeil iOS |
| `wcslib-ios` | ios_app | WCSLiB iOS |
| `wcs-platform-rd-2026` | rd_project | WCS Platform R&D 2026 |
| `etherealveil-rd-2026` | rd_project | EtherealVeil R&D 2026 |
| `grant-rd-funding-2026` | grant | R&D Funding 2026 |
| `production` | environment | Production |
| `staging` | environment | Staging |

## Example assignments (Day 11–12 testing)

| User | Role | Scope | Can do | Cannot do |
|------|------|-------|--------|-----------|
| Founder | `founder_admin` | `org-global` | Everything; override via `is_founder_admin()` | — |
| Content manager | `content_manager` | `website-main` | Publish/edit copy for main site | DNS, billing, R&D approval |
| Engineer | `engineer` | `etherealveil-rd-2026` | Create R&D evidence, release prep | `manage_access`, grant sign-off |
| R&D coordinator | `rd_coordinator` | `etherealveil-rd-2026` | Create/approve/export R&D evidence | Unilateral spend approval |

## Enforcement layers

1. **JWT claims** — `is_staff`, `org_role`, `staff_status` (coarse console gate)
2. **`requirePermission(key, scope)`** — server-side RPC before reads/writes
3. **RLS** — Postgres policies on all sensitive tables
4. **Audit** — triggers + `write_audit_log()` on mutations

Founder override is implemented in `is_founder_admin(user_id)` checking `founder_admin` on `org-global` only.
