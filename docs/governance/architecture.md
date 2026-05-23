# Governance Architecture — World Class Scholars

This document describes the founder-controlled digital governance system for World Class Scholars (WCS). It is intended for internal engineering, grant reviewers, and investor due diligence.

## Overview

WCS operates multiple products (public website, iOS apps, R&D programmes, grant reporting) under a single governance backbone. **All high-risk changes** — access control, content publication, release operations, R&D evidence, and grant exports — flow through a Supabase-backed RBAC model enforced at the database layer (Row Level Security), not only in application UI.

## Repository and deployment

| Component | Location |
|-----------|----------|
| **Governance console (App Router)** | This repo — [`chrsappiah-cloud/wcs-governance`](https://github.com/chrsappiah-cloud/wcs-governance) |
| **Public marketing site (current)** | [`chrsappiah-cloud/wcs-full`](https://github.com/chrsappiah-cloud/wcs-full) (Vite SPA) |
| **Supabase project** | Shared across web console and iOS clients |
| **Vercel deployment** | Console deployed from this repo; marketing site from `wcs-full` |

### Route map

| Path | Audience | Purpose |
|------|----------|---------|
| `/` | Public | Marketing (gradual port from `wcs-full`) |
| `/login` | Staff | Supabase Auth sign-in |
| `/dashboard`, `/access`, `/rd-projects`, `/grants`, `/audit` | Staff | Governance console |

## Enforcement layers

1. **Authentication** — Supabase Auth with session cookies via `@supabase/ssr`
2. **Coarse gate** — JWT custom access token hook sets `is_staff`, `org_role`, `founder_access`
3. **Server guards** — `requireStaff()` and `requirePermission(key, scope)` in App Router pages, server actions, and API routes
4. **Database RBAC** — `user_has_permission_for_scope()` and `is_founder_admin()` Postgres functions
5. **Row Level Security** — Policies on `user_role_assignments`, `rd_projects`, `rd_evidence_records`, `audit_logs`, etc.
6. **Audit trail** — Postgres triggers on sensitive tables + `write_audit_log()` for application events

Founder override is explicit: `founder_admin` role on `org-global` scope, checked via `is_founder_admin()`.

## Schema versioning

SQL migrations live in `supabase/migrations/` and are applied in order:

1. `001_core_governance.sql` — tables, profiles trigger
2. `002_permissions_seed.sql` — roles, permissions, scopes, role-permission map
3. `003_rls.sql` — helper functions, JWT hook, RLS policies
4. `004_audit_triggers.sql` — audit triggers, bootstrap helpers

Apply via Supabase SQL Editor or CLI:

```bash
supabase db push
```

## Multi-repo strategy

- **This repo** is the **source of truth** for governance schema, console UI, server actions, and R&D export tooling.
- **iOS apps** (EtherealVeil, WCSLiB) connect to the same Supabase project as scoped clients; they do not duplicate RBAC logic.
- **Marketing site** (`wcs-full`) links staff to the governance console login URL via `VITE_GOVERNANCE_CONSOLE_URL`.

## R&D evidence and reporting

Contemporaneous R&D evidence is captured in Supabase (`rd_evidence_records`) via:

- Console server action `createRDEvidence` on `/rd-projects`
- API route `POST /api/rd-evidence` for programmatic clients

Monthly structured packs are produced by:

- Console view `/rd-projects/monthly` (server action `exportMonthlyRDEvidence`)
- CLI script `scripts/export-rd-report.ts` → writes `docs/rd-evidence/<scope>-<year>-<month>.md`
- GitHub Actions workflow `.github/workflows/rd-report.yml` (scheduled + manual)

Reports are versioned in Git under `docs/rd-evidence/` for systematic, auditable record-keeping aligned with Australian R&D documentation expectations.

## CI/CD

| Trigger | Action |
|---------|--------|
| Push / PR to `main` | Typecheck (`.github/workflows/ci.yml`) |
| Monthly schedule / manual | R&D evidence export (`.github/workflows/rd-report.yml`) |
| Vercel (GitHub integration) | Deploy App Router console on merge to `main` |

Store `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub repository secrets for automated exports.

## Related documentation

- [Roles and scopes](./roles-and-scopes.md)
- [R&D evidence exports](../rd-evidence/README.md)
- [Developer prompts](../DEVELOPER_PROMPTS.md)
- [iOS client integration](../IOS_CLIENTS.md)
