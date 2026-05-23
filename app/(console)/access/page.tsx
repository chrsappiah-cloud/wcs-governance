import { requirePermission } from "@/lib/auth/require-permission";
import { getRoleAssignments } from "@/lib/db/queries";

export default async function AccessPage() {
  const { supabase } = await requirePermission("manage_access", "org-global");
  const { data: assignments } = await getRoleAssignments(supabase);

  return (
    <section>
      <h1>Access Control</h1>
      <p className="muted">Manage role assignments, scope access, and quarterly reviews.</p>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {(assignments ?? []).map((row: Record<string, unknown>) => {
              const profile = row.profiles as { full_name?: string; email?: string } | null;
              const role = row.roles as { key?: string; name?: string } | null;
              const scope = row.resource_scopes as { key?: string; label?: string } | null;
              return (
                <tr key={String(row.id)}>
                  <td>{profile?.full_name ?? profile?.email ?? String(row.user_id)}</td>
                  <td>{role?.name ?? role?.key}</td>
                  <td>{scope?.label ?? scope?.key}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
