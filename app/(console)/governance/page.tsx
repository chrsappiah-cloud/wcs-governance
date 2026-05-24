import { requireStaff } from "@/lib/auth/requireStaff";
import { ForbiddenError } from "@/lib/auth/requirePermission";
import { getRoleAssignments, getAuditLogs, getPendingApprovalsCount, getRdProjects } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export default async function GovernancePage() {
  const { supabase, user, claims } = await requireStaff();

  const role = String(claims.org_role ?? "");
  if (role !== "founder_admin" && role !== "platform_admin") {
    redirect("/dashboard");
  }

  const [assignments, audit, pending, projects] = await Promise.all([
    getRoleAssignments(supabase),
    getAuditLogs(supabase, 20),
    getPendingApprovalsCount(supabase),
    getRdProjects(supabase),
  ]);

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const roleDistribution: Record<string, number> = {};
  for (const a of assignments.data ?? []) {
    const key = (a as any).roles?.name ?? "unknown";
    roleDistribution[key] = (roleDistribution[key] ?? 0) + 1;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Governance Console</h1>
      <p className="muted mb-4">
        Restricted to founder_admin and platform_admin. Overview of the governance system.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="panel">
          <strong>{userCount ?? 0}</strong>
          <p className="muted">Total staff profiles</p>
        </div>
        <div className="panel">
          <strong>{Object.keys(roleDistribution).length}</strong>
          <p className="muted">Active roles</p>
        </div>
        <div className="panel">
          <strong>{assignments.data?.length ?? 0}</strong>
          <p className="muted">Role assignments</p>
        </div>
        <div className="panel">
          <strong>{pending.count ?? 0}</strong>
          <p className="muted">Pending approvals</p>
        </div>
        <div className="panel">
          <strong>{projects.data?.length ?? 0}</strong>
          <p className="muted">R&D projects</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <h2 className="text-xl font-semibold mb-2">Role distribution</h2>
          <div className="panel">
            {Object.entries(roleDistribution).length === 0 ? (
              <p className="muted">No assignments yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(roleDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([roleName, count]) => (
                      <tr key={roleName}>
                        <td>{roleName}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Recent audit</h2>
          <div className="panel">
            {(audit.data ?? []).length === 0 ? (
              <p className="muted">No audit entries yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {(audit.data ?? []).slice(0, 10).map((log: any) => (
                    <tr key={log.id}>
                      <td>{String(log.action)}</td>
                      <td className="text-sm">{String(log.entity_type)}:{String(log.entity_id).slice(0, 8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: "1.5rem" }}>
        <h2 className="text-xl font-semibold mb-2">System status</h2>
        <table className="table">
          <tbody>
            <tr>
              <td>Auth session</td>
              <td><span className="badge status-pass">active</span></td>
            </tr>
            <tr>
              <td>Org role</td>
              <td><span className="badge">{role}</span></td>
            </tr>
            <tr>
              <td>User ID</td>
              <td className="text-xs" style={{ fontFamily: "monospace" }}>{user.id}</td>
            </tr>
            <tr>
              <td>Database reachable</td>
              <td><span className="badge status-pass">connected</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
