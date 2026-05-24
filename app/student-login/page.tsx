import { Suspense } from "react";
import type { Metadata } from "next";
import StudentLoginForm from "@/components/student-login-form";

export const metadata: Metadata = {
  title: "Student Sign In — World Class Scholars",
  robots: { index: false, follow: false },
};

export default function StudentLoginPage() {
  return (
    <div style={{ maxWidth: 400, margin: "4rem auto", padding: "0 1rem" }}>
      <h1 className="text-2xl font-semibold mb-4">Student sign in</h1>
      <Suspense fallback={<p className="muted">Loading...</p>}>
        <StudentLoginForm />
      </Suspense>
      <p className="muted text-sm mt-4">
        Staff? <a href="/login" style={{ color: "var(--accent)" }}>Sign in here</a>
      </p>
    </div>
  );
}
