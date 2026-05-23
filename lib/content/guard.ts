import { requirePermission } from "@/lib/auth/require-permission";

/** Wrap existing CMS / content mutations — call before any website-main write. */
export async function requirePublishContent() {
  return requirePermission("publish_content", "website-main");
}

export async function requireEditCopy() {
  return requirePermission("edit_ui_copy", "website-main");
}
