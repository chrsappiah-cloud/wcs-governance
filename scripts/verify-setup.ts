/**
 * Verify governance stack is wired correctly against your Supabase project.
 *
 * Usage:
 *   cp .env.example .env.local   # fill in Supabase keys
 *   npm run verify:setup
 */
import { createClient } from "@supabase/supabase-js";

type Check = { name: string; ok: boolean; detail: string };

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

async function main() {
  const checks: Check[] = [];
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const service = env("SUPABASE_SERVICE_ROLE_KEY");

  checks.push({
    name: "NEXT_PUBLIC_SUPABASE_URL",
    ok: Boolean(url),
    detail: url ? "set" : "missing — add to .env.local",
  });
  checks.push({
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ok: Boolean(anon),
    detail: anon ? "set" : "missing — add to .env.local",
  });
  checks.push({
    name: "SUPABASE_SERVICE_ROLE_KEY",
    ok: Boolean(service),
    detail: service ? "set" : "missing — needed for verify script + exports",
  });

  if (!url || !service) {
    printReport(checks);
    process.exit(1);
  }

  const supabase = createClient(url, service, { auth: { persistSession: false } });

  const { data: roles, error: rolesError } = await supabase.from("roles").select("key").limit(20);
  if (rolesError) {
    checks.push({
      name: "roles table",
      ok: false,
      detail: rolesError.message.includes("does not exist")
        ? "not found — run supabase/migrations/001–004"
        : rolesError.message,
    });
  } else {
    checks.push({
      name: "roles seeded",
      ok: (roles?.length ?? 0) >= 10,
      detail: `${roles?.length ?? 0} roles (expect founder_admin, engineer, …)`,
    });
  }

  const { data: scopes, error: scopesError } = await supabase.from("resource_scopes").select("key");
  if (scopesError) {
    checks.push({ name: "resource_scopes", ok: false, detail: scopesError.message });
  } else {
    const keys = (scopes ?? []).map((s) => s.key);
    checks.push({
      name: "resource_scopes seeded",
      ok: keys.includes("org-global") && keys.includes("website-main"),
      detail: keys.join(", ") || "empty",
    });
  }

  const { data: projects, error: projectsError } = await supabase
    .from("rd_projects")
    .select("id, title, resource_scopes(key)")
    .limit(5);
  if (projectsError) {
    checks.push({ name: "rd_projects", ok: false, detail: projectsError.message });
  } else {
    checks.push({
      name: "rd_projects seeded",
      ok: (projects?.length ?? 0) > 0,
      detail: `${projects?.length ?? 0} project(s) visible`,
    });
  }

  const { data: assignments, error: founderError } = await supabase
    .from("user_role_assignments")
    .select("user_id, roles(key), resource_scopes(key)");
  if (founderError) {
    checks.push({ name: "founder_admin assignment", ok: false, detail: founderError.message });
  } else {
    const founderRows = (assignments ?? []).filter(
      (r) =>
        (r.roles as { key?: string } | null)?.key === "founder_admin" &&
        (r.resource_scopes as { key?: string } | null)?.key === "org-global"
    );
    checks.push({
      name: "founder_admin on org-global",
      ok: founderRows.length > 0,
      detail: founderRows.length
        ? `${founderRows.length} founder assignment(s) — sign out/in after seed to refresh JWT`
        : "none — sign up at /login then run supabase/seed-founder.sql",
    });
  }

  const { error: rpcError } = await supabase.rpc("user_has_permission_for_scope", {
    p_user_id: "00000000-0000-0000-0000-000000000000",
    p_permission_key: "manage_access",
    p_scope_key: "org-global",
  });
  checks.push({
    name: "RPC user_has_permission_for_scope",
    ok: !rpcError,
    detail: rpcError ? rpcError.message : "callable",
  });

  printReport(checks);
  const failed = checks.filter((c) => !c.ok).length;
  if (failed) {
    console.log("\nNext steps:");
    console.log("  1. Run migrations 001→004 in Supabase SQL editor (or: supabase db push)");
    console.log("  2. Enable Auth hook: custom_access_token_hook (see supabase/config.toml)");
    console.log("  3. Sign up at /login, then run supabase/seed-founder.sql");
    console.log("  4. npm run dev → test /dashboard and /access");
    process.exit(1);
  }
  console.log("\nAll checks passed. Run: npm run dev");
}

function printReport(checks: Check[]) {
  console.log("\nWCS Governance — setup verification\n");
  for (const c of checks) {
    console.log(`${c.ok ? "✓" : "✗"} ${c.name}: ${c.detail}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
