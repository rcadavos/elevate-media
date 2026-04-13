import { DashboardKpiValueBlock } from "@/components/dashboard/dashboard-kpi-value-block";
import { DashboardSalesSection } from "@/components/dashboard/dashboard-sales-section";
import { NeedsAttentionCardList } from "@/components/dashboard/needs-attention-card-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  dashboardKpis,
  dashboardOperationalNotices,
} from "@/lib/demo-data/dashboard";

export type DashboardHomeContentProps = {
  title?: string;
  description?: string;
};

export function DashboardHomeContent({
  title = "Dashboard",
  description =
    "Revenue snapshot, operational signals, and today's sales motion — demo data for the Agency OS walkthrough.",
}: DashboardHomeContentProps = {}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          elev8temedia
        </p>
        <div className="mt-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </header>

      <section aria-labelledby="dashboard-kpis-heading">
        <h2 id="dashboard-kpis-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardKpis.map((kpi) => (
            <Card key={kpi.id} size="sm" className="shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <DashboardKpiValueBlock kpi={kpi} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="dashboard-alerts-heading"
        className="min-w-0 -mt-2"
      >
        <h2
          id="dashboard-alerts-heading"
          className="text-sm font-medium text-foreground"
        >
          Needs attention
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Static examples — wire to Finance and Operations when data is live.
        </p>
        <NeedsAttentionCardList
          items={dashboardOperationalNotices}
          scope="workspace"
          layout="grid"
        />
      </section>

      <DashboardSalesSection />
    </div>
  );
}
