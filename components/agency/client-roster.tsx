"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  ListFilter,
  Pencil,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  breakEvenRoas,
  clientInitials,
  formatRoas,
  serviceLabel,
} from "@/lib/agency/format";
import {
  fetchAdminClients,
  mergeClientIntoCache,
  patchAdminClient,
  type ClientPatch,
} from "@/lib/query/clients";
import { queryKeys } from "@/lib/query/query-keys";
import type { AgencyClient } from "@/lib/types/agency";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const STATUS_OPTIONS = ["Active", "Paused", "Inactive"] as const;
const SERVICE_OPTIONS = ["META", "SMS"] as const;

const editCellClass =
  "h-7 rounded border border-black/15 bg-white/80 px-1.5 text-xs text-zinc-900 outline-none focus:border-black/40";

function directoryColumnLabel(meta: unknown, fallback: string): string {
  if (
    meta &&
    typeof meta === "object" &&
    "directoryLabel" in meta &&
    typeof (meta as { directoryLabel: string }).directoryLabel === "string"
  ) {
    return (meta as { directoryLabel: string }).directoryLabel;
  }
  return fallback;
}

function SortHeader({
  column,
  label,
}: {
  column: Column<AgencyClient, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      className={cn(
        "-ml-1 inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm px-1 py-0.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onClick={column.getToggleSortingHandler()}
      aria-label={
        sorted === "asc"
          ? `${label}, sorted ascending. Click to sort descending.`
          : sorted === "desc"
            ? `${label}, sorted descending. Click to clear sort.`
            : `${label}. Click to sort ascending.`
      }
    >
      <span className="truncate">{label}</span>
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5 shrink-0 text-foreground" aria-hidden />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5 shrink-0 text-foreground" aria-hidden />
      ) : (
        <ChevronsUpDown className="size-3.5 shrink-0 opacity-40" aria-hidden />
      )}
    </button>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  if (!email) return <span className="text-zinc-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="truncate">{email}</span>
      <button
        type="button"
        aria-label={copied ? "Email copied" : `Copy ${email}`}
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-700"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </button>
    </span>
  );
}

