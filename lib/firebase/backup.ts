import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { FIRESTORE, getFirestoreDb, isFirebaseConfigured } from "./admin";

export type BackupResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  counts?: Record<string, number>;
  snapshotId?: string;
};

function serviceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function backupAuditLogMirror(input: {
  action: string;
  entityType: string;
  entityId: string;
  scopeKey?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  supabaseId?: string | number;
}) {
  const db = getFirestoreDb();
  if (!db) return;

  await db.collection(FIRESTORE.auditLogs).add({
    ...input,
    source: "supabase_mirror",
    backed_up_at: new Date().toISOString(),
  });
}

export async function backupGovernanceToFirebase(): Promise<BackupResult> {
  if (!isFirebaseConfigured()) {
    return { ok: false, skipped: true, error: "Firebase not configured (FIREBASE_SERVICE_ACCOUNT_JSON)" };
  }

  const supabase = serviceSupabase();
  const db = getFirestoreDb();
  if (!supabase) {
    return { ok: false, error: "Supabase service role not configured" };
  }
  if (!db) {
    return { ok: false, error: "Firestore unavailable" };
  }

  const snapshotId = new Date().toISOString().replace(/[:.]/g, "-");
  const counts: Record<string, number> = {};

  const tables = [
    { key: "audit_logs", collection: FIRESTORE.auditLogs },
    { key: "rd_evidence_records", collection: FIRESTORE.rdEvidence },
    { key: "rd_projects", collection: FIRESTORE.rdProjects },
    { key: "user_role_assignments", collection: FIRESTORE.roleAssignments },
  ] as const;

  for (const { key, collection } of tables) {
    const { data, error } = await supabase.from(key).select("*").limit(500);
    if (error) {
      return { ok: false, error: `${key}: ${error.message}` };
    }
    const rows = data ?? [];
    for (let i = 0; i < rows.length; i += 400) {
      const chunk = rows.slice(i, i + 400);
      const batch = db.batch();
      for (const row of chunk) {
        const id = String((row as { id: unknown }).id);
        batch.set(db.collection(collection).doc(`${snapshotId}_${id}`), {
          ...row,
          _wcs_snapshot_id: snapshotId,
          _wcs_source_table: key,
          _wcs_backed_up_at: new Date().toISOString(),
        });
      }
      await batch.commit();
    }
    counts[key] = rows.length;
  }

  await db
    .collection(FIRESTORE.snapshots)
    .doc(snapshotId)
    .set({
      snapshot_id: snapshotId,
      counts,
      source: "supabase",
      project_url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      created_at: new Date().toISOString(),
    });

  await db.collection(FIRESTORE.meta).doc("latest").set({
    last_snapshot_id: snapshotId,
    last_backup_at: new Date().toISOString(),
    counts,
  });

  return { ok: true, counts, snapshotId };
}

export async function getFirebaseBackupStatus() {
  if (!isFirebaseConfigured()) {
    return { configured: false, last_backup_at: null, last_snapshot_id: null };
  }

  const db = getFirestoreDb();
  if (!db) {
    return { configured: true, available: false, last_backup_at: null, last_snapshot_id: null };
  }

  const meta = await db.collection(FIRESTORE.meta).doc("latest").get();
  const data = meta.data();
  return {
    configured: true,
    available: true,
    last_backup_at: (data?.last_backup_at as string) ?? null,
    last_snapshot_id: (data?.last_snapshot_id as string) ?? null,
    counts: (data?.counts as Record<string, number>) ?? null,
  };
}
