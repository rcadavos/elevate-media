"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { ChevronDown, ListFilter, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { DirectoryRole } from "@/lib/constants/directory-roles";
import type { ProfileRow } from "@/lib/types/profile";
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

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

export function DirectoryTable({
  role,
  rows,
  isInitialLoading = false,
  toolbarEnd,
}: DirectoryTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [statusIncludeActive, setStatusIncludeActive] = useState(true);
  const [statusIncludeInactive, setStatusIncludeInactive] = useState(true);

  const statusSelectedCount =
    (statusIncludeActive ? 1 : 0) + (statusIncludeInactive ? 1 : 0);

  const filteredRows = useMemo(() => {
    let next = rows.filter((r) => {
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
        return name.includes(q) || email.includes(q);
      });
    }
    return next;
  }, [rows, search, statusIncludeActive, statusIncludeInactive]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [role, rows.length, search, statusIncludeActive, statusIncludeInactive]);

  const columns = useMemo<ColumnDef<ProfileRow>[]>(
    () => [
      {
        id: "full_name",
        accessorFn: (row) => row.full_name?.trim() || "",
        header: "Name",
        cell: ({ row }) => {
          const v = row.original.full_name?.trim();
          const label = v ? v : "—";
          const href = `/admin/directory/${role}/${row.original.id}`;
          return (
            <Link
              href={href}
              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </Link>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row, getValue }) => {
          const v = getValue() as string | null;
          const text = v?.trim() ? v : "—";
          const href = `/admin/directory/${role}/${row.original.id}`;
          if (!v?.trim()) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <Link
              href={href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {text}
            </Link>
          );
        },
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => {
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
      },
      {
        accessorKey: "created_at",
        header: "Added",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatAdded(getValue() as string)}
          </span>
        ),
      },
    ],
    [role],
  );

  // TanStack Table: useReactTable is intentionally excluded from React Compiler memoization.
  // eslint-disable-next-line react-hooks/incompatible-library -- table instance API
  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
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
              Search by name or email
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id={searchId}
                type="search"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={isInitialLoading}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                disabled={isInitialLoading}
                aria-label={`Filter by status, ${statusSelectedCount} of 2 selected`}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-[color,box-shadow]",
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
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={statusIncludeActive}
                  onCheckedChange={(next) => setStatusIncludeActive(Boolean(next))}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusIncludeInactive}
                  onCheckedChange={(next) =>
                    setStatusIncludeInactive(Boolean(next))
                  }
                >
                  Inactive
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {toolbarEnd ? (
              <div className="flex shrink-0 items-center">{toolbarEnd}</div>
            ) : null}
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
              pageRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`directory-page-size-${role}`}
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Rows per page
          </Label>
          <select
            id={`directory-page-size-${role}`}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
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

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
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
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isInitialLoading}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isInitialLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
