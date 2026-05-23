import Link from "next/link";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getRdEvidence } from "@/lib/db/queries";
import { createRDEvidence } from "./actions";

const RD_SCOPES = [
  { key: "wcs-platform-rd-2026", label: "WCS Platform R&D 2026" },
  { key: "etherealveil-rd-2026", label: "EtherealVeil R&D 2026" },
];

export default async function RDProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  const { supabase } = await requireStaff();
  const params = searchParams ? await searchParams : {};

  const { data: projects } = await supabase
    .from("rd_projects")
    .select("id, title, status, technical_uncertainty");

  const { data: evidence } = await getRdEvidence(supabase, 30);
  const now = new Date();

  return (
    <section className="space-y-6">
      {params.saved ? <p className="muted">Evidence saved successfully.</p> : null}
      {params.error ? <p style={{ color: "#f87171" }}>{decodeURIComponent(params.error)}</p> : null}

      <div>
        <h1 className="text-2xl font-semibold mb-4">R&D Projects</h1>
        <ul className="space-y-2">
          {(projects ?? []).map((p) => (
            <li key={p.id} className="border rounded p-3 panel">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-neutral-500">Status: {p.status}</div>
              {p.technical_uncertainty ? (
                <p className="muted text-sm" style={{ marginTop: "0.5rem" }}>
                  {p.technical_uncertainty}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Log new R&D evidence</h2>
        <form action={createRDEvidence} className="space-y-3 panel">
          <label className="field">
            <span className="text-sm font-medium">Scope</span>
            <select name="rd_project_scope_key" defaultValue="wcs-platform-rd-2026">
              {RD_SCOPES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="text-sm font-medium">Title</span>
            <input name="title" required />
          </label>
          <label className="field">
            <span className="text-sm font-medium">Evidence type</span>
            <select name="evidence_type" defaultValue="experiment">
              <option value="hypothesis">Hypothesis</option>
              <option value="experiment">Experiment</option>
              <option value="result">Result</option>
              <option value="cost_link">Cost link</option>
              <option value="meeting_note">Meeting note</option>
              <option value="decision">Decision</option>
              <option value="artifact">Artifact</option>
            </select>
          </label>
          <label className="field">
            <span className="text-sm font-medium">Summary</span>
            <textarea name="summary" rows={4} />
          </label>
          <div className="form-grid-3">
            <label className="field">
              <span className="text-sm font-medium">Commit</span>
              <input name="linked_commit" />
            </label>
            <label className="field">
              <span className="text-sm font-medium">Build</span>
              <input name="linked_build" />
            </label>
            <label className="field">
              <span className="text-sm font-medium">Cost ref</span>
              <input name="linked_cost_ref" />
            </label>
          </div>
          <button type="submit" className="btn">
            Save evidence
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="flex-between mb-2">
          <h2 style={{ margin: 0 }}>Monthly evidence packs</h2>
          <Link href={`/rd-projects/monthly?scope=wcs-platform-rd-2026&year=${now.getUTCFullYear()}&month=${now.getUTCMonth() + 1}`} className="btn">
            View this month
          </Link>
        </div>
        <p className="muted text-sm">
          Structured, contemporaneous evidence grouped by project scope — suitable for grant and R&D reporting.
        </p>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Recent evidence</h2>
        <ul className="space-y-2">
          {(evidence ?? []).map((row) => (
            <li key={row.id} className="evidence-row">
              <div className="font-medium">
                <span className="badge">{row.evidence_type}</span> {row.title}
              </div>
              <div className="text-sm text-neutral-500">
                {(row.rd_projects as { title?: string } | null)?.title ?? "Project"} ·{" "}
                {new Date(String(row.recorded_at)).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
        {!evidence?.length ? <p className="muted">No evidence records yet.</p> : null}
      </div>
    </section>
  );
}
