import { requireStaff } from "@/lib/auth/requireStaff";

export default async function SettingsPage() {
  const { user, claims } = await requireStaff();
  return (
    <section>
      <h1>Settings</h1>
      <div className="panel">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Org role:</strong> {String(claims.org_role ?? "—")}
        </p>
        <p>
          <strong>Staff status:</strong> {String(claims.staff_status ?? "—")}
        </p>
      </div>
    </section>
  );
}
