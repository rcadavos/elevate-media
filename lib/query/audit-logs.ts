import type { AuditLogRow } from "@/lib/types/audit-log";

export type AuditLogsPage = {
  logs: AuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchAdminAuditLogs(params: {
  page?: number;
  pageSize?: number;
}): Promise<AuditLogsPage> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/admin/audit-logs?${qs.toString()}`, {
    credentials: "same-origin",
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Forbidden");
  }
  if (!res.ok) {
    throw new Error("Could not load audit logs");
  }
  return (await res.json()) as AuditLogsPage;
}
