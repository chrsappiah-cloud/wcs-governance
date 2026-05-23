import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { mdToPdf } from "md-to-pdf";

const STYLESHEET = path.join(process.cwd(), "lib/export/pdf-styles.css");

function getChromeExecutable(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const output = execSync("npx puppeteer browsers install chrome", { encoding: "utf8" });
    const match = output.match(/(\/[^\n]+Google Chrome for Testing)/);
    if (match?.[1] && fs.existsSync(match[1])) return match[1];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(/(\/[^\n]+Google Chrome for Testing)/);
    if (match?.[1] && fs.existsSync(match[1])) return match[1];
  }

  return undefined;
}

const GOVERNANCE_DOCS = [
  "docs/governance/architecture.md",
  "docs/governance/roles-and-scopes.md",
];

export async function exportMarkdownToPdf(mdPath: string, destPath?: string) {
  const resolved = path.resolve(mdPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Markdown file not found: ${resolved}`);
  }

  const outPath =
    destPath ??
    resolved.replace(/\.md$/i, ".pdf").replace(/docs\/governance\//, "docs/governance/exports/");

  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });

  const chromePath = getChromeExecutable();

  await mdToPdf(
    { path: resolved },
    {
      dest: outPath,
      stylesheet: [STYLESHEET],
      launch_options: {
        ...(chromePath ? { executablePath: chromePath } : {}),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        timeout: 120_000,
      },
      pdf_options: {
        format: "A4",
        margin: { top: "20mm", right: "18mm", bottom: "20mm", left: "18mm" },
        printBackground: true,
      },
    }
  );

  return outPath;
}

export async function exportGovernancePdfs() {
  const written: string[] = [];
  for (const doc of GOVERNANCE_DOCS) {
    const base = path.basename(doc, ".md");
    const outPath = path.join(process.cwd(), "docs/governance/exports", `${base}.pdf`);
    written.push(await exportMarkdownToPdf(doc, outPath));
  }
  return written;
}

export async function exportRdEvidencePdfs() {
  const rdDir = path.join(process.cwd(), "docs/rd-evidence");
  if (!fs.existsSync(rdDir)) return [];

  const files = fs
    .readdirSync(rdDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md");

  const written: string[] = [];
  for (const file of files) {
    const mdPath = path.join(rdDir, file);
    const outPath = path.join(rdDir, file.replace(/\.md$/i, ".pdf"));
    written.push(await exportMarkdownToPdf(mdPath, outPath));
  }
  return written;
}

async function main() {
  const arg = process.argv[2];

  if (!arg || arg === "governance") {
    const paths = await exportGovernancePdfs();
    paths.forEach((p) => console.log(`Wrote ${p}`));
    return;
  }

  if (arg === "rd-evidence") {
    const paths = await exportRdEvidencePdfs();
    if (!paths.length) {
      console.log("No R&D evidence Markdown files to convert.");
      return;
    }
    paths.forEach((p) => console.log(`Wrote ${p}`));
    return;
  }

  if (arg === "all") {
    const gov = await exportGovernancePdfs();
    const rd = await exportRdEvidencePdfs();
    [...gov, ...rd].forEach((p) => console.log(`Wrote ${p}`));
    return;
  }

  const out = await exportMarkdownToPdf(arg);
  console.log(`Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
