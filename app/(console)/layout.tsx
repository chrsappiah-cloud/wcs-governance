import Link from "next/link";
import { requireStaff } from "@/lib/auth/requireStaff";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/access", label: "Access" },
  { href: "/rd-projects", label: "R&D Projects" },
  { href: "/grants", label: "Grants" },
  { href: "/audit", label: "Audit" },
  { href: "/system", label: "System" },
];

const ADMIN_ONLY = "/governance";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { claims } = await requireStaff();
  const role = String(claims.org_role ?? "");
  const isAdminOrFounder = role === "founder_admin" || role === "platform_admin";

  return (
    <div className="console-grid">
      <aside className="console-aside">
        <div className="mb-6 font-semibold">WCS Console</div>
        <nav className="console-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {isAdminOrFounder && (
            <Link href={ADMIN_ONLY}>Governance</Link>
          )}
          {role === "founder_admin" && (
            <Link href="/admin/students">Students</Link>
          )}
        </nav>
        <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.75rem" }}>
          Role: {String(claims.org_role ?? "staff")}
        </p>
      </aside>
      <main className="console-main">{children}</main>
    </div>
  );
}
