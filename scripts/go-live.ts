#!/usr/bin/env node
/**
 * Go-live orchestrator: link Supabase, push migrations, verify schema, print founder seed steps.
 *
 * Prerequisites:
 *   - .env.local with URL + anon + service role keys
 *   - Supabase project unpaused
 *   - supabase login (for db push)
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { loadEnvLocal } from "../lib/env/load-local";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local — run: cp .env.example .env.local");
    process.exit(1);
  }
  loadEnvLocal();
}

function run(cmd: string, opts?: { allowFail?: boolean }) {
  console.log(`\n→ ${cmd}\n`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
  } catch {
    if (!opts?.allowFail) process.exit(1);
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("WCS Governance — go-live\n");

  if (!url || !anon || !service) {
    console.error("Fill in all three keys in .env.local");
    console.error("Dashboard: https://supabase.com/dashboard/project/qbmheroqblpcbuqwnzlp/settings/api");
    process.exit(1);
  }

  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) {
    console.error("Invalid NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  run(`supabase link --project-ref ${ref}`, { allowFail: true });
  run("supabase db push");

  console.log("\n--- Migrations applied ---\n");
  console.log("Next manual steps:");
  console.log("  1. Enable Auth hook: Dashboard → Auth → Hooks → custom_access_token_hook");
  console.log("  2. npm run dev → http://localhost:3000/login → sign up with chrsappiah@gmail.com");
  console.log("  3. Supabase SQL editor → run supabase/seed-founder.sql");
  console.log("  4. Sign out and back in");
  console.log("  5. npm run verify:setup");
  console.log("  6. Open http://localhost:3000/system\n");

  run("npm run verify:setup", { allowFail: true });
}

main();
