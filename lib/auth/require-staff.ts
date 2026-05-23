import { redirect } from "next/navigation";
import { getSessionClient } from "./get-session";

export async function requireStaff() {
  const supabase = await getSessionClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const claims = (user.app_metadata ?? {}) as Record<string, unknown>;
  const isStaff = claims.is_staff === true || claims.org_role === "founder_admin";

  if (!isStaff || claims.staff_status === "suspended" || claims.staff_status === "inactive") {
    redirect("/");
  }

  return { supabase, user, claims };
}
