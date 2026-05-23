export type SystemLayer = "frontend" | "middleware" | "backend" | "database" | "auth";

export type StaticUnit = {
  id: string;
  layer: SystemLayer;
  name: string;
  path: string;
  description: string;
};

export const FRONTEND_ROUTES: StaticUnit[] = [
  { id: "fe-marketing", layer: "frontend", name: "Marketing home", path: "/", description: "Public landing" },
  { id: "fe-about", layer: "frontend", name: "About", path: "/about", description: "Public about page" },
  { id: "fe-login", layer: "frontend", name: "Staff login", path: "/login", description: "Supabase Auth sign-in" },
  { id: "fe-dashboard", layer: "frontend", name: "Dashboard", path: "/dashboard", description: "Console overview" },
  { id: "fe-access", layer: "frontend", name: "Access control", path: "/access", description: "Role assignments" },
  { id: "fe-rd-projects", layer: "frontend", name: "R&D projects", path: "/rd-projects", description: "Projects + evidence form" },
  { id: "fe-rd-monthly", layer: "frontend", name: "R&D monthly pack", path: "/rd-projects/monthly", description: "Monthly evidence view" },
  { id: "fe-grants", layer: "frontend", name: "Grants", path: "/grants", description: "Grant reporting" },
  { id: "fe-audit", layer: "frontend", name: "Audit", path: "/audit", description: "Audit log viewer" },
  { id: "fe-content", layer: "frontend", name: "Content", path: "/content", description: "Website content ops" },
  { id: "fe-ios", layer: "frontend", name: "iOS releases", path: "/ios-releases", description: "Release checklist" },
  { id: "fe-settings", layer: "frontend", name: "Settings", path: "/settings", description: "Staff profile" },
  { id: "fe-system", layer: "frontend", name: "System diagnostics", path: "/system", description: "This page" },
];

export const MIDDLEWARE_UNITS: StaticUnit[] = [
  {
    id: "mw-console-guard",
    layer: "middleware",
    name: "Console auth redirect",
    path: "middleware.ts",
    description: "Unauthenticated → /login for console routes",
  },
  {
    id: "mw-login-redirect",
    layer: "middleware",
    name: "Logged-in login redirect",
    path: "middleware.ts",
    description: "Authenticated /login → /dashboard",
  },
];

export const BACKEND_ROUTES: StaticUnit[] = [
  { id: "api-health", layer: "backend", name: "Health", path: "/api/health", description: "Supabase connectivity probe" },
  { id: "api-diagnostics", layer: "backend", name: "System diagnostics", path: "/api/system/diagnostics", description: "Full stack report" },
  { id: "api-approvals", layer: "backend", name: "Approvals", path: "/api/approvals", description: "GET/POST approval requests" },
  { id: "api-audit", layer: "backend", name: "Audit API", path: "/api/audit", description: "Audit log JSON" },
  { id: "api-rd-evidence", layer: "backend", name: "R&D evidence API", path: "/api/rd-evidence", description: "GET/POST evidence records" },
  { id: "api-export-rd", layer: "backend", name: "Export R&D pack", path: "/api/export-rd-pack", description: "POST evidence pack JSON" },
];

export const DATABASE_TABLES: StaticUnit[] = [
  { id: "db-profiles", layer: "database", name: "profiles", path: "public.profiles", description: "Staff profiles" },
  { id: "db-roles", layer: "database", name: "roles", path: "public.roles", description: "RBAC roles" },
  { id: "db-permissions", layer: "database", name: "permissions", path: "public.permissions", description: "Atomic permissions" },
  { id: "db-scopes", layer: "database", name: "resource_scopes", path: "public.resource_scopes", description: "Scope keys" },
  { id: "db-assignments", layer: "database", name: "user_role_assignments", path: "public.user_role_assignments", description: "Role assignments" },
  { id: "db-approvals", layer: "database", name: "approval_requests", path: "public.approval_requests", description: "Approval workflow" },
  { id: "db-audit", layer: "database", name: "audit_logs", path: "public.audit_logs", description: "Application audit trail" },
  { id: "db-rd-projects", layer: "database", name: "rd_projects", path: "public.rd_projects", description: "R&D project registry" },
  { id: "db-rd-evidence", layer: "database", name: "rd_evidence_records", path: "public.rd_evidence_records", description: "R&D evidence" },
];

export const DATABASE_RPC: StaticUnit[] = [
  { id: "rpc-permission", layer: "database", name: "user_has_permission_for_scope", path: "public.user_has_permission_for_scope", description: "Scope permission check" },
  { id: "rpc-founder", layer: "database", name: "is_founder_admin", path: "public.is_founder_admin", description: "Founder override" },
  { id: "rpc-my-perms", layer: "database", name: "my_permissions", path: "public.my_permissions", description: "Effective permissions for session" },
  { id: "rpc-audit-write", layer: "database", name: "write_audit_log", path: "public.write_audit_log", description: "Application audit helper" },
];

export const AUTH_UNITS: StaticUnit[] = [
  { id: "auth-server-client", layer: "auth", name: "getServerSupabase", path: "lib/supabase/server.ts", description: "SSR cookie client" },
  { id: "auth-browser-client", layer: "auth", name: "createClient (browser)", path: "lib/supabase/client.ts", description: "Browser Auth client" },
  { id: "auth-require-staff", layer: "auth", name: "requireStaff", path: "lib/auth/requireStaff.ts", description: "JWT staff gate" },
  { id: "auth-require-perm", layer: "auth", name: "requirePermission", path: "lib/auth/requirePermission.ts", description: "RPC permission gate" },
  { id: "auth-jwt-hook", layer: "auth", name: "custom_access_token_hook", path: "003_rls.sql", description: "is_staff, org_role claims" },
];

export const SERVER_ACTIONS: StaticUnit[] = [
  { id: "sa-create-rd", layer: "backend", name: "createRDEvidence", path: "rd-projects/actions.ts", description: "Log R&D evidence" },
  { id: "sa-export-monthly", layer: "backend", name: "exportMonthlyRDEvidence", path: "rd-projects/export-actions.ts", description: "Monthly pack export" },
];

export const ALL_STATIC_UNITS = [
  ...FRONTEND_ROUTES,
  ...MIDDLEWARE_UNITS,
  ...BACKEND_ROUTES,
  ...SERVER_ACTIONS,
  ...DATABASE_TABLES,
  ...DATABASE_RPC,
  ...AUTH_UNITS,
];
