import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const claims = (data.user.app_metadata ?? {}) as Record<string, unknown>;
  const isStaff = claims.is_staff === true || claims.org_role === "founder_admin";

  if (!isStaff) redirect("/");

  return { supabase, user: data.user, claims };
}
