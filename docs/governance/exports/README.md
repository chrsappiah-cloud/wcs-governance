# Generated PDF exports

PDF versions of governance documentation, produced from Markdown for grant acquittals, investor due diligence, and archival use.

## Files

| PDF | Source |
|-----|--------|
| `architecture.pdf` | [`../architecture.md`](../architecture.md) |
| `roles-and-scopes.pdf` | [`../roles-and-scopes.md`](../roles-and-scopes.md) |

R&D evidence PDFs are written alongside their Markdown sources in [`../../rd-evidence/`](../../rd-evidence/).

## Generate locally

```bash
npm install
npm run prepare:pdf   # first time only — downloads Chromium
npm run export:pdf -- governance          # governance docs only
npm run export:pdf -- rd-evidence         # all *.md in docs/rd-evidence/
npm run export:pdf -- all                 # both
npm run export:pdf -- path/to/file.md     # single file
```

Requires Chromium (installed automatically by `md-to-pdf` / Puppeteer on first run).

## GitHub Actions

Workflow: [`.github/workflows/governance-docs.yml`](../../.github/workflows/governance-docs.yml)

- **Manual:** Actions → Governance & Evidence PDF Export
- **On release:** publishes all governance + R&D evidence PDFs
- **On push** to `docs/governance/` or `docs/rd-evidence/`: regenerates and commits PDFs

Artifacts are also uploaded for download without committing.
