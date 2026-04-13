import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditLogInsert = {
  action: string;
  entityType?: string;
  entityId: string | null;
  targetEmail?: string | null;
  summary: string;
  changes: Record<string, unknown>;
};

/**
 * Records an audit row as the current Supabase session user (must be admin; RLS enforced).
 * Swallows errors so primary mutations are not rolled back if logging fails.
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  entry: AuditLogInsert,
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? "profiles",
      entity_id: entry.entityId,
      target_email: entry.targetEmail ?? null,
      summary: entry.summary,
      changes: entry.changes,
    });

    if (error) {
      console.error("[audit_logs]", error.message);
    }
  } catch (e) {
    console.error("[audit_logs]", e);
  }
}
