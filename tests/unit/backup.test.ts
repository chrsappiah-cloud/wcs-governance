import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("Cloudflare R2 backup", () => {
  it("isR2Configured returns false when env vars are missing", async () => {
    const { isR2Configured } = await import("../../lib/backup/cloudflare");
    assert.equal(isR2Configured(), false);
  });

  it("exports expected functions", async () => {
    const mod = await import("../../lib/backup/cloudflare");
    assert.equal(typeof mod.backupGovernanceToR2, "function");
    assert.equal(typeof mod.isR2Configured, "function");
    assert.equal(typeof mod.getR2BackupStatus, "function");
  });

  it("backupGovernanceToR2 returns error result when not configured", async () => {
    const mod = await import("../../lib/backup/cloudflare");
    const result = await mod.backupGovernanceToR2();
    assert.equal(result.ok, false);
    assert.equal(result.target, "cloudflare-r2");
    assert.match(result.error ?? "", /not configured/i);
  });
});

describe("iCloud export", () => {
  it("isIcloudConfigured returns true", async () => {
    const { isIcloudConfigured } = await import("../../lib/backup/icloud");
    assert.equal(isIcloudConfigured(), true);
  });

  it("module exports expected function", async () => {
    const mod = await import("../../lib/backup/icloud");
    assert.equal(typeof mod.exportForIcloud, "function");
  });
});

describe("CloudKit export", () => {
  it("isCloudkitConfigured returns true", async () => {
    const { isCloudkitConfigured } = await import("../../lib/backup/cloudkit");
    assert.equal(isCloudkitConfigured(), true);
  });

  it("module exports expected function", async () => {
    const mod = await import("../../lib/backup/cloudkit");
    assert.equal(typeof mod.exportForCloudkit, "function");
  });
});
