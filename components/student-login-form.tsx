"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const next = searchParams.get("next") ?? "/student/dashboard";
    router.push(next);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 400, margin: "4rem auto", padding: "0 1rem" }}>
      <h1 className="text-2xl font-semibold mb-4">Student sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="field">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error ? <p style={{ color: "#f87171", fontSize: "0.875rem" }}>{error}</p> : null}
        <button type="submit" className="btn">Sign in</button>
      </form>
      <p className="muted text-sm mt-4">
        Staff? <a href="/login" style={{ color: "var(--accent)" }}>Sign in here</a>
      </p>
    </div>
  );
}
