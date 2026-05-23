import { NextResponse } from "next/server";
import { requirePermission, ForbiddenError } from "@/lib/auth/requirePermission";
import { logAction } from "@/lib/audit/log-action";

export async function GET() {
  try {
    const { supabase } = await requirePermission("view_audit_logs", "org-global");
    const { data, error } = await supabase.from("approval_requests").select("*").limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ approvals: data });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requirePermission("manage_access", "org-global");
    const body = await request.json();
    const { data, error } = await supabase.rpc("assign_role_for_scope", {
      p_user_id: body.user_id,
      p_role_key: body.role_key,
      p_scope_key: body.scope_key,
      p_assigned_by: user.id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAction(supabase, {
      action: "role_assigned",
      entityType: "user_role_assignments",
      entityId: String(data),
      scopeKey: body.scope_key,
      afterState: body,
    });
    return NextResponse.json({ assignment_id: data });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}
