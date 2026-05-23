"use client";

import { useActionState } from "react";
import { exportRdEvidencePack } from "@/lib/actions/rd-evidence";

const SCOPES = [
  { key: "wcs-platform-rd-2026", label: "WCS Platform R&D 2026" },
  { key: "etherealveil-rd-2026", label: "EtherealVeil R&D 2026" },
];

type ExportState = {
  error?: string;
  markdown?: string;
};

export function ExportRdPackForm() {
  const [state, action, pending] = useActionState(
    async (_prev: ExportState, formData: FormData): Promise<ExportState> => {
      const result = await exportRdEvidencePack(formData);
      if ("error" in result && result.error) return { error: result.error };
      return { markdown: result.pack?.markdown };
    },
    {}
  );

  return (
    <form action={action} className="panel" style={{ marginTop: "1rem" }}>
      <h2 style={{ marginTop: 0 }}>Export monthly evidence pack</h2>
      <label className="field">
        Scope
        <select name="scope_key" defaultValue="wcs-platform-rd-2026">
          {SCOPES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Since (optional)
        <input name="since" type="date" />
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Exporting…" : "Generate pack"}
      </button>
      {state.error ? <p style={{ color: "#f87171" }}>{state.error}</p> : null}
      {state.markdown ? (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            overflow: "auto",
            fontSize: "0.85rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {state.markdown}
        </pre>
      ) : null}
    </form>
  );
}
