import type { SupabaseClient } from "@supabase/supabase-js";

export type MonthlyProject = {
  id: number;
  title: string;
  technical_uncertainty: string;
  objective: string;
};

export type MonthlyEvidenceRecord = {
  id: number;
  evidence_type: string;
  title: string;
  summary: string | null;
  linked_commit: string | null;
  linked_build: string | null;
  linked_cost_ref: string | null;
  recorded_by: string | null;
  recorded_at: string;
};

export function monthUtcRange(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
    end: new Date(Date.UTC(year, month, 1)).toISOString(),
  };
}

export function monthlyReportFilename(scopeKey: string, year: number, month: number) {
  const monthStr = String(month).padStart(2, "0");
  return `${scopeKey}-${year}-${monthStr}.md`;
}

export function buildMonthlyReportMarkdown(
  scopeKey: string,
  project: MonthlyProject,
  year: number,
  month: number,
  records: MonthlyEvidenceRecord[]
) {
  const monthStr = String(month).padStart(2, "0");
  const lines: string[] = [];

  lines.push(`# R&D Evidence Pack – ${project.title}`);
  lines.push("");
  lines.push(`Scope: \`${scopeKey}\``);
  lines.push(`Period: ${year}-${monthStr}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Objective");
  lines.push(project.objective);
  lines.push("");
  lines.push("## Technical uncertainty");
  lines.push(project.technical_uncertainty);
  lines.push("");
  lines.push("## Evidence records");
  lines.push("");

  for (const r of records) {
    lines.push(`### [${r.evidence_type}] ${r.title}`);
    lines.push(`Recorded at: ${r.recorded_at}`);
    if (r.summary) {
      lines.push("");
      lines.push(r.summary);
    }
    const meta: string[] = [];
    if (r.linked_commit) meta.push(`Commit: \`${r.linked_commit}\``);
    if (r.linked_build) meta.push(`Build: \`${r.linked_build}\``);
    if (r.linked_cost_ref) meta.push(`Cost ref: \`${r.linked_cost_ref}\``);
    if (meta.length) {
      lines.push("");
      lines.push(meta.join(" | "));
    }
    lines.push("");
  }

  if (!records.length) {
    lines.push("_No evidence records in this period._");
    lines.push("");
  }

  return lines.join("\n");
}

export async function fetchMonthlyEvidence(
  supabase: SupabaseClient,
  scopeKey: string,
  year: number,
  month: number
) {
  const { data: scope, error: scopeError } = await supabase
    .from("resource_scopes")
    .select("id")
    .eq("key", scopeKey)
    .maybeSingle();

  if (scopeError) throw scopeError;
  if (!scope) throw new Error(`Scope not found: ${scopeKey}`);

  const { data: project, error: projectError } = await supabase
    .from("rd_projects")
    .select("id, title, technical_uncertainty, objective")
    .eq("scope_id", scope.id)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) throw new Error(`R&D project not found for scope: ${scopeKey}`);

  const { start, end } = monthUtcRange(year, month);

  const { data: records, error: recordsError } = await supabase
    .from("rd_evidence_records")
    .select(
      "id, evidence_type, title, summary, linked_commit, linked_build, linked_cost_ref, recorded_by, recorded_at"
    )
    .eq("rd_project_id", project.id)
    .gte("recorded_at", start)
    .lt("recorded_at", end)
    .order("recorded_at", { ascending: true });

  if (recordsError) throw recordsError;

  return {
    project: project as MonthlyProject,
    records: (records ?? []) as MonthlyEvidenceRecord[],
  };
}

export async function buildMonthlyReport(
  supabase: SupabaseClient,
  scopeKey: string,
  year: number,
  month: number
) {
  const { project, records } = await fetchMonthlyEvidence(supabase, scopeKey, year, month);
  return {
    project,
    records,
    filename: monthlyReportFilename(scopeKey, year, month),
    markdown: buildMonthlyReportMarkdown(scopeKey, project, year, month, records),
  };
}
