/**
 * End-to-end stack test — run with dev server: npm run dev (separate terminal)
 * Usage: npm run test:stack
 */
const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

type Row = { name: string; ok: boolean; detail: string };

async function probe(name: string, fn: () => Promise<void>): Promise<Row> {
  try {
    await fn();
    return { name, ok: true, detail: "ok" };
  } catch (e) {
    return { name, ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const rows: Row[] = [];

  rows.push(
    await probe("GET /api/health", async () => {
      const res = await fetch(`${BASE}/api/health`);
      if (!res.ok && res.status !== 503) throw new Error(`${res.status}`);
      const body = await res.json();
      if (typeof body !== "object") throw new Error("invalid json");
    })
  );

  rows.push(
    await probe("GET /api/system/diagnostics", async () => {
      const res = await fetch(`${BASE}/api/system/diagnostics`);
      const body = await res.json();
      if (!body.summary) throw new Error("missing summary");
    })
  );

  rows.push(
    await probe("GET / (marketing)", async () => {
      const res = await fetch(`${BASE}/`);
      if (!res.ok) throw new Error(`${res.status}`);
    })
  );

  rows.push(
    await probe("GET /login", async () => {
      const res = await fetch(`${BASE}/login`);
      if (!res.ok) throw new Error(`${res.status}`);
    })
  );

  rows.push(
    await probe("Middleware: /dashboard → login redirect", async () => {
      const res = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
      if (res.status !== 307 && res.status !== 308) throw new Error(`expected redirect, got ${res.status}`);
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/login")) throw new Error(`bad location: ${loc}`);
    })
  );

  rows.push(
    await probe("GET /system → login redirect (console guard)", async () => {
      const res = await fetch(`${BASE}/system`, { redirect: "manual" });
      if (res.status !== 307 && res.status !== 308) throw new Error(`expected redirect, got ${res.status}`);
    })
  );

  console.log("\nWCS stack HTTP tests\n");
  let failed = 0;
  for (const r of rows) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.name}: ${r.detail}`);
    if (!r.ok) failed++;
  }

  if (failed) {
    console.log(`\n${failed} failed. Is the dev server running? npm run dev`);
    process.exit(1);
  }
  console.log("\nAll HTTP probes passed.");
}

main();
