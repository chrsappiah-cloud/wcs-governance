export interface BackupResult {
  ok: boolean;
  target: string;
  snapshotId: string;
  tables: Record<string, { count: number; error?: string }>;
  error?: string;
}

export interface BackupTable {
  name: string;
  rows: Record<string, unknown>[];
}
