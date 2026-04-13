export type AuditLogRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  target_email: string | null;
  summary: string;
  changes: Record<string, unknown>;
};
