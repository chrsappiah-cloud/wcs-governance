"use server";

import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit/log-action";
import { requirePermission } from "@/lib/auth/requirePermission";
import { requireStaff } from "@/lib/auth/requireStaff";
import { buildEvidencePack } from "@/lib/rd/evidence-pack";
import { getProjectsForScope, getScopeKeyForProject } from "@/lib/rd/scope";
import { EVIDENCE_TYPES, type EvidenceType } from "@/lib/rd/types";

function parseEvidenceType(value: string): EvidenceType {
  if (!EVIDENCE_TYPES.includes(value as EvidenceType)) {
    throw new Error(`Invalid evidence_type: ${value}`);
  }
  return value as EvidenceType;
}

export async function createRdEvidenceRecord(formData: FormData) {
  const rdProjectId = Number(formData.get("rd_project_id"));
  const evidenceType = parseEvidenceType(String(formData.get("evidence_type")));
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || undefined;
  const linkedCommit = String(formData.get("linked_commit") ?? "").trim() || undefined;
  const linkedBuild = String(formData.get("linked_build") ?? "").trim() || undefined;
  const linkedCostRef = String(formData.get("linked_cost_ref") ?? "").trim() || undefined;

  if (!rdProjectId || !title) {
    return { error: "Project and title are required." };
  }

  const { supabase: lookupClient } = await requireStaff();
  const { scopeKey } = await getScopeKeyForProject(lookupClient, rdProjectId);
  const { supabase, user } = await requirePermission("create_rd_record", scopeKey);

  const { data, error } = await supabase
    .from("rd_evidence_records")
    .insert({
      rd_project_id: rdProjectId,
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

  if (error) return { error: error.message };

  await logAction(supabase, {
    action: "create_rd_record",
    entityType: "rd_evidence_records",
    entityId: String(data.id),
    scopeKey,
    afterState: { rd_project_id: rdProjectId, evidence_type: evidenceType, title },
  });

  revalidatePath("/rd-projects");
  return { ok: true, id: data.id };
}

export async function exportRdEvidencePack(formData: FormData) {
  const scopeKey = String(formData.get("scope_key") ?? "wcs-platform-rd-2026");
  const since = String(formData.get("since") ?? "").trim() || undefined;

  const { supabase } = await requirePermission("export_evidence_pack", scopeKey);

  const projects = await getProjectsForScope(supabase, scopeKey);
  const ids = projects.map((p) => p.id);

  const { data: evidence, error } = await supabase
    .from("rd_evidence_records")
    .select(
      "id, rd_project_id, evidence_type, title, summary, linked_commit, linked_build, linked_cost_ref, recorded_at"
    )
    .in("rd_project_id", ids.length ? ids : [-1])
    .order("recorded_at", { ascending: false });

  if (error) return { error: error.message };

  const pack = buildEvidencePack(scopeKey, projects, evidence ?? [], since);

  await logAction(supabase, {
    action: "export_evidence_pack",
    entityType: "rd_projects",
    entityId: scopeKey,
    scopeKey,
    afterState: {
      since: since ?? null,
      project_count: projects.length,
      evidence_count: pack.evidence.length,
    },
  });

  return { ok: true, pack };
}
