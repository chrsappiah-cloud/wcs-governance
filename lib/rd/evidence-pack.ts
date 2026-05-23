import type { RdEvidenceRow, RdProjectRow } from "./types";

export function filterEvidenceBySince(evidence: RdEvidenceRow[], since?: string | null) {
  if (!since) return evidence;
  const cutoff = new Date(since);
  if (Number.isNaN(cutoff.getTime())) return evidence;
  return evidence.filter((row) => new Date(row.recorded_at) >= cutoff);
}

export function groupEvidenceByType(evidence: RdEvidenceRow[]) {
  return evidence.reduce<Record<string, RdEvidenceRow[]>>((acc, row) => {
    const key = row.evidence_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

export function buildEvidencePackMarkdown(
  scopeKey: string,
  projects: RdProjectRow[],
  evidence: RdEvidenceRow[],
  since?: string | null
) {
  const filtered = filterEvidenceBySince(evidence, since);
  const grouped = groupEvidenceByType(filtered);
  const period = since ? `since ${since}` : "all time";
  const lines = [
    `# R&D Evidence Pack — ${scopeKey}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Period: ${period}`,
    "",
    "## Projects",
    ...projects.map((p) => `- **${p.title}** (${p.status})`),
    "",
  ];

  for (const [type, rows] of Object.entries(grouped)) {
    lines.push(`## ${type}`, "");
    for (const row of rows) {
      lines.push(`### ${row.title}`);
      if (row.summary) lines.push(row.summary);
      const links = [
        row.linked_commit ? `commit: ${row.linked_commit}` : null,
        row.linked_build ? `build: ${row.linked_build}` : null,
        row.linked_cost_ref ? `cost: ${row.linked_cost_ref}` : null,
      ].filter(Boolean);
      if (links.length) lines.push(`Links: ${links.join(" · ")}`);
      lines.push(`Recorded: ${row.recorded_at}`, "");
    }
  }

  if (!filtered.length) {
    lines.push("_No evidence records in this period._");
  }

  return lines.join("\n");
}

export function buildEvidencePack(
  scopeKey: string,
  projects: RdProjectRow[],
  evidence: RdEvidenceRow[],
  since?: string | null
) {
  const filtered = filterEvidenceBySince(evidence, since);
  return {
    generated_at: new Date().toISOString(),
    scope_key: scopeKey,
    since: since ?? null,
    projects,
    evidence: filtered,
    grouped_by_type: groupEvidenceByType(filtered),
    markdown: buildEvidencePackMarkdown(scopeKey, projects, evidence, since),
  };
}
