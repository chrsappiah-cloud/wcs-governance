import { loadEnvLocal } from "../lib/env/load-local";
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const USERS = [
  { email: "support@myworldclass.org", password: "support", fullName: "Support Team", roleKey: "support_lead", scopeKeys: ["org-global", "website-main"] },
  { email: "admin@myworldclass.org", password: "admin", fullName: "Admin Team", roleKey: "platform_admin", scopeKeys: ["org-global"] },
];

async function supabaseFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      ...options.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  for (const u of USERS) {
    console.log(`\n--- ${u.email} ---`);

    const existingAuth = await supabaseFetch(`/auth/v1/admin/users`, {}).catch(() => null);
    let foundUser = existingAuth?.users?.find((usr: any) => usr.email === u.email);
    let userId: string;

    if (foundUser) {
      userId = foundUser.id;
      console.log(`Auth user already exists: ${userId}`);
    } else {
      const authResult = await supabaseFetch("/auth/v1/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { full_name: u.fullName },
        }),
      });
      userId = authResult.id;
      console.log(`Auth user created: ${userId}`);
    }

    await supabaseFetch("/rest/v1/profiles", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        id: userId,
        email: u.email,
        full_name: u.fullName,
        status: "active",
      }),
    });
    console.log(`Profile upserted.`);

    const roles: any[] = await supabaseFetch(`/rest/v1/roles?key=eq.${u.roleKey}&select=id`, {
      headers: { Prefer: "return=representation" },
    });
    if (!roles?.length) {
      console.error(`Role "${u.roleKey}" not found.`);
      continue;
    }

    for (const scopeKey of u.scopeKeys) {
      const scopes: any[] = await supabaseFetch(`/rest/v1/resource_scopes?key=eq.${scopeKey}&select=id`, {
        headers: { Prefer: "return=representation" },
      });
      if (!scopes?.length) {
        console.error(`Scope "${scopeKey}" not found.`);
        continue;
      }

      try {
        await supabaseFetch("/rest/v1/user_role_assignments", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId,
            role_id: roles[0].id,
            scope_id: scopes[0].id,
            assigned_by: userId,
          }),
        });
        console.log(`Assigned ${u.roleKey} on "${scopeKey}".`);
      } catch (err: any) {
        if (err.message?.includes("23505")) {
          console.log(`Role already assigned on "${scopeKey}".`);
        } else {
          console.error(`Failed to assign role on "${scopeKey}":`, err.message);
        }
      }
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
