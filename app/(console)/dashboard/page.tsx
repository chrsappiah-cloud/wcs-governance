import { requireStaff } from "@/lib/auth/requireStaff";
import { getPendingApprovalsCount, getRdProjects } from "@/lib/db/queries";

export default async function DashboardPage() {
  const { supabase, user } = await requireStaff();
  const pending = await getPendingApprovalsCount(supabase);
  const projects = await getRdProjects(supabase);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Governance Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        <div className="panel">
          <strong>{pending.count ?? 0}</strong>
          <p className="muted">Pending approvals</p>
        </div>
        <div className="panel">
          <strong>{projects.data?.length ?? 0}</strong>
          <p className="muted">R&D projects visible</p>
        </div>
      </div>
    </section>
  );
}
