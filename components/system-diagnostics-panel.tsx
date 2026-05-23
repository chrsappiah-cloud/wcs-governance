"use client";

import { useCallback, useState } from "react";
import type { DiagnosticsReport, DiagnosticResult } from "@/lib/system/diagnostics";

const LAYERS = ["frontend", "middleware", "backend", "database", "auth"] as const;

const API_ENDPOINTS = [
  { path: "/api/health", method: "GET", auth: false },
  { path: "/api/system/diagnostics", method: "GET", auth: false },
  { path: "/api/audit", method: "GET", auth: true },
  { path: "/api/approvals", method: "GET", auth: true },
  { path: "/api/rd-evidence", method: "GET", auth: true },
];

function statusClass(status: string) {
  if (status === "pass") return "status-pass";
  if (status === "fail") return "status-fail";
  if (status === "warn") return "status-warn";
  return "status-skip";
}

function groupByLayer(results: DiagnosticResult[]) {
  return LAYERS.map((layer) => ({
    layer,
    items: results.filter((r) => r.layer === layer),
  })).filter((g) => g.items.length > 0);
}

export function SystemDiagnosticsPanel({ initial }: { initial: DiagnosticsReport }) {
  const [report, setReport] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [apiResults, setApiResults] = useState<Record<string, string>>({});
  const [mwResult, setMwResult] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/diagnostics", { cache: "no-store" });
      const data = (await res.json()) as DiagnosticsReport;
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const probeApi = useCallback(async (path: string, method: string) => {
    const key = `${method} ${path}`;
    try {
      const res = await fetch(path, { method, credentials: "include" });
      const body = await res.text();
      const snippet = body.length > 120 ? `${body.slice(0, 120)}…` : body;
      setApiResults((prev) => ({
        ...prev,
        [key]: `${res.status} ${res.statusText} — ${snippet}`,
      }));
    } catch (e) {
      setApiResults((prev) => ({
        ...prev,
        [key]: e instanceof Error ? e.message : "fetch failed",
      }));
    }
  }, []);

  const probeMiddleware = useCallback(async () => {
    try {
      const res = await fetch("/dashboard", { redirect: "manual", credentials: "include" });
      if (res.status === 307 || res.status === 308) {
        const loc = res.headers.get("location") ?? "";
        setMwResult(`pass — ${res.status} redirect to ${loc}`);
      } else if (res.status === 200) {
        setMwResult("pass — 200 (session active, dashboard reachable)");
      } else {
        setMwResult(`warn — unexpected ${res.status}`);
      }
    } catch (e) {
      setMwResult(e instanceof Error ? e.message : "probe failed");
    }
  }, []);

  const groups = groupByLayer(report.results);

  return (
    <div className="space-y-6">
      <div className="panel flex-between">
        <div>
          <p className="muted text-sm">Last run: {new Date(report.generated_at).toLocaleString()}</p>
          <p>
            <span className="status-pass badge">{report.summary.pass} pass</span>{" "}
            <span className="status-fail badge">{report.summary.fail} fail</span>{" "}
            <span className="status-warn badge">{report.summary.warn} warn</span>{" "}
            <span className="status-skip badge">{report.summary.skip} skip</span>
          </p>
        </div>
        <button type="button" className="btn" onClick={refresh} disabled={loading}>
          {loading ? "Running…" : "Re-run all tests"}
        </button>
      </div>

      {groups.map(({ layer, items }) => (
        <section key={layer} className="panel">
          <h2 style={{ marginTop: 0, textTransform: "capitalize" }}>{layer}</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Unit</th>
                <th>Path</th>
                <th>Detail</th>
                <th>ms</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={`badge ${statusClass(row.status)}`}>{row.status}</span>
                  </td>
                  <td>{row.name}</td>
                  <td className="text-sm text-neutral-500">{row.path}</td>
                  <td className="text-sm">{row.detail}</td>
                  <td className="text-sm text-neutral-500">{row.ms ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>Live API probes</h2>
        <p className="muted text-sm">Client-side fetch from browser (includes your session cookies).</p>
        <ul className="space-y-2">
          {API_ENDPOINTS.map((ep) => (
            <li key={ep.path} className="flex-between" style={{ gap: "1rem", flexWrap: "wrap" }}>
              <code className="text-sm">
                {ep.method} {ep.path}
              </code>
              <button type="button" className="btn" onClick={() => probeApi(ep.path, ep.method)}>
                Test
              </button>
              {apiResults[`${ep.method} ${ep.path}`] ? (
                <span className="text-sm muted" style={{ flex: "1 1 100%" }}>
                  {apiResults[`${ep.method} ${ep.path}`]}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>Middleware probe</h2>
        <p className="muted text-sm">GET /dashboard with redirect:manual — expect 307 → /login when logged out.</p>
        <button type="button" className="btn" onClick={probeMiddleware}>
          Test middleware redirect
        </button>
        {mwResult ? <p className="text-sm" style={{ marginTop: "0.75rem" }}>{mwResult}</p> : null}
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>Frontend route links</h2>
        <ul className="space-y-2">
          {report.results
            .filter((r) => r.layer === "frontend" && r.path.startsWith("/"))
            .map((r) => (
              <li key={r.id}>
                <a href={r.path} className="text-sm" style={{ color: "var(--accent)" }}>
                  {r.path}
                </a>
                <span className="muted text-sm"> — {r.name}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
