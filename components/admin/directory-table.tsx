"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Column,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ListFilter,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { DirectoryRole } from "@/lib/constants/directory-roles";
import type { ProfileRow } from "@/lib/types/profile";
import { adminDirectoryRowHref } from "@/lib/admin/directory-row-href";
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
import { cn } from "@/lib/utils";

type DirectoryTableProps = {
  role: DirectoryRole;
  rows: ProfileRow[];
  /** First fetch for this query (no cached data yet). */
  isInitialLoading?: boolean;
  /** Right side of the toolbar (e.g. Add User). Placed after the status filter. */
  toolbarEnd?: ReactNode;
};

function formatAdded(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

function DirectorySortHeader({
  column,
  label,
}: {
  column: Column<ProfileRow, unknown>;
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

export function DirectoryTable({
  role,
  rows,
  isInitialLoading = false,
  toolbarEnd,
}: DirectoryTableProps) {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [statusIncludeActive, setStatusIncludeActive] = useState(true);
  const [statusIncludeInactive, setStatusIncludeInactive] = useState(true);
  const [statusIncludePending, setStatusIncludePending] = useState(true);
  const [statusIncludeCompleted, setStatusIncludeCompleted] = useState(true);
  const isClientRole = role === "client";

  const statusSelectedCount = isClientRole
    ? (statusIncludePending ? 1 : 0) + (statusIncludeCompleted ? 1 : 0)
    : (statusIncludeActive ? 1 : 0) + (statusIncludeInactive ? 1 : 0);

  const filteredRows = useMemo(() => {
    let next = rows.filter((r) => {
      if (isClientRole) {
        const onboardingStatus = r.onboarding_status ?? "completed";
        if (onboardingStatus === "pending" && statusIncludePending) return true;
        if (onboardingStatus === "completed" && statusIncludeCompleted) return true;
        return false;
      }

      const active = r.is_active !== false;
      if (active && statusIncludeActive) return true;
      if (!active && statusIncludeInactive) return true;
      return false;
    });
    const q = search.trim().toLowerCase();
    if (q) {
      next = next.filter((r) => {
        const name = (r.full_name ?? "").toLowerCase();
        const email = (r.email ?? "").toLowerCase();
        const business = (r.business_name ?? "").toLowerCase();
        return (
          name.includes(q) || email.includes(q) || business.includes(q)
        );
      });
    }
    return next;
  }, [
    isClientRole,
    rows,
    search,
    statusIncludeActive,
    statusIncludeInactive,
    statusIncludePending,
    statusIncludeCompleted,
  ]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [
    role,
    rows.length,
    search,
    statusIncludeActive,
    statusIncludeInactive,
    statusIncludePending,
    statusIncludeCompleted,
    sorting,
  ]);

  const columns = useMemo<ColumnDef<ProfileRow>[]>(() => {
    const nameColumn: ColumnDef<ProfileRow> = {
      id: "full_name",
      accessorFn: (row) => row.full_name?.trim() || "",
      meta: {
        directoryLabel: role === "client" ? "Client name" : "Name",
      },
      header: ({ column }) => (
        <DirectorySortHeader
          column={column}
          label={role === "client" ? "Client name" : "Name"}
        />
      ),
      cell: ({ row }) => {
        const v = row.original.full_name?.trim();
        const label = v ? v : "—";
        const href = adminDirectoryRowHref(role, row.original);
        const nameLink =
          !href ? (
            <span className="font-medium text-foreground">{label}</span>
          ) : (
            <Link
              href={href}
              className="font-medium text-foreground no-underline hover:no-underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </Link>
          );
        const avatarUrl = row.original.avatar_url?.trim();
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : null}
            </span>
            <div className="min-w-0">{nameLink}</div>
          </div>
        );
      },
    };

    const emailColumn: ColumnDef<ProfileRow> = {
      accessorKey: "email",
      meta: { directoryLabel: "Email" },
      header: ({ column }) => <DirectorySortHeader column={column} label="Email" />,
      cell: ({ row, getValue }) => {
        const v = getValue() as string | null;
        const text = v?.trim() ? v : "—";
        const href = adminDirectoryRowHref(role, row.original);
        if (!v?.trim()) {
          return <span className="text-muted-foreground">—</span>;
        }
        if (!href) {
          return <span className="text-muted-foreground">{text}</span>;
        }
        return (
          <Link
            href={href}
            className="text-muted-foreground no-underline hover:text-foreground hover:no-underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {text}
          </Link>
        );
      },
    };

    const nameEmail: ColumnDef<ProfileRow>[] = [nameColumn, emailColumn];

    const businessColumn: ColumnDef<ProfileRow> = {
      id: "business_name",
      accessorFn: (row) => row.business_name?.trim() || "",
      meta: { directoryLabel: "Business" },
      header: ({ column }) => (
        <DirectorySortHeader column={column} label="Business" />
      ),
      cell: ({ row }) => {
        const logo = row.original.business_logo_url?.trim();
        const v = row.original.business_name?.trim();
        const href = adminDirectoryRowHref(role, row.original);
        const text =
          !v ? (
            <span className="text-muted-foreground">—</span>
          ) : !href ? (
            <span className="text-foreground">{v}</span>
          ) : (
            <Link
              href={href}
              className="text-foreground no-underline hover:no-underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {v}
            </Link>
          );
        if (role !== "client") {
          return text;
        }
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
                <img src={logo} alt="" className="size-full object-cover" />
              ) : null}
            </span>
            <div className="min-w-0">{text}</div>
          </div>
        );
      },
    };

    const addedColumn: ColumnDef<ProfileRow> = {
      accessorKey: "created_at",
      sortingFn: "datetime",
      meta: { directoryLabel: "Added" },
      header: ({ column }) => <DirectorySortHeader column={column} label="Added" />,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatAdded(getValue() as string)}
        </span>
      ),
    };

    const statusOrOnboardingColumn: ColumnDef<ProfileRow> = {
      id: "is_active",
      accessorFn: (row) =>
        role === "client" ? row.onboarding_status ?? "completed" : row.is_active,
      meta: {
        directoryLabel: role === "client" ? "Onboarding status" : "Status",
      },
      header: ({ column }) => (
        <DirectorySortHeader
          column={column}
          label={role === "client" ? "Onboarding Status" : "Status"}
        />
      ),
      cell: (ctx) => {
        const { getValue } = ctx;
        if (role === "client") {
          const onboardingStatus = getValue() as "pending" | "completed";
          const isPending = onboardingStatus === "pending";
          const href = adminDirectoryRowHref(role, ctx.row.original);
          const badge = (
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                isPending
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
              )}
            >
              {isPending ? "Pending" : "Completed"}
            </span>
          );
          if (href) {
            return (
              <Link
                href={href}
                className="inline-flex focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {badge}
              </Link>
            );
          }
          return badge;
        }
        const active = getValue() !== false;
        return (
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
              active
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    };

    const dateJoinedColumn: ColumnDef<ProfileRow> = {
      id: "date_joined",
      accessorKey: "date_joined",
      sortUndefined: "last",
      sortingFn: "datetime",
      meta: { directoryLabel: "Date joined" },
      header: ({ column }) => (
        <DirectorySortHeader column={column} label="Date Joined" />
      ),
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined;
        return (
          <span className="whitespace-nowrap text-muted-foreground">
            {v?.trim() ? formatAdded(v) : "—"}
          </span>
        );
      },
    };

    if (role === "client") {
      return [
        businessColumn,
        ...nameEmail,
        statusOrOnboardingColumn,
        dateJoinedColumn,
        addedColumn,
      ];
    }
    return [...nameEmail, statusOrOnboardingColumn, addedColumn];
  }, [role]);

  // TanStack Table: useReactTable is intentionally excluded from React Compiler memoization.
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

  const searchId = `directory-search-${role}`;

  return (
    <div className="mt-8 space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Label htmlFor={searchId} className="sr-only">
              {isClientRole ?
                "Search by name, email, or business"
              : "Search by name or email"}
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id={searchId}
                type="search"
                placeholder={
                  isClientRole ?
                    "Search by name, email, or business"
                  : "Search by name or email"
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={isInitialLoading}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex w-full flex-row items-stretch gap-2 sm:w-auto sm:items-center sm:justify-end sm:gap-2">
            <div className="min-w-0 flex-1 sm:flex-none sm:shrink-0">
              <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                disabled={isInitialLoading}
                aria-label={
                  isClientRole
                    ? `Filter by onboarding status, ${statusSelectedCount} of 2 selected`
                    : `Filter by status, ${statusSelectedCount} of 2 selected`
                }
                className={cn(
                  "inline-flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-[color,box-shadow]",
                  "sm:w-auto sm:justify-center",
                  "hover:bg-muted/80",
                  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "disabled:pointer-events-none disabled:opacity-50",
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
                    statusSelectedCount > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {statusSelectedCount}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuLabel>
                  {isClientRole ? "Onboarding Status" : "Status"}
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={isClientRole ? statusIncludePending : statusIncludeActive}
                  onCheckedChange={(next) =>
                    isClientRole
                      ? setStatusIncludePending(Boolean(next))
                      : setStatusIncludeActive(Boolean(next))
                  }
                >
                  {isClientRole ? "Pending" : "Active"}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={isClientRole ? statusIncludeCompleted : statusIncludeInactive}
                  onCheckedChange={(next) =>
                    isClientRole
                      ? setStatusIncludeCompleted(Boolean(next))
                      : setStatusIncludeInactive(Boolean(next))
                  }
                >
                  {isClientRole ? "Completed" : "Inactive"}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {toolbarEnd ? (
              <div className="flex min-w-0 flex-1 sm:flex-none sm:shrink-0">
                {toolbarEnd}
              </div>
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
              {isInitialLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={colCount}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colCount}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {rows.length === 0
                      ? "No data available"
                      : "No matching users"}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => {
                  const href = adminDirectoryRowHref(role, row.original);
                  const rowLabel =
                    row.original.full_name?.trim() ||
                    row.original.email?.trim() ||
                    "User";
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(href && "cursor-pointer")}
                      aria-label={href ? `Open profile: ${rowLabel}` : undefined}
                      onClick={
                        href
                          ? (e) => {
                              const t = e.target as HTMLElement;
                              if (t.closest("a, button")) return;
                              router.push(href);
                            }
                          : undefined
                      }
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
          {isInitialLoading ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex h-24 items-center justify-center px-2 text-center text-sm text-muted-foreground">
              {rows.length === 0
                ? "No data available"
                : "No matching users"}
            </div>
          ) : (
            <div className="space-y-2">
              {pageRows.map((row) => {
                const href = adminDirectoryRowHref(role, row.original);
                const rowLabel =
                  row.original.full_name?.trim() ||
                  row.original.email?.trim() ||
                  "User";
                const goRow = () => {
                  if (href) router.push(href);
                };
                return (
                  <article
                    key={row.id}
                    className={cn(
                      "rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm",
                      href &&
                        "cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/50",
                    )}
                    aria-label={href ? `Open profile: ${rowLabel}` : undefined}
                    tabIndex={href ? 0 : undefined}
                    onClick={
                      href
                        ? (e) => {
                            const t = e.target as HTMLElement;
                            if (t.closest("a, button")) return;
                            goRow();
                          }
                        : undefined
                    }
                    onKeyDown={
                      href
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              goRow();
                            }
                          }
                        : undefined
                    }
                  >
                    <dl className="space-y-2.5">
                      {row.getVisibleCells().map((cell) => (
                        <div
                          key={cell.id}
                          className="flex flex-row items-center gap-3 border-b border-border/60 pb-2.5 text-left last:border-b-0 last:pb-0"
                        >
                          <dt className="w-[40%] max-w-[9.5rem] shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
            htmlFor={`directory-page-size-${role}`}
            className="shrink-0 text-sm text-muted-foreground whitespace-nowrap"
          >
            Rows per page
          </Label>
          <select
            id={`directory-page-size-${role}`}
            className="h-10 min-w-0 shrink rounded-md border border-border bg-background px-3 text-sm text-foreground"
            value={pagination.pageSize}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPagination({ pageIndex: 0, pageSize: next });
            }}
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
            disabled={!table.getCanPreviousPage() || isInitialLoading}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <p
            className="min-w-[6.5rem] text-center text-sm text-muted-foreground tabular-nums"
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
            disabled={!table.getCanNextPage() || isInitialLoading}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
