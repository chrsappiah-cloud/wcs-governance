import { NextResponse } from "next/server";
import { logAction } from "@/lib/audit/log-action";
import { requirePermission, ForbiddenError } from "@/lib/auth/requirePermission";
import { requireStaff } from "@/lib/auth/requireStaff";
import { EVIDENCE_TYPES, type EvidenceType } from "@/lib/rd/types";
import { getScopeKeyForProject } from "@/lib/rd/scope";

function parseEvidenceType(value: string): EvidenceType | null {
  return EVIDENCE_TYPES.includes(value as EvidenceType) ? (value as EvidenceType) : null;
}

export async function GET(request: Request) {
  try {
    const { supabase } = await requireStaff();
    const url = new URL(request.url);
    const scopeKey = url.searchParams.get("scope_key");
    const projectId = url.searchParams.get("rd_project_id");
    const limit = Number(url.searchParams.get("limit") ?? "50");

    let query = supabase
      .from("rd_evidence_records")
      .select(
        "id, rd_project_id, evidence_type, title, summary, linked_commit, linked_build, linked_cost_ref, recorded_at, rd_projects(title, resource_scopes(key))"
      )
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq("rd_project_id", Number(projectId));
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const filtered = scopeKey
      ? (data ?? []).filter(
          (row) =>
            (row.rd_projects as { resource_scopes?: { key?: string } } | null)?.resource_scopes?.key ===
            scopeKey
        )
      : data;

    return NextResponse.json({ evidence: filtered });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rdProjectId = Number(body.rd_project_id);
    const evidenceType = parseEvidenceType(String(body.evidence_type ?? ""));
    const title = String(body.title ?? "").trim();

    if (!rdProjectId || !evidenceType || !title) {
      return NextResponse.json({ error: "rd_project_id, evidence_type, and title are required" }, { status: 400 });
    }

    const { supabase: lookup } = await requireStaff();
    const { scopeKey } = await getScopeKeyForProject(lookup, rdProjectId);
    const { supabase, user } = await requirePermission("create_rd_record", scopeKey);

    const { data, error } = await supabase
      .from("rd_evidence_records")
      .insert({
        rd_project_id: rdProjectId,
        evidence_type: evidenceType,
        title,
        summary: body.summary ?? null,
        linked_commit: body.linked_commit ?? null,
        linked_build: body.linked_build ?? null,
        linked_cost_ref: body.linked_cost_ref ?? null,
        recorded_by: user.id,
        payload: body.payload ?? {},
      })
      .select("id, title, evidence_type, recorded_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAction(supabase, {
      action: "create_rd_record",
      entityType: "rd_evidence_records",
      entityId: String(data.id),
      scopeKey,
      afterState: body,
    });

    return NextResponse.json({ record: data }, { status: 201 });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}
