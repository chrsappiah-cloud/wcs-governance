"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit/log-action";
import { requirePermission } from "@/lib/auth/requirePermission";
import { getProjectByScopeKey } from "@/lib/rd/scope";
import { EVIDENCE_TYPES, type EvidenceType } from "@/lib/rd/types";

export async function createRDEvidence(formData: FormData) {
  const result = await createRDEvidenceInternal(formData);
  if (!result.success) {
    redirect(`/rd-projects?error=${encodeURIComponent(result.error ?? "Save failed")}`);
  }
  redirect("/rd-projects?saved=1");
}

export async function createRDEvidenceInternal(formData: FormData) {
  const rdProjectScopeKey = String(formData.get("rd_project_scope_key") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const evidenceType = String(formData.get("evidence_type") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const linkedCommit = String(formData.get("linked_commit") ?? "").trim() || null;
  const linkedBuild = String(formData.get("linked_build") ?? "").trim() || null;
  const linkedCostRef = String(formData.get("linked_cost_ref") ?? "").trim() || null;

  if (!rdProjectScopeKey || !title || !evidenceType) {
    return { success: false as const, error: "Missing required fields" };
  }

  if (!EVIDENCE_TYPES.includes(evidenceType as EvidenceType)) {
    return { success: false as const, error: "Invalid evidence type" };
  }

  try {
    const { supabase, user } = await requirePermission("create_rd_record", rdProjectScopeKey);

    const project = await getProjectByScopeKey(supabase, rdProjectScopeKey);
    if (!project) {
      return { success: false as const, error: "R&D project not found" };
    }

    const { data, error } = await supabase
      .from("rd_evidence_records")
      .insert({
        rd_project_id: project.id,
        evidence_type: evidenceType,
        title,
        summary,
        linked_commit: linkedCommit,
        linked_build: linkedBuild,
        linked_cost_ref: linkedCostRef,
        recorded_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return { success: false as const, error: "Insert failed" };
    }

    await logAction(supabase, {
      action: "create_rd_record",
      entityType: "rd_evidence_records",
      entityId: String(data.id),
      scopeKey: rdProjectScopeKey,
      afterState: { rd_project_id: project.id, evidence_type: evidenceType, title },
    });

    revalidatePath("/rd-projects");
    revalidatePath("/rd-projects/monthly");
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: e instanceof Error ? e.message : "Forbidden" };
  }
}
