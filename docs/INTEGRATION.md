# Integrating governance into the existing WCS site

This Next.js app (`wcs-governance/`) is the **unified target** for [worldclassscholars.vercel.app](https://worldclassscholars.vercel.app): public marketing at `/`, staff login at `/login`, internal console at `/dashboard`, `/access`, etc.

The live site is currently a **Vite SPA** from [`chrsappiah-cloud/wcs-full`](https://github.com/chrsappiah-cloud/wcs-full) frontend. Retrofit gently — do not rewrite everything at once.

## Stack detection

| Surface | Current | Target |
|---------|---------|--------|
| Public marketing | Vite (`wcs-full/frontend`) | `(marketing)/` route group — port pages gradually |
| Staff console | Not present | `(console)/` + Supabase RBAC + RLS |
| Auth | None on public site | Supabase Auth + custom access token hook |

## Step 1 — Attach Supabase (Vercel)

In the Vercel project for worldclassscholars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Install (already in `package.json`):

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Server client: `lib/supabase/server.ts`  
Browser client: `lib/supabase/client.ts`

## Step 2 — Apply governance migrations

Run in your **existing** Supabase project (SQL editor or CLI), in order:

1. `supabase/migrations/001_core_governance.sql`
2. `supabase/migrations/002_permissions_seed.sql`
3. `supabase/migrations/003_rls.sql`
4. `supabase/migrations/004_audit_triggers.sql`

Enable **Custom Access Token Hook** → `public.custom_access_token_hook`.

## Step 3 — Embed console in this app

Route groups (App Router):

```
app/
  (marketing)/     ← public site (unchanged URLs at /, /about)
  (auth)/login/    ← staff sign-in
  (console)/       ← dashboard, access, rd-projects, audit, …
  api/             ← approvals, audit, export-rd-pack
```

Protection:

- `middleware.ts` — session required for console paths
- `(console)/layout.tsx` — `requireStaff()` (JWT `is_staff` / `org_role`)
- Each page — `requirePermission(key, scopeKey)` before data access

## Step 4 — Map founder and staff

After founder signs up via `/login`, run `supabase/seed-founder.sql` (edit email if needed).

Or:

```sql
select public.bootstrap_founder('<founder-user-uuid>');
select public.assign_role_for_scope('<uuid>', 'content_manager', 'website-main', '<founder-uuid>');
```

Re-login so JWT claims refresh.

## Step 5 — Wrap existing content writes

For any existing CMS / content table in Supabase or API routes:

```ts
import { requirePublishContent } from "@/lib/content/guard";
await requirePublishContent();
// then insert/update content row — RLS enforces scope
```

Do **not** rely on hidden admin UI alone; enforce on server + RLS.

## Step 6 — iOS apps as clients

SwiftUI apps use the same Supabase project and call tables/APIs protected by RLS. No duplicate permission logic in Swift — use `my_permissions()` or scoped queries only.

## Step 7 — Gradual cutover from Vite marketing

**Phase A (now):** Deploy this Next.js app to a preview URL; run migrations; validate console + roles.

**Phase B:** Port high-traffic marketing pages from `wcs-full/frontend` into `(marketing)/`.

**Phase C:** Point `worldclassscholars.vercel.app` root to this Next.js deployment; retire Vite build when parity is reached.

**Phase D:** Move content publishing and R&D evidence capture fully into console; lock legacy admin paths behind the same permissions.

Optional Vercel rewrite during transition (preview only):

```json
{
  "rewrites": [
    { "source": "/assets/:path*", "destination": "https://legacy-vite-host/assets/:path*" }
  ]
}
```

## File map (minimal diffs if merging into another Next repo)

| Starter pack file | Purpose |
|-------------------|---------|
| `lib/supabase/server.ts` | Server Supabase client |
| `lib/auth/*` | Session + staff + permission gates |
| `lib/db/queries.ts` | Console data loaders |
| `lib/audit/log-action.ts` | Application audit writes |
| `lib/content/guard.ts` | Content mutation guards |
| `supabase/migrations/*` | Schema + RLS + triggers |
| `middleware.ts` | Console route protection |
| `app/(console)/*` | Governance UI |
| `docs/governance/*` | Architecture and roles reference |
| `docs/rd-evidence/*` | Generated monthly R&D Markdown packs |
| `scripts/export-rd-report.ts` | CLI export to `docs/rd-evidence/` |

## R&D evidence in Git

Export monthly packs locally or via GitHub Actions:

```bash
npm run export:rd -- wcs-platform-rd-2026 2026 5
```

See [docs/rd-evidence/README.md](./rd-evidence/README.md) and [docs/governance/architecture.md](./governance/architecture.md).

## Local dev

```bash
cp .env.example .env.local
npm install
npm run dev
```

Console: [http://localhost:3000/login](http://localhost:3000/login) → `/dashboard`
