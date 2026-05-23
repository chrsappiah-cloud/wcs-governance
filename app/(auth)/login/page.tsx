import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="panel" style={{ width: "min(420px, 100%)" }}>
        <h1 style={{ marginTop: 0 }}>Staff sign in</h1>
        <p className="muted">World Class Scholars governance console</p>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
