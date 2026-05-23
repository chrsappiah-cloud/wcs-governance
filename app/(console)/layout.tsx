import Link from "next/link";
import { requireStaff } from "@/lib/auth/require-staff";
import { getMyPermissions } from "@/lib/db/queries";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/access", label: "Access", permission: "manage_access", scope: "org-global" },
  { href: "/content", label: "Content", permission: "publish_content", scope: "website-main" },
  { href: "/ios-releases", label: "iOS Releases", permission: "manage_release", scope: "etherealveil-ios" },
  { href: "/rd-projects", label: "R&D Projects", permission: "create_rd_record", scope: "etherealveil-rd-2026" },
  { href: "/grants", label: "Grants", permission: "view_finance", scope: "grant-rd-funding-2026" },
  { href: "/audit", label: "Audit", permission: "view_audit_logs", scope: "org-global" },
  { href: "/settings", label: "Settings" },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { supabase, claims } = await requireStaff();
  const { data: permissions } = await getMyPermissions(supabase);

  const permSet = new Set(
    (permissions ?? []).map((p: { permission_key: string; scope_key: string }) =>
      `${p.permission_key}@${p.scope_key}`
    )
  );
  const isFounder = claims.founder_access === true || claims.org_role === "founder_admin";

  const visibleNav = NAV.filter((item) => {
    if (!item.permission || !item.scope) return true;
    if (isFounder) return true;
    return permSet.has(`${item.permission}@${item.scope}`);
  });

  return (
    <div className="console-grid">
      <aside style={{ borderRight: "1px solid var(--border)", padding: "1rem" }}>
        <strong>WCS Console</strong>
        <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.35rem" }}>
          Role: {String(claims.org_role ?? "staff")}
        </p>
        <nav className="console-nav" style={{ marginTop: "1.5rem", display: "grid", gap: "0.25rem" }}>
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ padding: "1.5rem" }}>{children}</main>
    </div>
  );
}
