import type { SupabaseClient } from "@supabase/supabase-js";

export async function getRoleAssignments(supabase: SupabaseClient) {
  return supabase
    .from("user_role_assignments")
    .select("id, user_id, roles(key, name), resource_scopes(key, label), profiles!user_role_assignments_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });
}

export async function getRdProjects(supabase: SupabaseClient) {
  return supabase
    .from("rd_projects")
    .select("id, title, status, technical_uncertainty, objective, resource_scopes(label, key)")
    .order("created_at", { ascending: false });
}

export async function getRdEvidence(supabase: SupabaseClient, limit = 20) {
  return supabase
    .from("rd_evidence_records")
    .select("id, title, evidence_type, recorded_at, rd_projects(title)")
    .order("recorded_at", { ascending: false })
    .limit(limit);
}

export async function getAuditLogs(supabase: SupabaseClient, limit = 100) {
  return supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, scope_key, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getMyPermissions(supabase: SupabaseClient) {
  return supabase.rpc("my_permissions");
}

export async function getPendingApprovalsCount(supabase: SupabaseClient) {
  return supabase
    .from("approval_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
}
