import { requireStaff } from "@/lib/auth/requireStaff";
import { getRdEvidence } from "@/lib/db/queries";
import { RdEvidenceForm } from "@/components/rd-evidence-form";
import { ExportRdPackForm } from "@/components/export-rd-pack-form";

export default async function RDProjectsPage() {
  const { supabase } = await requireStaff();

  const { data: projects } = await supabase
    .from("rd_projects")
    .select("id, title, status, technical_uncertainty");

  const { data: evidence } = await getRdEvidence(supabase, 30);
  const projectOptions = (projects ?? []).map((p) => ({ id: p.id, title: p.title }));

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">R&D Projects</h1>

      <ul className="space-y-2">
        {(projects ?? []).map((p) => (
          <li key={p.id} className="border rounded p-3 panel">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-neutral-500">Status: {p.status}</div>
            {p.technical_uncertainty ? (
              <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                {p.technical_uncertainty}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
        <RdEvidenceForm projects={projectOptions} />
        <ExportRdPackForm />
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Recent evidence</h2>
        <ul className="space-y-2">
          {(evidence ?? []).map((row) => (
            <li key={row.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
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
