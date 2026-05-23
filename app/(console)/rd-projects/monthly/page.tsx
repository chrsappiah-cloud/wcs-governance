import Link from "next/link";
import { requireStaff } from "@/lib/auth/requireStaff";
import { exportMonthlyRDEvidence } from "../export-actions";

const SCOPES = [
  { key: "wcs-platform-rd-2026", label: "WCS Platform R&D 2026" },
  { key: "etherealveil-rd-2026", label: "EtherealVeil R&D 2026" },
];

export default async function MonthlyEvidencePage({
  searchParams,
}: {
  searchParams?: Promise<{ scope?: string; year?: string; month?: string }>;
}) {
  await requireStaff();

  const params = searchParams ? await searchParams : {};
  const scopeKey = params.scope ?? "wcs-platform-rd-2026";
  const year = Number(params.year ?? new Date().getUTCFullYear());
  const month = Number(params.month ?? new Date().getUTCMonth() + 1);

  const result = await exportMonthlyRDEvidence(scopeKey, year, month);

  if (!result.success) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold mb-4">Monthly Evidence Pack</h1>
        <p style={{ color: "#f87171" }}>{result.error}</p>
        <Link href="/rd-projects">← Back to R&D Projects</Link>
      </section>
    );
  }

  const { project, records, period } = result;

  return (
    <section className="space-y-4">
      <div className="flex-between">
        <h1 className="text-2xl font-semibold">Monthly Evidence Pack – {project.title}</h1>
        <Link href="/rd-projects" className="muted text-sm">
          ← Back
        </Link>
      </div>

      <form method="get" className="panel form-grid-3">
        <label className="field">
          Scope
          <select name="scope" defaultValue={scopeKey}>
            {SCOPES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Year
          <input name="year" type="number" defaultValue={year} min={2020} max={2100} />
        </label>
        <label className="field">
          Month
          <input name="month" type="number" defaultValue={month} min={1} max={12} />
        </label>
        <button type="submit" className="btn">
          Load period
        </button>
      </form>

      <p className="text-sm text-neutral-500">
        Period: {period.year}-{String(period.month).padStart(2, "0")}
      </p>
      <p className="text-sm text-neutral-500">Objective: {project.objective}</p>
      <p className="text-sm text-neutral-500">Technical uncertainty: {project.technical_uncertainty}</p>

      <div className="space-y-3 mt-4">
        {(records ?? []).map((r) => (
          <article key={r.id} className="border rounded p-3 panel">
            <div className="flex-between">
              <span className="text-xs uppercase text-neutral-500">{r.evidence_type}</span>
              <span className="text-xs text-neutral-500">{new Date(r.recorded_at).toISOString()}</span>
            </div>
            <h2 className="font-medium mt-1">{r.title}</h2>
            {r.summary ? <p className="text-sm text-neutral-500 mt-1">{r.summary}</p> : null}
            <div className="mt-2 text-xs text-neutral-500">
              {r.linked_commit ? <span>Commit: {r.linked_commit} · </span> : null}
              {r.linked_build ? <span>Build: {r.linked_build} · </span> : null}
              {r.linked_cost_ref ? <span>Cost ref: {r.linked_cost_ref}</span> : null}
            </div>
          </article>
        ))}
        {!records.length ? <p className="muted">No evidence records in this period.</p> : null}
      </div>
    </section>
  );
}
