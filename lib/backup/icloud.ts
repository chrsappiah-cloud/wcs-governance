import { createServiceClient } from "../supabase/server";
import type { BackupResult } from "./types";

const TABLES = ["audit_logs", "rd_evidence_records", "rd_projects", "user_role_assignments", "profiles", "approval_requests"];

export function isIcloudConfigured() {
  return true;
}

export async function exportForIcloud(): Promise<BackupResult & { files: { name: string; content: string }[] }> {
  const supabase = await createServiceClient();
  const snapshotId = new Date().toISOString().replace(/[:.]/g, "-");
  const tables: BackupResult["tables"] = {};
  const files: { name: string; content: string }[] = [];

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(5000).order("created_at", { ascending: false });
      if (error) {
        tables[table] = { count: 0, error: error.message };
        continue;
      }
      const content = JSON.stringify({ snapshotId, table, rows: data ?? [], exportedAt: new Date().toISOString() }, null, 2);
      files.push({ name: `${table}.json`, content });
      tables[table] = { count: (data ?? []).length };
    } catch (e) {
      tables[table] = { count: 0, error: e instanceof Error ? e.message : "unknown" };
    }
  }

  const manifest = JSON.stringify({ snapshotId, tables, exportedAt: new Date().toISOString(), target: "icloud" }, null, 2);
  files.unshift({ name: "manifest.json", content: manifest });

  const archive = {
    name: `wcs-governance-${snapshotId}`,
    description: "World Class Scholars governance backup — compatible with iCloud Drive",
    exportedAt: new Date().toISOString(),
    tables: Object.fromEntries(
      Object.entries(tables).map(([k, v]) => [k, { count: v.count }])
    ),
  };
  files.unshift({ name: "archive.json", content: JSON.stringify(archive, null, 2) });

  return { ok: true, target: "icloud", snapshotId, tables, files };
}
