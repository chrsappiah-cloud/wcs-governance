import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient, getServerSupabase } from "@/lib/supabase/server";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { getFirebaseBackupStatus } from "@/lib/firebase/backup";
import {
  ALL_STATIC_UNITS,
  type StaticUnit,
  type SystemLayer,
} from "./registry";

export type TestStatus = "pass" | "fail" | "warn" | "skip";

export type DiagnosticResult = {
  id: string;
  layer: SystemLayer;
  name: string;
  path: string;
  status: TestStatus;
  detail: string;
  ms?: number;
};

export type DiagnosticsReport = {
  generated_at: string;
  summary: { pass: number; fail: number; warn: number; skip: number; total: number };
  results: DiagnosticResult[];
};

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const start = Date.now();
  const value = await fn();
  return { value, ms: Date.now() - start };
}

function resultFromStatic(unit: StaticUnit, status: TestStatus, detail: string, ms?: number): DiagnosticResult {
  return { id: unit.id, layer: unit.layer, name: unit.name, path: unit.path, status, detail, ms };
}

async function checkTable(supabase: SupabaseClient, table: string) {
  return supabase.from(table).select("*", { count: "exact", head: true });
}

export async function runDiagnostics(): Promise<DiagnosticsReport> {
  const results: DiagnosticResult[] = [];

  // --- Environment ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  results.push({
    id: "env-url",
    layer: "backend",
    name: "NEXT_PUBLIC_SUPABASE_URL",
    path: ".env.local",
    status: url ? "pass" : "fail",
    detail: url ? "configured" : "missing",
  });
  results.push({
    id: "env-anon",
    layer: "backend",
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    path: ".env.local",
    status: anon ? "pass" : "fail",
    detail: anon ? "configured" : "missing",
  });
  results.push({
    id: "env-service",
    layer: "backend",
    name: "SUPABASE_SERVICE_ROLE_KEY",
    path: ".env.local",
    status: service ? "pass" : "warn",
    detail: service ? "configured" : "missing (exports + admin checks limited)",
  });

  // --- Auth session (SSR) ---
  try {
    const { value: session, ms } = await timed(async () => {
      const supabase = await getServerSupabase();
      return supabase.auth.getUser();
    });
    const user = session.data.user;
    results.push({
      id: "auth-session",
      layer: "auth",
      name: "Server session",
      path: "getServerSupabase().auth.getUser()",
      status: session.error ? "fail" : "pass",
      detail: user
        ? `signed in as ${user.email} (org_role=${String(user.app_metadata?.org_role ?? "—")})`
        : "no session (expected when not logged in)",
      ms,
    });

    if (user) {
      const supabase = await getServerSupabase();
      const { data: perms, error: permErr } = await supabase.rpc("my_permissions");
      results.push({
        id: "auth-my-permissions",
        layer: "auth",
        name: "my_permissions RPC (session)",
        path: "public.my_permissions",
        status: permErr ? "fail" : "pass",
        detail: permErr ? permErr.message : `${(perms ?? []).length} effective permission(s)`,
      });
    }
  } catch (e) {
    results.push({
      id: "auth-session",
      layer: "auth",
      name: "Server session",
      path: "getServerSupabase()",
      status: "fail",
      detail: e instanceof Error ? e.message : "error",
    });
  }

  // --- Database (service role when available, else anon) ---
  let db: SupabaseClient | null = null;
  try {
    db = service ? await createServiceClient() : await getServerSupabase();
  } catch {
    db = null;
  }

  const tables = ["profiles", "roles", "permissions", "resource_scopes", "user_role_assignments", "approval_requests", "audit_logs", "rd_projects", "rd_evidence_records"];

  if (!url || !anon) {
    for (const table of tables) {
      const unit = ALL_STATIC_UNITS.find((u) => u.name === table);
      results.push({
        id: unit?.id ?? `db-${table}`,
        layer: "database",
        name: table,
        path: `public.${table}`,
        status: "skip",
        detail: "Supabase env not configured",
      });
    }
  } else if (!db) {
    for (const table of tables) {
      results.push({
        id: `db-${table}`,
        layer: "database",
        name: table,
        path: `public.${table}`,
        status: "fail",
        detail: "Could not create Supabase client",
      });
    }
  } else {
    for (const table of tables) {
      const unit = ALL_STATIC_UNITS.find((u) => u.name === table);
      const { value: res, ms } = await timed(() => checkTable(db!, table));
      results.push({
        id: unit?.id ?? `db-${table}`,
        layer: "database",
        name: table,
        path: `public.${table}`,
        status: res.error ? "fail" : "pass",
        detail: res.error ? res.error.message : `reachable (count head ok)`,
        ms,
      });
    }

    // RPC probes
    const { value: rpcPerm, ms: rpcMs } = await timed(async () =>
      db!.rpc("user_has_permission_for_scope", {
        p_user_id: "00000000-0000-0000-0000-000000000000",
        p_permission_key: "manage_access",
        p_scope_key: "org-global",
      })
    );
    results.push({
      id: "rpc-permission",
      layer: "database",
      name: "user_has_permission_for_scope",
      path: "public.user_has_permission_for_scope",
      status: rpcPerm.error ? "fail" : "pass",
      detail: rpcPerm.error ? rpcPerm.error.message : `callable → ${String(rpcPerm.data)}`,
      ms: rpcMs,
    });

    const { value: rpcFounder, ms: founderMs } = await timed(async () =>
      db!.rpc("is_founder_admin", { p_user_id: "00000000-0000-0000-0000-000000000000" })
    );
    results.push({
      id: "rpc-founder",
      layer: "database",
      name: "is_founder_admin",
      path: "public.is_founder_admin",
      status: rpcFounder.error ? "fail" : "pass",
      detail: rpcFounder.error ? rpcFounder.error.message : `callable → ${String(rpcFounder.data)}`,
      ms: founderMs,
    });

    // Seed sanity
    const { data: roles } = await db.from("roles").select("key");
    const { data: scopes } = await db.from("resource_scopes").select("key");
    results.push({
      id: "db-seed-roles",
      layer: "database",
      name: "Role seeds",
      path: "002_permissions_seed.sql",
      status: (roles?.length ?? 0) >= 10 ? "pass" : "fail",
      detail: `${roles?.length ?? 0} roles`,
    });
    results.push({
      id: "db-seed-scopes",
      layer: "database",
      name: "Scope seeds",
      path: "002_permissions_seed.sql",
      status: scopes?.some((s) => s.key === "org-global") ? "pass" : "fail",
      detail: (scopes ?? []).map((s) => s.key).join(", ") || "empty",
    });

    const { data: founders } = await db
      .from("user_role_assignments")
      .select("user_id, roles(key), resource_scopes(key)");
    const founderCount = (founders ?? []).filter(
      (r) =>
        (r.roles as { key?: string } | null)?.key === "founder_admin" &&
        (r.resource_scopes as { key?: string } | null)?.key === "org-global"
    ).length;
    results.push({
      id: "db-founder-assigned",
      layer: "database",
      name: "Founder assignment",
      path: "seed-founder.sql",
      status: founderCount > 0 ? "pass" : "warn",
      detail: founderCount ? `${founderCount} founder_admin on org-global` : "none — run seed-founder.sql after sign-up",
    });
  }

  // --- Firebase backup ---
  const fbConfigured = isFirebaseConfigured();
  results.push({
    id: "firebase-configured",
    layer: "backend",
    name: "Firebase service account",
    path: "FIREBASE_SERVICE_ACCOUNT_JSON",
    status: fbConfigured ? "pass" : "warn",
    detail: fbConfigured ? "configured" : "not set — backup sync disabled",
  });

  if (fbConfigured) {
    try {
      const fbStatus = await getFirebaseBackupStatus();
      results.push({
        id: "firebase-backup-status",
        layer: "backend",
        name: "Firestore backup",
        path: "governance/*",
        status: fbStatus.available ? "pass" : "fail",
        detail: fbStatus.last_backup_at
          ? `last backup ${fbStatus.last_backup_at} (${fbStatus.last_snapshot_id})`
          : "no backup run yet — npm run backup:firebase",
      });
    } catch (e) {
      results.push({
        id: "firebase-backup-status",
        layer: "backend",
        name: "Firestore backup",
        path: "governance/*",
        status: "fail",
        detail: e instanceof Error ? e.message : "unavailable",
      });
    }
  }

  // --- Static registry (code present) ---
  for (const unit of ALL_STATIC_UNITS) {
    if (results.some((r) => r.id === unit.id)) continue;
    results.push(resultFromStatic(unit, "pass", "registered in codebase"));
  }

  const summary = {
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
    warn: results.filter((r) => r.status === "warn").length,
    skip: results.filter((r) => r.status === "skip").length,
    total: results.length,
  };

  return { generated_at: new Date().toISOString(), summary, results };
}
