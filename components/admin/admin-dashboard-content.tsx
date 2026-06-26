import { AdminDashboardDismissibleTip } from "@/components/admin/admin-dashboard-dismissible-tip";
import { AdminDashboardPerformanceChart } from "@/components/admin/admin-dashboard-performance-chart";
import { DashboardSalesSection } from "@/components/dashboard/dashboard-sales-section";
import { NeedsAttentionCardList } from "@/components/dashboard/needs-attention-card-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { agencyKpis, agencyNotices } from "@/lib/agency/dashboard-stats";
import { adminWeeklyPerformanceDemo } from "@/lib/demo-data/dashboard";
import type { AgencyClient } from "@/lib/types/agency";

export function AdminDashboardContent({ clients }: { clients: AgencyClient[] }) {
  const kpis = agencyKpis(clients);
  const notices = agencyNotices(clients);

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="min-w-0">
        <div className="mt-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Admin dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            High-level view for running elev8temedia. Client figures are from the
            live roster; performance trends are demo until weekly data is logged.
          </p>
        </div>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <section aria-labelledby="admin-dashboard-kpis-heading">
            <h2 id="admin-dashboard-kpis-heading" className="sr-only">
              Key metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {kpis.map((kpi) => (
                <Card key={kpi.id} size="sm" className="shadow-sm">
                  <CardHeader className="pb-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {kpi.label}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section aria-labelledby="admin-dashboard-chart-heading">
            <h2 id="admin-dashboard-chart-heading" className="sr-only">
              Performance line chart
            </h2>
            <Card className="shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base">Performance line chart</CardTitle>
                    <CardDescription>
                      Demo blended delivery score (0–300) by weekday — this week vs
                      last week. Wire to Operations or reporting when live.
                    </CardDescription>
                  </div>
                  <ul
                    className="flex shrink-0 list-none flex-wrap items-center gap-x-4 gap-y-2 p-0 text-xs text-muted-foreground"
                    aria-label="Chart legend"
                  >
                    <li className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full bg-[var(--chart-1)]"
                        aria-hidden
                      />
                      This week
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full bg-[var(--chart-2)]"
                        aria-hidden
                      />
                      Last week
                    </li>
                  </ul>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <AdminDashboardPerformanceChart data={adminWeeklyPerformanceDemo} />
              </CardContent>
            </Card>
          </section>
        </div>

        <aside
          className="min-w-0 lg:col-span-1 lg:self-start"
          aria-labelledby="admin-dashboard-alerts-heading"
        >
          <h2
            id="admin-dashboard-alerts-heading"
            className="text-sm font-medium text-foreground"
          >
            Needs attention
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Operational signals from your roster.
          </p>
          <NeedsAttentionCardList items={notices} scope="admin" layout="sidebar" />
          <AdminDashboardDismissibleTip />
        </aside>
      </div>

      <DashboardSalesSection />
    </div>
  );
}
