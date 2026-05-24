import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/requirePermission";
import { backupGovernanceToR2 } from "@/lib/backup/cloudflare";

export async function POST() {
  try {
    await requirePermission("view_audit_logs", "org-global");
    const result = await backupGovernanceToR2();
    if (!result.ok) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Backup failed" },
      { status: 403 }
    );
  }
}
