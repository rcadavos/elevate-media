"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAdminUserLastLogin } from "@/lib/query/user-last-login";
import { queryKeys } from "@/lib/query/query-keys";
import type { LoginHistoryRow } from "@/lib/types/login-history";
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

function factorLabel(f: LoginHistoryRow["auth_factor"]): string {
  switch (f) {
    case "password":
      return "Password";
    case "email_link":
      return "Email link";
    case "sso":
      return "SSO";
    case "magic_link":
      return "Magic link";
    case "recovery":
      return "Recovery";
    default:
      return typeof f === "string" && f.length > 0 ? f : "—";
  }
}

function shortUserAgent(ua: string, max = 72): string {
  const t = ua.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function UserLastLoginPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const query = useQuery({
    queryKey: queryKeys.admin.userLastLogin(page, pageSize),
    queryFn: () => fetchAdminUserLastLogin({ page, pageSize }),
  });

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [query.data?.total, pageSize]);

  const entries = query.data?.entries ?? [];
  const isInitialLoading = query.isPending && query.data === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Sign-in history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign-in attempts recorded in{" "}
          <code className="rounded bg-muted px-1 text-xs">sign_in_events</code>{" "}
          (password, email link, and signup flows). Location is reserved for a
          future geo lookup; IP and user agent come from the request at sign-in.
        </p>
      </div>

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load history</AlertTitle>
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
                <TableHead className="w-44 whitespace-nowrap">When</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="whitespace-nowrap">IP address</TableHead>
                <TableHead className="min-w-[10rem]">Location</TableHead>
                <TableHead className="whitespace-nowrap">Factor</TableHead>
                <TableHead className="whitespace-nowrap">Result</TableHead>
                <TableHead className="min-w-[12rem] max-w-[18rem]">
                  User agent
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No sign-in events yet.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatWhen(row.occurred_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-foreground">{row.user_email}</span>
                      {row.user_id ? (
                        <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                          {row.user_id.slice(0, 8)}…
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {row.ip_address?.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {row.location?.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {factorLabel(row.auth_factor)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.success ? (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          Success
                        </span>
                      ) : (
                        <span className="text-destructive">Failed</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="max-w-[18rem] font-mono text-xs text-muted-foreground break-all"
                      title={row.user_agent ?? undefined}
                    >
                      {shortUserAgent(row.user_agent ?? "")}
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
              htmlFor="login-history-page-size"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Rows per page
            </Label>
            <select
              id="login-history-page-size"
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
