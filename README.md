# World Class Scholars — Governance Console

Founder-controlled governance for World Class Scholars: Supabase RBAC + RLS, App Router console, R&D evidence, and grant-ready reporting.

**Live repos:** [wcs-governance](https://github.com/chrsappiah-cloud/wcs-governance) (this repo) · [wcs-full](https://github.com/chrsappiah-cloud/wcs-full) (marketing site)

## Quick start

```bash
cp .env.example .env.local   # set Supabase URL + keys
npm install
npm run dev
```

Apply SQL migrations in `supabase/migrations/` (001 → 004), enable the custom access token hook, then seed founder via `supabase/seed-founder.sql`.

## Structure

```
app/(marketing)/     Public site (gradual port from wcs-full)
app/(auth)/          Staff login
app/(console)/       Governance console + server actions
lib/auth/            requireStaff, requirePermission
lib/supabase/        SSR client (@supabase/ssr)
supabase/migrations/ Versioned RBAC/RLS schema
docs/governance/     Architecture and roles reference
docs/rd-evidence/    Generated monthly R&D Markdown packs
scripts/             CLI export tooling
```

## Documentation

- [Governance architecture](docs/governance/architecture.md) — formal overview for grant and investor audiences
- [Roles and scopes](docs/governance/roles-and-scopes.md)
- [R&D evidence exports](docs/rd-evidence/README.md)
- [Integration with wcs-full](docs/INTEGRATION.md)

## Export R&D evidence to Git

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  npm run export:rd -- wcs-platform-rd-2026 2026 5
```

GitHub Actions (`.github/workflows/rd-report.yml`) can run this monthly and commit to `docs/rd-evidence/`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local console |
| `npm run typecheck` | TypeScript check |
| `npm run export:pdf -- governance` | PDF exports of governance docs |
| `npm run export:pdf -- rd-evidence` | PDF exports of R&D Markdown packs |
