import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEvidencePack,
  buildEvidencePackMarkdown,
  filterEvidenceBySince,
  groupEvidenceByType,
} from "../../lib/rd/evidence-pack";
import { monthlyReportFilename, buildMonthlyReportMarkdown } from "../../lib/rd/monthly-report";

describe("R&D evidence pack (lib/rd/evidence-pack)", () => {
  it("filters evidence by since date", () => {
    const rows = [
      { id: 1, rd_project_id: 1, evidence_type: "experiment", title: "A", recorded_at: "2026-05-01T00:00:00Z" },
      { id: 2, rd_project_id: 1, evidence_type: "result", title: "B", recorded_at: "2026-04-01T00:00:00Z" },
    ];
    const filtered = filterEvidenceBySince(rows, "2026-05-01");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].title, "A");
  });

  it("groups evidence by type", () => {
    const rows = [
      { id: 1, rd_project_id: 1, evidence_type: "experiment", title: "A", recorded_at: "2026-05-01T00:00:00Z" },
      { id: 2, rd_project_id: 1, evidence_type: "experiment", title: "B", recorded_at: "2026-05-02T00:00:00Z" },
    ];
    const grouped = groupEvidenceByType(rows);
    assert.equal(grouped.experiment?.length, 2);
  });

  it("builds markdown pack", () => {
    const md = buildEvidencePackMarkdown(
      "wcs-platform-rd-2026",
      [{ id: 1, title: "Test", status: "active" }],
      [{ id: 1, rd_project_id: 1, evidence_type: "experiment", title: "Exp 1", recorded_at: "2026-05-01T00:00:00Z" }],
      "2026-05-01"
    );
    assert.match(md, /R&D Evidence Pack/);
    assert.match(md, /Exp 1/);
  });

  it("builds full evidence pack object", () => {
    const pack = buildEvidencePack(
      "wcs-platform-rd-2026",
      [{ id: 1, title: "Test", status: "active" }],
      []
    );
    assert.equal(pack.scope_key, "wcs-platform-rd-2026");
    assert.ok(pack.markdown);
  });
});

describe("Monthly report (lib/rd/monthly-report)", () => {
  it("formats filename", () => {
    assert.equal(monthlyReportFilename("wcs-platform-rd-2026", 2026, 5), "wcs-platform-rd-2026-2026-05.md");
  });

  it("builds monthly markdown", () => {
    const md = buildMonthlyReportMarkdown(
      "wcs-platform-rd-2026",
      {
        id: 1,
        title: "Platform R&D",
        objective: "Build governance",
        technical_uncertainty: "Unknown scale",
      },
      2026,
      5,
      []
    );
    assert.match(md, /Platform R&D/);
    assert.match(md, /2026-05/);
  });
});

describe("System registry (lib/system/registry)", () => {
  it("registers all layers", async () => {
    const { ALL_STATIC_UNITS, FRONTEND_ROUTES, DATABASE_TABLES } = await import("../../lib/system/registry");
    assert.ok(FRONTEND_ROUTES.length >= 10);
    assert.ok(DATABASE_TABLES.length >= 9);
    assert.ok(ALL_STATIC_UNITS.some((u) => u.id === "fe-system"));
  });
});
