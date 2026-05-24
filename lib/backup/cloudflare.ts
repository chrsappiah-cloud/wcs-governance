import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createServiceClient } from "../supabase/server";
import type { BackupResult } from "./types";

const TABLES = ["audit_logs", "rd_evidence_records", "rd_projects", "user_role_assignments", "profiles", "approval_requests"];

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;

  if (!accountId || !accessKey || !secretKey || !bucket) return null;

  return {
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    }),
    bucket,
  };
}

export function isR2Configured() {
  return !!(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_SECRET_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET
  );
}

export async function backupGovernanceToR2(): Promise<BackupResult> {
  const r2 = getR2Client();
  if (!r2) return { ok: false, target: "cloudflare-r2", snapshotId: "", tables: {}, error: "R2 not configured" };

  const supabase = await createServiceClient();
  const snapshotId = new Date().toISOString().replace(/[:.]/g, "-");
  const tables: BackupResult["tables"] = {};

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(5000).order("created_at", { ascending: false });
      if (error) {
        tables[table] = { count: 0, error: error.message };
        continue;
      }
      const key = `governance/${snapshotId}/${table}.json`;
      await r2.client.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: key,
          Body: JSON.stringify({ snapshotId, table, rows: data ?? [], exportedAt: new Date().toISOString() }),
          ContentType: "application/json",
        })
      );
      tables[table] = { count: (data ?? []).length };
    } catch (e) {
      tables[table] = { count: 0, error: e instanceof Error ? e.message : "unknown" };
    }
  }

  const manifestKey = `governance/${snapshotId}/manifest.json`;
  const manifest = { snapshotId, tables, exportedAt: new Date().toISOString(), target: "cloudflare-r2" };
  await r2.client.send(
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: manifestKey,
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
    })
  );

  const latestKey = `governance/latest.json`;
  await r2.client.send(
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: latestKey,
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
    })
  );

  return { ok: true, target: "cloudflare-r2", snapshotId, tables };
}

export async function getR2BackupStatus() {
  return { configured: isR2Configured() };
}
