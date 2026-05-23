# R&D evidence reports

This directory holds **versioned Markdown evidence packs** exported from the WCS governance Supabase project. Files are generated from contemporaneous records in `rd_evidence_records` and are suitable for grant reporting, R&D tax documentation, and internal audit.

## File naming

```
<scope-key>-<year>-<month>.md
```

Examples:

- `wcs-platform-rd-2026-2026-05.md`
- `etherealveil-rd-2026-2026-05.md`

## Generate locally

Requires Supabase service role key (server-only — never commit to Git).

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npm run export:rd -- wcs-platform-rd-2026 2026 5
```

Then commit the generated file:

```bash
git add docs/rd-evidence/wcs-platform-rd-2026-2026-05.md
git commit -m "docs(rd): May 2026 evidence pack for wcs-platform-rd-2026"
```

## Generate via GitHub Actions

Workflow: `.github/workflows/rd-report.yml`

1. Add repository secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
2. Run manually: **Actions → R&D Evidence Export → Run workflow**
3. Or wait for the monthly schedule (1st of each month, 03:00 UTC)

The workflow writes reports to this directory, uploads CI artifacts, and commits changes to `main` when files differ.

## Console alternative

Staff with `export_evidence_pack` permission can preview packs at:

```
/rd-projects/monthly?scope=wcs-platform-rd-2026&year=2026&month=5
```

Console exports do not write to Git; use the CLI or GitHub Action for versioned reports in this folder.

## PDF exports

After generating Markdown, convert to PDF for grant acquittals:

```bash
npm run export:pdf -- rd-evidence
```

Or export a single file:

```bash
npm run export:pdf -- docs/rd-evidence/wcs-platform-rd-2026-2026-05.md
```

Governance architecture PDF: `npm run export:governance-pdf` → `docs/governance/exports/architecture.pdf`

## Record-keeping expectations

Each pack includes:

- Project objective and technical uncertainty (from `rd_projects`)
- Chronological evidence records with type, summary, and links (commit, build, cost reference)
- Generation timestamp and scope identifier

Evidence should be logged **contemporaneously** via `/rd-projects` as work occurs, not reconstructed at year-end.
