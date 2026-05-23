"use server";

import { logAction } from "@/lib/audit/log-action";
import { requirePermission } from "@/lib/auth/requirePermission";
import { getProjectByScopeKey } from "@/lib/rd/scope";

export async function exportMonthlyRDEvidence(scopeKey: string, year: number, month: number) {
  if (!scopeKey || !year || !month || month < 1 || month > 12) {
    return { success: false as const, error: "Invalid scope or period" };
  }

  try {
    const { supabase } = await requirePermission("export_evidence_pack", scopeKey);

    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
    const end = new Date(Date.UTC(year, month, 1)).toISOString();

    const project = await getProjectByScopeKey(supabase, scopeKey);
    if (!project) {
      return { success: false as const, error: "R&D project not found" };
    }

    const { data: records, error: recordsError } = await supabase
      .from("rd_evidence_records")
      .select(
        "id, evidence_type, title, summary, linked_commit, linked_build, linked_cost_ref, recorded_by, recorded_at"
      )
      .eq("rd_project_id", project.id)
      .gte("recorded_at", start)
      .lt("recorded_at", end)
      .order("recorded_at", { ascending: true });

    if (recordsError) {
      return { success: false as const, error: "Failed to load records" };
    }

    await logAction(supabase, {
      action: "export_evidence_pack",
      entityType: "rd_projects",
      entityId: scopeKey,
      scopeKey,
      afterState: { year, month, record_count: records?.length ?? 0 },
    });

    return {
      success: true as const,
      project,
      period: { year, month },
      records: records ?? [],
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Export failed",
    };
  }
}
