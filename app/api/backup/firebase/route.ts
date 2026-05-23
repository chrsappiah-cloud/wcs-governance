import { NextResponse } from "next/server";

export const runtime = "nodejs";

import { requirePermission, ForbiddenError } from "@/lib/auth/requirePermission";
import { backupGovernanceToFirebase, getFirebaseBackupStatus } from "@/lib/firebase/backup";

export async function GET() {
  try {
    const { getFirebaseBackupStatus } = await import("@/lib/firebase/backup");
    const status = await getFirebaseBackupStatus();
    return NextResponse.json({ backup: status });
  } catch (e) {
    return NextResponse.json(
      { backup: { configured: false, error: e instanceof Error ? e.message : "unavailable" } },
      { status: 200 }
    );
  }
}

export async function POST() {
  try {
    await requirePermission("view_audit_logs", "org-global");
    const result = await backupGovernanceToFirebase();
    if (!result.ok && !result.skipped) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ backup: result });
  } catch (e) {
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw e;
  }
}
