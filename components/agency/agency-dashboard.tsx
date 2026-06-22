import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { NeedsAttentionCardList } from "@/components/dashboard/needs-attention-card-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { billingModelSummary, clientInitials, serviceLabel } from "@/lib/agency/format";
import { agencyKpis, agencyNotices } from "@/lib/agency/dashboard-stats";
import type { AgencyClient } from "@/lib/types/agency";
import { cn } from "@/lib/utils";

export function AgencyDashboard({ clients }: { clients: AgencyClient[] }) {
  const kpis = agencyKpis(clients);
  const notices = agencyNotices(clients);

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          elev8temedia
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Live view of the agency — your active roster, billing model, and what
          needs attention. Imported from the elev8temedia client tracker.
        </p>
      </header>

      <section aria-labelledby="dashboard-kpis">
        <h2 id="dashboard-kpis" className="sr-only">Key metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id} size="sm" className="shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:items-start">
        <section className="min-w-0 lg:col-span-2" aria-labelledby="roster-heading">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 id="roster-heading" className="text-sm font-medium text-foreground">
                Active roster
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Client health at a glance.</p>
            </div>
            <Button
              render={<Link href="/clients" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              View all
              <ArrowRight className="size-4 shrink-0 opacity-70" aria-hidden />
            </Button>
          </div>

          <Card className="mt-3 shadow-sm">
            <CardContent className="divide-y divide-border p-0">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ring-1 ring-inset ring-black/5 dark:ring-white/10"
                    style={{ backgroundColor: client.theme.initial, color: client.theme.accent }}
                    aria-hidden
                  >
                    {clientInitials(client.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{client.contact}</p>
                  </div>
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium sm:inline-flex",
                      client.service === "META"
                        ? "border-primary/30 bg-primary/10 text-foreground"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {serviceLabel(client.service)}
                  </span>
                  <span className="hidden w-28 shrink-0 text-right text-xs text-muted-foreground md:block">
                    {billingModelSummary(client)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="min-w-0 lg:col-span-1" aria-labelledby="attention-heading">
          <h2 id="attention-heading" className="text-sm font-medium text-foreground">
            Needs attention
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Operational signals from your data.
          </p>
          <NeedsAttentionCardList items={notices} scope="workspace" layout="sidebar" />

          <div className="mt-6 space-y-2">
            <Button
              render={<Link href="/clients" />}
              nativeButton={false}
              variant="outline"
              className="h-10 w-full justify-start gap-2 rounded-md"
            >
              <Users className="size-4 shrink-0" aria-hidden />
              Open Client Hub
            </Button>
            <Button
              render={<Link href="/sops" />}
              nativeButton={false}
              variant="outline"
              className="h-10 w-full justify-start gap-2 rounded-md"
            >
              <BookOpen className="size-4 shrink-0" aria-hidden />
              Open Playbooks
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
