import { requireStaff } from "./requireStaff";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requirePermission(permissionKey: string, scopeKey: string) {
  const { supabase, user } = await requireStaff();

  const { data, error } = await supabase.rpc("user_has_permission_for_scope", {
    p_user_id: user.id,
    p_permission_key: permissionKey,
    p_scope_key: scopeKey,
  });
  if (error) throw error;

  const { data: founderData, error: founderError } = await supabase.rpc("is_founder_admin", {
    p_user_id: user.id,
  });
  if (founderError) throw founderError;

  const allowed = data === true || founderData === true;
  if (!allowed) throw new ForbiddenError();

  return { supabase, user };
}
