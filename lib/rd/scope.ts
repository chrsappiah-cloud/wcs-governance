import type { SupabaseClient } from "@supabase/supabase-js";
import type { RdProjectRow } from "./types";

export async function getProjectByScopeKey(supabase: SupabaseClient, scopeKey: string) {
  const { data: scope, error: scopeError } = await supabase
    .from("resource_scopes")
    .select("id")
    .eq("key", scopeKey)
    .maybeSingle();

  if (scopeError) throw scopeError;
  if (!scope) return null;

  const { data: project, error: projectError } = await supabase
    .from("rd_projects")
    .select("id, title, technical_uncertainty, objective, scope_id")
    .eq("scope_id", scope.id)
    .maybeSingle();

  if (projectError) throw projectError;
  return project;
}

export async function getScopeKeyForProject(supabase: SupabaseClient, rdProjectId: number) {
  const { data, error } = await supabase
    .from("rd_projects")
    .select("id, resource_scopes(key)")
    .eq("id", rdProjectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("R&D project not found");

  const scopeKey = (data.resource_scopes as { key?: string } | null)?.key;
  if (!scopeKey) throw new Error("Project scope not found");

  return { projectId: data.id as number, scopeKey };
}

export async function getProjectsForScope(supabase: SupabaseClient, scopeKey: string): Promise<RdProjectRow[]> {
  const { data, error } = await supabase
    .from("rd_projects")
    .select("id, title, status, technical_uncertainty, objective, resource_scopes(key, label)");

  if (error) throw error;

  return (data ?? [])
    .filter((p) => (p.resource_scopes as { key?: string } | null)?.key === scopeKey)
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      technical_uncertainty: p.technical_uncertainty,
      resource_scopes: p.resource_scopes as { key?: string; label?: string } | null,
    }));
}