export function ClientRoster({
  clients,
  basePath = "/clients",
  editable = false,
}: {
  clients: AgencyClient[];
  /** Detail route base, e.g. "/clients" or "/admin/clients". */
  basePath?: string;
  /** Admin only — enables the inline edit toggle (saves to the clients table). */
  editable?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.admin.clients(),
    queryFn: fetchAdminClients,
    initialData: clients,
    enabled: editable,
  });
  const data = listQuery.data ?? clients;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeSms, setIncludeSms] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const patchMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ClientPatch }) =>
      patchAdminClient(id, patch),
    onSuccess: (updated) => {
      setEditError(null);
      mergeClientIntoCache(queryClient, updated);
    },
    onError: (err: Error) => {
      setEditError(err.message);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients() });
    },
  });

  const applyEdit = useCallback(
    (id: string, patch: ClientPatch) => {
      // Optimistic: reflect immediately, reconcile on success / revert on error.
      queryClient.setQueryData<AgencyClient[]>(queryKeys.admin.clients(), (old) =>
        old ? old.map((c) => (c.id === id ? { ...c, ...patch } : c)) : old,
      );
      patchMutation.mutate({ id, patch });
    },
    [queryClient, patchMutation],
  );

  const serviceSelectedCount = (includeMeta ? 1 : 0) + (includeSms ? 1 : 0);

  const filteredRows = useMemo(() => {
    let next = data.filter((c) => {
      if (c.service === "META" && includeMeta) return true;
      if (c.service === "SMS" && includeSms) return true;
      return false;
    });
    const q = search.trim().toLowerCase();
    if (q) {
      next = next.filter((c) => {
        const name = c.name.toLowerCase();
        const owner = c.contact.toLowerCase();
        const email = c.email.toLowerCase();
        return name.includes(q) || owner.includes(q) || email.includes(q);
      });
    }
    return next;
  }, [data, search, includeMeta, includeSms]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [data.length, search, includeMeta, includeSms, sorting]);

  const columns = useMemo<ColumnDef<AgencyClient>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name,
        meta: { directoryLabel: "Client" },
        header: ({ column }) => <SortHeader column={column} label="Client" />,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: c.theme.initial, color: c.theme.accent }}
                aria-hidden
              >
                {clientInitials(c.name)}
              </span>
              <Link
                href={`${basePath}/${c.id}`}
                className="truncate font-semibold tracking-tight hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ color: c.theme.accent }}
              >
                {c.name}
              </Link>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        meta: { directoryLabel: "Status" },
        header: ({ column }) => <SortHeader column={column} label="Status" />,
        cell: ({ row, getValue }) => {
          const status = getValue() as string;
          if (editing) {
            return (
              <select
                aria-label={`${row.original.name} status`}
                className={editCellClass}
                value={status}
                onChange={(e) => applyEdit(row.original.id, { status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          }
          const active = status === "Active";
          return (
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                active
                  ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                  : "border-zinc-300 bg-zinc-100 text-zinc-600",
              )}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "service",
        accessorFn: (row) => row.service,
        meta: { directoryLabel: "Service" },
        header: ({ column }) => <SortHeader column={column} label="Service" />,
        cell: ({ row }) => {
          const c = row.original;
          if (editing) {
            return (
              <select
                aria-label={`${c.name} service`}
                className={editCellClass}
                value={c.service}
                onChange={(e) =>
                  applyEdit(c.id, {
                    service: e.target.value as AgencyClient["service"],
                  })
                }
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {serviceLabel(s)}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <span className="inline-flex rounded-md border border-zinc-300 bg-white/70 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {serviceLabel(c.service)}
            </span>
          );
        },
      },
      {
        id: "owner",
        accessorFn: (row) => row.contact,
        meta: { directoryLabel: "Owner" },
        header: ({ column }) => <SortHeader column={column} label="Owner" />,
        cell: ({ row }) => {
          const c = row.original;
          if (editing) {
            return (
              <input
                key={`owner-${c.contact}`}
                aria-label={`${c.name} owner`}
                className={cn(editCellClass, "w-32")}
                defaultValue={c.contact}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== c.contact) applyEdit(c.id, { contact: v });
                }}
              />
            );
          }
          return <span className="text-zinc-700">{c.contact || "—"}</span>;
        },
      },
      {
        id: "email",
        accessorFn: (row) => row.email,
        meta: { directoryLabel: "Email" },
        header: ({ column }) => <SortHeader column={column} label="Email" />,
        cell: ({ getValue }) => <CopyEmail email={getValue() as string} />,
      },
      {
        id: "fee",
        accessorFn: (row) => row.feeOnRevenue,
        meta: { directoryLabel: "Agency Fee %" },
        header: ({ column }) => <SortHeader column={column} label="Agency Fee %" />,
        cell: ({ row }) => {
          const c = row.original;
          if (editing) {
            return (
              <input
                key={`fee-${c.feeOnRevenue}`}
                type="number"
                min={0}
                aria-label={`${c.name} agency fee percent`}
                className={cn(editCellClass, "w-16 text-center")}
                defaultValue={c.feeOnRevenue}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v !== c.feeOnRevenue) {
                    applyEdit(c.id, { feeOnRevenue: v });
                  }
                }}
              />
            );
          }
          return (
            <span className="font-semibold tabular-nums text-zinc-900">
              {c.feeOnRevenue}%
            </span>
          );
        },
      },
      {
        id: "breakEven",
        accessorFn: (row) => breakEvenRoas(row),
        meta: { directoryLabel: "Break-Even ROAS" },
        header: ({ column }) => (
          <SortHeader column={column} label="Break-Even ROAS" />
        ),
        cell: ({ getValue }) => (
          <span className="font-bold tabular-nums text-zinc-900">
            {formatRoas(getValue() as number)}
          </span>
        ),
      },
    ],
    [basePath, editing, applyEdit],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- table instance API
  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });

  const colCount = columns.length;
  const pageRows = table.getRowModel().rows;
  const searchId = "client-roster-search";

  const navigateToRow = (href: string, e: React.MouseEvent) => {
    if (editing) return;
    const t = e.target as HTMLElement;
    if (t.closest("a, button, input, select, textarea, label")) return;
    router.push(href);
  };

  return (
    <div className="space-y-3">
      {editError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{editError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Label htmlFor={searchId} className="sr-only">
              Search by client, owner, or email
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id={searchId}
                type="search"
                placeholder="Search by client, owner, or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex w-full flex-row items-stretch gap-2 sm:w-auto sm:items-center sm:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                aria-label={`Filter by service, ${serviceSelectedCount} of 2 selected`}
                className={cn(
                  "inline-flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-[color,box-shadow]",
                  "sm:w-auto sm:justify-center",
                  "hover:bg-muted/80",
                  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "aria-expanded:bg-muted aria-expanded:text-foreground",
                )}
              >
                <ListFilter
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span aria-hidden>Filter</span>
                <span
                  className={cn(
                    "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums",
                    serviceSelectedCount > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {serviceSelectedCount}
                </span>
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuLabel>Service</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={includeMeta}
                  onCheckedChange={(next) => setIncludeMeta(Boolean(next))}
                >
                  Meta Ads
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={includeSms}
                  onCheckedChange={(next) => setIncludeSms(Boolean(next))}
                >
                  SMS
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {editable ? (
              <Button
                type="button"
                variant={editing ? "default" : "outline"}
                size="toolbar"
                className="shrink-0"
                aria-pressed={editing}
                onClick={() => {
                  setEditError(null);
                  setEditing((v) => !v);
                }}
              >
                {editing ? (
                  <>
                    <Check className="size-4 shrink-0" aria-hidden />
                    Done
                  </>
                ) : (
                  <>
                    <Pencil className="size-4 shrink-0" aria-hidden />
                    Edit
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground"
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colCount}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {data.length === 0 ? "No clients yet" : "No matching clients"}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => {
                  const c = row.original;
                  const href = `${basePath}/${c.id}`;
                  return (
                    <TableRow
                      key={row.id}
                      style={{ backgroundColor: c.theme.bg }}
                      className={cn(
                        "text-zinc-900",
                        editing ? "" : "cursor-pointer hover:brightness-[0.97]",
                      )}
                      aria-label={editing ? undefined : `Open ${c.name}`}
                      onClick={(e) => navigateToRow(href, e)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border bg-muted/15 p-2 md:hidden">
          {pageRows.length === 0 ? (
            <div className="flex h-24 items-center justify-center px-2 text-center text-sm text-muted-foreground">
              {data.length === 0 ? "No clients yet" : "No matching clients"}
            </div>
          ) : (
            <div className="space-y-2">
              {pageRows.map((row) => {
                const c = row.original;
                const href = `${basePath}/${c.id}`;
                return (
                  <article
                    key={row.id}
                    style={{ backgroundColor: c.theme.bg }}
                    className={cn(
                      "rounded-lg border border-border p-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-black/5",
                      editing ? "" : "cursor-pointer",
                    )}
                    aria-label={editing ? undefined : `Open ${c.name}`}
                    tabIndex={editing ? undefined : 0}
                    onClick={(e) => navigateToRow(href, e)}
                    onKeyDown={(e) => {
                      if (editing) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                  >
                    <dl className="space-y-2.5">
                      {row.getVisibleCells().map((cell) => (
                        <div
                          key={cell.id}
                          className="flex flex-row items-center gap-3 border-b border-black/10 pb-2.5 text-left last:border-b-0 last:pb-0"
                        >
                          <dt className="w-[40%] max-w-[9.5rem] shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-500">
                            {directoryColumnLabel(
                              cell.column.columnDef.meta,
                              cell.column.id,
                            )}
                          </dt>
                          <dd className="min-w-0 flex-1 text-sm leading-snug">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Label
            htmlFor="client-roster-page-size"
            className="shrink-0 whitespace-nowrap text-sm text-muted-foreground"
          >
            Rows per page
          </Label>
          <select
            id="client-roster-page-size"
            className="h-10 min-w-0 shrink rounded-md border border-border bg-background px-3 text-sm text-foreground"
            value={pagination.pageSize}
            onChange={(e) =>
              setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
            }
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <p
            className="min-w-[6.5rem] text-center text-sm tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            Page{" "}
            <span className="font-medium text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {Math.max(1, table.getPageCount())}
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
