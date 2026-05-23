import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return NextResponse.json(
      { ok: false, supabase: "not_configured", hint: "Set NEXT_PUBLIC_SUPABASE_* in .env.local" },
      { status: 503 }
    );
  }

  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase.from("roles").select("key").limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          supabase: "connected",
          schema: "missing_or_inaccessible",
          error: error.message,
          hint: "Run supabase/migrations/001–004",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      supabase: "connected",
      schema: "governance_ready",
      roles_sample: data?.[0]?.key ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, supabase: "error", error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
