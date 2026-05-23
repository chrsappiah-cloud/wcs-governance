"use server";

import { logAction } from "@/lib/audit/log-action";
import { requirePermission } from "@/lib/auth/requirePermission";
import { buildMonthlyReportMarkdown, fetchMonthlyEvidence } from "@/lib/rd/monthly-report";

export async function exportMonthlyRDEvidence(scopeKey: string, year: number, month: number) {
  if (!scopeKey || !year || !month || month < 1 || month > 12) {
    return { success: false as const, error: "Invalid scope or period" };
  }

  try {
    const { supabase } = await requirePermission("export_evidence_pack", scopeKey);

    const { project, records } = await fetchMonthlyEvidence(supabase, scopeKey, year, month);

    await logAction(supabase, {
      action: "export_evidence_pack",
      entityType: "rd_projects",
      entityId: scopeKey,
      scopeKey,
      afterState: { year, month, record_count: records.length },
    });

    return {
      success: true as const,
      project,
      period: { year, month },
      records,
      markdown: buildMonthlyReportMarkdown(scopeKey, project, year, month, records),
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Export failed",
    };
  }
}
