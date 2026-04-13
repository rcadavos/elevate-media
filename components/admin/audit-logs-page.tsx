"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAdminAuditLogs } from "@/lib/query/audit-logs";
import { queryKeys } from "@/lib/query/query-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function changesPreview(ch: unknown): string {
  if (ch === null || ch === undefined) {
    return "—";
  }
  try {
    const s = JSON.stringify(ch);
    return s.length > 160 ? `${s.slice(0, 160)}…` : s;
  } catch {
    return "—";
  }
}

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const query = useQuery({
    queryKey: queryKeys.admin.auditLogs(page, pageSize),
    queryFn: () => fetchAdminAuditLogs({ page, pageSize }),
  });

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [query.data?.total, pageSize]);

  const logs = query.data?.logs ?? [];
  const isInitialLoading = query.isPending && query.data === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Audit logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Directory and profile actions performed by admins (and stored change
          details).
        </p>
      </div>

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load logs</AlertTitle>
          <AlertDescription>
            {query.error instanceof Error
              ? query.error.message
              : "Try again later."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-44">When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="min-w-[12rem]">Summary</TableHead>
                <TableHead className="max-w-[14rem]">Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No audit entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {formatWhen(row.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-foreground">
                        {row.actor_email?.trim() || "—"}
                      </span>
                      {row.actor_id ? (
                        <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                          {row.actor_id.slice(0, 8)}…
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {row.action}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.target_email?.trim() || row.entity_id?.slice(0, 8) || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {row.summary}
                    </TableCell>
                    <TableCell
                      className="max-w-[14rem] font-mono text-xs text-muted-foreground break-all"
                      title={changesPreview(row.changes)}
                    >
                      {changesPreview(row.changes)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="audit-page-size"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Rows per page
            </Label>
            <select
              id="audit-page-size"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Page{" "}
              <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
              <span className="text-muted-foreground">
                {" "}
                ({query.data?.total ?? 0} total)
              </span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isInitialLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isInitialLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
