import Link from "next/link";
import { clientInitials, serviceLabel } from "@/lib/agency/format";
import type { AgencyClient } from "@/lib/types/agency";

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function GoalsBoard({ clients }: { clients: AgencyClient[] }) {
  const active = clients.filter((c) => c.status === "Active");

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {active.map((client, i) => {
        const target = client.targetRevenue;
        // No weekly revenue logged yet → 0% to target.
        const pct = 0;
        return (
          <article
            key={client.id}
            className="flex flex-col gap-3 rounded-xl border border-border p-4 text-zinc-900 shadow-sm ring-1 ring-inset ring-black/5"
            style={{ backgroundColor: client.theme.bg }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ring-black/5"
                  style={{
                    backgroundColor: client.theme.initial,
                    color: client.theme.accent,
                  }}
                  aria-hidden
                >
                  {clientInitials(client.name)}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="block truncate font-semibold tracking-tight hover:underline"
                    style={{ color: client.theme.accent }}
                  >
                    {client.name}
                  </Link>
                  <p className="truncate text-xs text-zinc-600">
                    {serviceLabel(client.service)} · {client.feeOnRevenue}% fee/rev ·{" "}
                    {client.contact}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-zinc-500">
                #{i + 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/60 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Monthly Rev Target
                </p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900">
                  {target > 0 ? money(target) : "Not set"}
                </p>
              </div>
              <div className="rounded-lg bg-white/60 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Target ROAS
                </p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900">
                  {client.targetRoas > 0 ? `${client.targetRoas.toFixed(1)}×` : "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-zinc-600">
                {money(0)} of {target > 0 ? money(target) : "—"} · {pct}%
              </p>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-black/10"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: client.theme.accent }}
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Next Scale Moves
              </p>
              <p className="mt-1 rounded-md border border-dashed border-black/15 bg-white/40 px-2.5 py-2 text-xs text-zinc-500">
                No moves planned yet.
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
