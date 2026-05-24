import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/requirePermission";
import { exportForIcloud } from "@/lib/backup/icloud";

export async function POST() {
  try {
    await requirePermission("view_audit_logs", "org-global");
    const result = await exportForIcloud();
    if (!result.ok) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 403 }
    );
  }
}
