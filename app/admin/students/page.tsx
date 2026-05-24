import { requireStaff } from "@/lib/auth/requireStaff";
import { redirect } from "next/navigation";
import { getStudents } from "@/lib/students";
import {
  adminCreateStudent,
  adminToggleStatus,
  adminRecordPayment,
  adminGrantCourse,
} from "./actions";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; pwd?: string; error?: string }>;
}) {
  const { user, claims } = await requireStaff();
  const role = String(claims.org_role ?? "");

  if (role !== "founder_admin") {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};
  const students = await getStudents();

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">Student Management</h1>
      <p className="muted mb-4">Founder-only. Create student accounts, manage payments and course access.</p>

      {params.created ? (
        <div className="panel mb-4" style={{ borderColor: "#22c55e" }}>
          <strong>Student created!</strong>
          <p>Student ID: <code>{params.created}</code></p>
          <p>Password: <code className="status-fail">{params.pwd}</code></p>
          <p className="muted text-sm mt-1">Share these credentials privately with the student.</p>
        </div>
      ) : null}

      {params.error ? (
        <p className="panel mb-4" style={{ color: "#f87171", borderColor: "#ef4444" }}>
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      <div className="panel mb-4">
        <h2 className="text-xl font-semibold mb-2">Create student account</h2>
        <form action={adminCreateStudent} className="space-y-3">
          <input type="hidden" name="admin_user_id" value={user.id} />
          <label className="field">
            <span className="text-sm font-medium">Email</span>
            <input name="email" type="email" required />
          </label>
          <label className="field">
            <span className="text-sm font-medium">Full name</span>
            <input name="full_name" required />
          </label>
          <button type="submit" className="btn">Generate credentials</button>
        </form>
      </div>

      <div className="panel">
        <h2 className="text-xl font-semibold mb-2">Students ({students.length})</h2>
        {students.length === 0 ? (
          <p className="muted">No students yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Payments</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.id}>
                  <td><code className="text-xs">{s.student_id}</code></td>
                  <td>{s.full_name}</td>
                  <td className="text-sm">{s.email ?? "—"}</td>
                  <td>
                    <span className={`badge ${s.status === "active" ? "status-pass" : "status-fail"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge">${(s.student_payments ?? []).reduce((a: number, p: any) => a + Number(p.amount), 0)}</span>
                    {" "}
                    <span className="muted text-xs">{(s.student_payments ?? []).length} txns</span>
                  </td>
                  <td>
                    <span className="badge">{(s.student_courses ?? []).length}</span>
                  </td>
                  <td>
                    <details className="text-sm">
                      <summary style={{ cursor: "pointer", color: "var(--accent)" }}>Manage</summary>
                      <div className="mt-2 space-y-3">
                        <form action={adminToggleStatus}>
                          <input type="hidden" name="user_id" value={s.id} />
                          <input type="hidden" name="status" value={s.status === "active" ? "suspended" : "active"} />
                          <button type="submit" className="btn" style={{ background: s.status === "active" ? "#ef4444" : "#22c55e" }}>
                            {s.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </form>

                        <form action={adminRecordPayment} className="flex-between">
                          <input type="hidden" name="user_id" value={s.id} />
                          <input type="hidden" name="recorded_by" value={user.id} />
                          <input name="amount" type="number" step="0.01" placeholder="Amount" required style={{ width: 100, padding: "0.3rem" }} />
                          <input name="notes" placeholder="Notes" style={{ width: 140, padding: "0.3rem" }} />
                          <button type="submit" className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Add payment</button>
                        </form>

                        <form action={adminGrantCourse} className="flex-between">
                          <input type="hidden" name="user_id" value={s.id} />
                          <input type="hidden" name="granted_by" value={user.id} />
                          <input name="course_key" placeholder="Course key" required style={{ width: 120, padding: "0.3rem" }} />
                          <input name="course_name" placeholder="Course name" required style={{ width: 140, padding: "0.3rem" }} />
                          <button type="submit" className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Grant access</button>
                        </form>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
