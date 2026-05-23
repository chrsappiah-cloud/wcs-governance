import { getServerSupabase } from "@/lib/supabase/server";

/** @deprecated Use getServerSupabase from @/lib/supabase/server */
export async function getSessionClient() {
  return getServerSupabase();
}

export async function getSession() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const claims = (user.app_metadata ?? {}) as Record<string, unknown>;
  return { supabase, user, claims };
}
