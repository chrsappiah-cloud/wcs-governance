import { NextResponse } from "next/server";
import { runDiagnostics } from "@/lib/system/diagnostics";

export async function GET() {
  try {
    const report = await runDiagnostics();
    const httpStatus = report.summary.fail > 0 ? 503 : 200;
    return NextResponse.json(report, { status: httpStatus });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "diagnostics failed" },
      { status: 500 }
    );
  }
}
