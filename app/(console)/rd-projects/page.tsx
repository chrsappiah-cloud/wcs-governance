import { requireStaff } from "@/lib/auth/require-staff";
import { getRdProjects, getRdEvidence } from "@/lib/db/queries";

export default async function RDProjectsPage() {
  const { supabase } = await requireStaff();
  const { data: projects } = await getRdProjects(supabase);
  const { data: evidence } = await getRdEvidence(supabase);

  return (
    <section>
      <h1>R&D Projects</h1>
      <p className="muted">Contemporaneous evidence — RLS filters projects per user scope.</p>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Projects</h2>
        <pre style={{ overflow: "auto", fontSize: "0.85rem" }}>{JSON.stringify(projects, null, 2)}</pre>
      </div>

      <div className="panel" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Recent evidence</h2>
        <pre style={{ overflow: "auto", fontSize: "0.85rem" }}>{JSON.stringify(evidence, null, 2)}</pre>
      </div>
    </section>
  );
}
