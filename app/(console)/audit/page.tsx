import { requirePermission, ForbiddenError } from "@/lib/auth/requirePermission";
import { getAuditLogs } from "@/lib/db/queries";

export default async function AuditPage() {
  let supabase;
  try {
    ({ supabase } = await requirePermission("view_audit_logs", "org-global"));
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return <p className="muted">You do not have permission to view audit logs.</p>;
    }
    throw e;
  }

  const { data: logs } = await getAuditLogs(supabase);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Audit</h1>
      <p className="muted">Application audit trail. Auth events remain in Supabase Auth logs.</p>
      <div className="panel" style={{ marginTop: "1rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log: Record<string, unknown>) => (
              <tr key={String(log.id)}>
                <td>{new Date(String(log.created_at)).toLocaleString()}</td>
                <td>{String(log.action)}</td>
                <td>
                  {String(log.entity_type)}:{String(log.entity_id)}
                </td>
                <td>{String(log.scope_key ?? "—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
