import { requireStaff } from "@/lib/auth/requireStaff";
import { runDiagnostics } from "@/lib/system/diagnostics";
import { SystemDiagnosticsPanel } from "@/components/system-diagnostics-panel";

export default async function SystemPage() {
  await requireStaff();
  const report = await runDiagnostics();

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">System diagnostics</h1>
      <p className="muted mb-4">
        Live status for frontend routes, middleware, API routes, auth helpers, and Supabase tables/RPCs.
      </p>
      <SystemDiagnosticsPanel initial={report} />
    </section>
  );
}
