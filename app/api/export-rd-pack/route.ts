import { NextResponse } from "next/server";
import { logAction } from "@/lib/audit/log-action";
import { requirePermission, ForbiddenError } from "@/lib/auth/requirePermission";
import { buildEvidencePack } from "@/lib/rd/evidence-pack";
import { getProjectsForScope } from "@/lib/rd/scope";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scopeKey = body.scope_key ?? body.scopeKey ?? "wcs-platform-rd-2026";
    const since = body.since ?? null;

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const pack = buildEvidencePack(scopeKey, projects, evidence ?? [], since);

    await logAction(supabase, {
      action: "export_evidence_pack",
      entityType: "rd_projects",
      entityId: scopeKey,
      scopeKey,
      afterState: {
        since,
        project_count: projects.length,
        evidence_count: pack.evidence.length,
      },
    });

    return NextResponse.json({ pack });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}
