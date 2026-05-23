import { requireStaff } from "./require-staff";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requirePermission(permissionKey: string, scopeKey: string) {
  const { supabase, user } = await requireStaff();

  const [{ data: allowed, error }, { data: isFounder, error: founderError }] =
    await Promise.all([
      supabase.rpc("user_has_permission_for_scope", {
        p_user_id: user.id,
        p_permission_key: permissionKey,
        p_scope_key: scopeKey,
      }),
      supabase.rpc("is_founder_admin", { p_user_id: user.id }),
    ]);

  if (error) throw error;
  if (founderError) throw founderError;
  if (!allowed && !isFounder) throw new ForbiddenError();

  return { supabase, user };
}
