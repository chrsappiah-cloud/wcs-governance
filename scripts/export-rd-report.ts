#!/usr/bin/env node
/**
 * Export monthly R&D evidence from Supabase to docs/rd-evidence/<scope>-<year>-<month>.md
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npm run export:rd -- wcs-platform-rd-2026 2026 5
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { buildMonthlyReport } from "../lib/rd/monthly-report";

async function main() {
  const scopeKey = process.argv[2];
  const year = Number(process.argv[3]);
  const month = Number(process.argv[4]);

  if (!scopeKey || !year || !month || month < 1 || month > 12) {
    console.error("Usage: npm run export:rd -- <scopeKey> <year> <month>");
    console.error("Example: npm run export:rd -- etherealveil-rd-2026 2026 5");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const report = await buildMonthlyReport(supabase, scopeKey, year, month);

  const outDir = path.join(process.cwd(), "docs", "rd-evidence");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, report.filename);
  fs.writeFileSync(outPath, report.markdown, "utf8");

  console.log(`Wrote ${outPath} (${report.records.length} records)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
