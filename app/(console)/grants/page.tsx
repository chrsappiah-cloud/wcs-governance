import { requirePermission } from "@/lib/auth/requirePermission";

export default async function GrantsPage() {
  await requirePermission("view_finance", "grant-rd-funding-2026");
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Grants & Finance</h1>
      <p className="muted">Milestone reporting and expenditure mapping for grant-rd-funding-2026.</p>
    </section>
  );
}
