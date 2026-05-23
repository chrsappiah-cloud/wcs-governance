#!/usr/bin/env node
import { loadEnvLocal } from "../lib/env/load-local";
import { backupGovernanceToFirebase, getFirebaseBackupStatus } from "../lib/firebase/backup";

loadEnvLocal();

async function main() {
  console.log("WCS → Firebase backup\n");

  const before = await getFirebaseBackupStatus();
  console.log("Status before:", before);

  const result = await backupGovernanceToFirebase();
  if (!result.ok) {
    console.error(result.skipped ? "Skipped:" : "Failed:", result.error);
    process.exit(result.skipped ? 0 : 1);
  }

  console.log("Backup complete:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
