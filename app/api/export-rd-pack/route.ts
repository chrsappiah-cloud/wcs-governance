import { NextResponse } from "next/server";
import { requirePermission, ForbiddenError } from "@/lib/auth/require-permission";
import { logAction } from "@/lib/audit/log-action";

export async function POST(request: Request) {
  try {
    const { supabase } = await requirePermission("export_evidence_pack", "org-global");
    const body = await request.json();
    const scopeKey = body.scope_key ?? "etherealveil-rd-2026";

    const { data: projects, error: pErr } = await supabase
      .from("rd_projects")
      .select("*, resource_scopes(key, label)");

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    const filtered = (projects ?? []).filter(
      (p: { resource_scopes?: { key?: string } }) => p.resource_scopes?.key === scopeKey
    );
    const ids = filtered.map((p: { id: number }) => p.id);

    const { data: evidence, error: eErr } = await supabase
      .from("rd_evidence_records")
      .select("*")
      .in("rd_project_id", ids.length ? ids : [-1]);

    if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 });

    const pack = { generated_at: new Date().toISOString(), scope_key: scopeKey, projects: filtered, evidence };

    await logAction(supabase, {
      action: "export_evidence_pack",
      entityType: "rd_projects",
      entityId: scopeKey,
      scopeKey,
      afterState: { project_count: filtered.length, evidence_count: evidence?.length ?? 0 },
    });

    return NextResponse.json({ pack });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}
