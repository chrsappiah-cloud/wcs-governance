# World Class Scholars — Governance Console

Founder-controlled governance for World Class Scholars: Supabase RBAC + RLS, App Router console, R&D evidence, and grant-ready reporting.

**Repo:** [chrsappiah-cloud/wcs-governance](https://github.com/chrsappiah-cloud/wcs-governance) · **Marketing site:** [wcs-full](https://github.com/chrsappiah-cloud/wcs-full)

## Go-live checklist

| Step | Status | Action |
|------|--------|--------|
| 1. Wire Supabase | **Code ready** | Copy `.env.example` → `.env.local`, add URL + keys |
| 2. Apply schema | **SQL ready** | Run `supabase/migrations/001` → `004` in Supabase |
| 3. Seed founder | **SQL ready** | Sign up at `/login`, run `supabase/seed-founder.sql` |
| 4. Console routes | **Done** | `(auth)/login`, `(console)/*`, `requireStaff`, `requirePermission` |
| 5. R&D evidence | **Done** | `createRDEvidence` on `/rd-projects` — test after step 3 |
| 6. GitHub reports | **Done** | `npm run export:rd`, workflow `rd-report.yml` |
| 7. Architecture doc | **Done** | `docs/governance/architecture.md` + PDF export |

Verify after steps 1–3:

```bash
npm run verify:setup    # checks env, schema, founder assignment
npm run test:unit       # lib unit tests
npm run dev             # then: npm run test:stack
open http://localhost:3000/system   # full diagnostics UI (after login)
```

## Quick start

**Supabase project:** [World-Class-Scholars](https://supabase.com/dashboard/project/qbmheroqblpcbuqwnzlp) (`qbmheroqblpcbuqwnzlp`)

```bash
cp .env.example .env.local   # or use prefilled .env.local — add keys from dashboard
# Unpause project if needed, then paste anon + service_role keys
npm run go-live              # link + push migrations 001–004 + verify:setup
npm run dev                  # sign up at /login, run seed-founder.sql, re-login
open http://localhost:3000/system
```

**Supabase dashboard (one-time):**

1. SQL Editor → run migrations `001` through `004` in order
2. Auth → Hooks → enable `public.custom_access_token_hook`
3. After sign-up → run `supabase/seed-founder.sql`
4. Sign out and back in (refreshes JWT claims)

**Vercel:** connect this repo, set the three env vars, deploy.

**GitHub secrets** (for automated R&D export): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Structure

```
app/(marketing)/     Public site
app/(auth)/login/    Staff sign-in
app/(console)/       Dashboard, access, rd-projects, grants, audit
lib/supabase/        getServerSupabase() (@supabase/ssr)
lib/auth/            requireStaff, requirePermission
supabase/migrations/ RBAC + RLS + audit (001–004)
docs/governance/     Architecture + roles (PDF in exports/)
docs/rd-evidence/    Generated monthly Markdown/PDF packs
scripts/             export-rd-report, export-markdown-pdf, verify-setup
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local console |
| `npm run build` | Production build |
| `npm run verify:setup` | Validate Supabase env + schema + founder |
| `npm run test:unit` | Unit tests (lib/rd, registry) |
| `npm run test:stack` | HTTP probes (requires `npm run dev`) |
| `npm run test` | Unit + stack tests |
| `npm run export:rd -- <scope> <year> <month>` | Markdown → `docs/rd-evidence/` |
| `npm run export:governance-pdf` | PDF → `docs/governance/exports/` |

## Documentation

- [Governance architecture](docs/governance/architecture.md) (+ [PDF](docs/governance/exports/architecture.pdf))
- [Roles and scopes](docs/governance/roles-and-scopes.md)
- [R&D evidence exports](docs/rd-evidence/README.md)
- [Integration with wcs-full](docs/INTEGRATION.md)
