import type { SupabaseClient } from "@supabase/supabase-js";

type AuditInput = {
  action: string;
  entityType: string;
  entityId: string;
  scopeKey?: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
};

export async function logAction(supabase: SupabaseClient, input: AuditInput) {
  const { data, error } = await supabase.rpc("write_audit_log", {
    p_action: input.action,
    p_entity_type: input.entityType,
    p_entity_id: input.entityId,
    p_scope_key: input.scopeKey ?? null,
    p_before_state: input.beforeState ?? null,
    p_after_state: input.afterState ?? null,
  });

  if (error) {
    console.error("audit log failed:", error.message);
  }

  return data;
}
