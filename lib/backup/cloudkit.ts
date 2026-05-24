import { createServiceClient } from "../supabase/server";
import type { BackupResult } from "./types";

const TABLES = ["audit_logs", "rd_evidence_records", "rd_projects", "user_role_assignments", "profiles", "approval_requests"];

export function isCloudkitConfigured() {
  return true;
}

export async function exportForCloudkit(): Promise<BackupResult & { records: Record<string, unknown>[] }> {
  const supabase = await createServiceClient();
  const snapshotId = new Date().toISOString().replace(/[:.]/g, "-");
  const tables: BackupResult["tables"] = {};
  const records: Record<string, unknown>[] = [];

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(5000).order("created_at", { ascending: false });
      if (error) {
        tables[table] = { count: 0, error: error.message };
        continue;
      }
      const rows = data ?? [];
      for (const row of rows) {
        records.push({
          recordType: `WCS_${table.toUpperCase()}`,
          fields: Object.entries(row as Record<string, unknown>).map(([key, value]) => ({
            key,
            value: { stringValue: String(value ?? "") },
          })),
          createdAt: (row as any).created_at ?? new Date().toISOString(),
        });
      }
      tables[table] = { count: rows.length };
    } catch (e) {
      tables[table] = { count: 0, error: e instanceof Error ? e.message : "unknown" };
    }
  }

  return {
    ok: true,
    target: "cloudkit",
    snapshotId,
    tables,
    records,
  };
}
