import { loadEnvLocal } from "../lib/env/load-local";
loadEnvLocal();

import { backupGovernanceToR2 } from "../lib/backup/cloudflare";
import { exportForIcloud } from "../lib/backup/icloud";
import { exportForCloudkit } from "../lib/backup/cloudkit";
import { backupGovernanceToFirebase } from "../lib/firebase/backup";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(label: string, fn: () => Promise<any>) {
  process.stdout.write(`${label}... `);
  try {
    const result = await fn();
    if (result.ok) {
      console.log(`✓ (snapshot: ${result.snapshotId ?? "—"})`);
    } else {
      console.log(`✗ ${result.target}: ${(result as any).error ?? "failed"}`);
    }
    return result;
  } catch (e) {
    console.log(`✗ ${e instanceof Error ? e.message : "error"}`);
    return { ok: false, target: label };
  }
}

async function main() {
  console.log("WCS Governance — Full Backup\n");

  const results = await Promise.all([
    run("Firebase (Firestore)", () => backupGovernanceToFirebase()),
    run("Cloudflare R2", () => backupGovernanceToR2()),
    run("iCloud export", () => exportForIcloud().then((r) => r)),
    run("CloudKit export", () => exportForCloudkit().then((r) => r)),
  ]);

  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
