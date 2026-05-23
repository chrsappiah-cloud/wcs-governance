import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSessionClient() {
  return createServerSupabaseClient();
}

export async function getSession() {
  const supabase = await getSessionClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const claims = (user.app_metadata ?? {}) as Record<string, unknown>;
  return { supabase, user, claims };
}
