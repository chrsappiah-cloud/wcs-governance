import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Staff Sign In — World Class Scholars Governance",
  description: "Staff governance console sign-in for World Class Scholars. Authorised personnel only.",
  robots: { index: false, follow: false },
};

function LoginNotice({ error }: { error?: string }) {
  if (error === "supabase_not_configured") {
    return (
      <p style={{ color: "#fde047", marginBottom: "1rem", fontSize: "0.875rem" }}>
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env.local</code> and add your project URL and keys.
      </p>
    );
  }
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div className="panel" style={{ width: "min(420px, 100%)" }}>
        <h1 style={{ marginTop: 0 }}>Staff sign in</h1>
        <p className="muted">World Class Scholars governance console</p>
        <LoginNotice error={params.error} />
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
