"use client";

import { useActionState } from "react";
import { createRdEvidenceRecord } from "@/lib/actions/rd-evidence";
import { EVIDENCE_TYPES } from "@/lib/rd/types";

type ProjectOption = { id: number; title: string };

const initial = { error: undefined as string | undefined, ok: undefined as boolean | undefined };

export function RdEvidenceForm({ projects }: { projects: ProjectOption[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initial, formData: FormData) => {
      const result = await createRdEvidenceRecord(formData);
      if ("error" in result && result.error) return { error: result.error, ok: false };
      return { error: undefined, ok: true };
    },
    initial
  );

  if (!projects.length) {
    return <p className="muted">No R&D projects visible for your scopes.</p>;
  }

  return (
    <form action={action} className="panel">
      <h2 style={{ marginTop: 0 }}>Log evidence</h2>
      <label className="field">
        Project
        <select name="rd_project_id" required defaultValue={projects[0]?.id}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Type
        <select name="evidence_type" required defaultValue="experiment">
          {EVIDENCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Title
        <input name="title" required placeholder="e.g. Adaptive pacing A/B — session 12" />
      </label>
      <label className="field">
        Summary
        <input name="summary" placeholder="Hypothesis, test, result (under 150 words)" />
      </label>
      <label className="field">
        Linked commit
        <input name="linked_commit" placeholder="abc123" />
      </label>
      <label className="field">
        Linked build
        <input name="linked_build" placeholder="1.2.0" />
      </label>
      <label className="field">
        Cost reference
        <input name="linked_cost_ref" placeholder="invoice or cost centre ref" />
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create record"}
      </button>
      {state.error ? <p className="muted" style={{ color: "#f87171" }}>{state.error}</p> : null}
      {state.ok ? <p className="muted">Evidence saved. RLS and audit trigger applied at the database.</p> : null}
    </form>
  );
}
