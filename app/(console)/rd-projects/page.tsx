import { requireStaff } from "@/lib/auth/requireStaff";

export default async function RDProjectsPage() {
  const { supabase } = await requireStaff();

  const { data: projects } = await supabase
    .from("rd_projects")
    .select("id, title, status, technical_uncertainty");

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
    </section>
  );
}
