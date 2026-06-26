"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { breakEvenRoas, clientInitials, formatRoas } from "@/lib/agency/format";
import type { AgencyClient } from "@/lib/types/agency";

const COLUMNS = [
  "Client",
  "Spend",
  "Revenue",
  "Launched",
  "Killed",
  "ROAS",
  "Break-Even",
  "Notes",
] as const;

function mondayOf(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function shift(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function fmtWeek(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ClientLogo({ client }: { client: AgencyClient }) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ring-black/5"
      style={{ backgroundColor: client.theme.initial, color: client.theme.accent }}
      aria-hidden
    >
      {clientInitials(client.name)}
    </span>
  );
}

export function MetaTracking({ clients }: { clients: AgencyClient[] }) {
  // Initialize after mount to avoid SSR/client hydration mismatch on the date.
  const [weekStart, setWeekStart] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setWeekStart(mondayOf(new Date()));
  }, []);

  const active = clients.filter((c) => c.status === "Active");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Weekly inputs</h2>
          <p className="text-sm text-muted-foreground">
            Per-client spend, revenue, and creatives. Each week is a separate
            record.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setWeekStart((d) => (d ? shift(d, -7) : d))}
            disabled={!weekStart}
            className="gap-1"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            Prev
          </Button>
          <span className="min-w-[9.5rem] text-center text-sm font-medium tabular-nums text-foreground">
            {weekStart ? `Week of ${fmtWeek(weekStart)}` : "—"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setWeekStart((d) => (d ? shift(d, 7) : d))}
            disabled={!weekStart}
            className="gap-1"
          >
            Next
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setWeekStart(mondayOf(new Date()))}
          >
            This week
          </Button>
        </div>
      </div>

      <p
        className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
        role="status"
      >
        No weekly Meta data has been logged yet. This is the grid the team fills
        each week — spend, revenue, and creatives launched/killed per client.
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {COLUMNS.map((col, i) => (
                <th
                  key={col}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                    i === 0 || i === COLUMNS.length - 1 ? "text-left" : "text-center"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {active.map((client) => {
              const be = breakEvenRoas(client);
              return (
                <tr
                  key={client.id}
                  style={{ backgroundColor: client.theme.bg }}
                  className="text-zinc-900"
                >
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <ClientLogo client={client} />
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-semibold hover:underline"
                        style={{ color: client.theme.accent }}
                      >
                        {client.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center text-zinc-400">—</td>
                  <td className="px-3 py-2.5 text-center text-zinc-400">—</td>
                  <td className="px-3 py-2.5 text-center text-zinc-400">—</td>
                  <td className="px-3 py-2.5 text-center text-zinc-400">—</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex rounded-full border border-zinc-300 bg-white/70 px-2 py-0.5 text-xs font-medium text-zinc-500">
                      —
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-medium tabular-nums text-zinc-700">
                    {be > 0 ? formatRoas(be) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-400">—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
