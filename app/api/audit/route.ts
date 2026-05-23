import { NextResponse } from "next/server";
import { requirePermission, ForbiddenError } from "@/lib/auth/require-permission";
import { getAuditLogs } from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    const { supabase } = await requirePermission("view_audit_logs", "org-global");
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "100");
    const { data, error } = await getAuditLogs(supabase, limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ logs: data });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
}
