export const EVIDENCE_TYPES = [
  "hypothesis",
  "experiment",
  "result",
  "cost_link",
  "meeting_note",
  "decision",
  "artifact",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export type RdEvidenceInput = {
  rd_project_id: number;
  evidence_type: EvidenceType;
  title: string;
  summary?: string;
  linked_commit?: string;
  linked_build?: string;
  linked_cost_ref?: string;
  payload?: Record<string, unknown>;
};

export type RdProjectRow = {
  id: number;
  title: string;
  status: string;
  technical_uncertainty?: string;
  resource_scopes?: { key?: string; label?: string } | null;
};

export type RdEvidenceRow = {
  id: number;
  rd_project_id: number;
  evidence_type: string;
  title: string;
  summary?: string | null;
  linked_commit?: string | null;
  linked_build?: string | null;
  linked_cost_ref?: string | null;
  recorded_at: string;
  rd_projects?: { title?: string } | null;
};
