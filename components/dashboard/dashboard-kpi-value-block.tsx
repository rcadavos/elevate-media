import { TrendingUp } from "lucide-react";
import type { DashboardKpi } from "@/lib/demo-data/dashboard";

export function DashboardKpiValueBlock({ kpi }: { kpi: DashboardKpi }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-3xl font-semibold tabular-nums text-foreground">
          {kpi.value}
        </p>
        <div
          className="flex shrink-0 flex-col items-end gap-0.5"
          aria-label={`${kpi.trendPercent} vs prior period`}
        >
          <TrendingUp
            className="size-5 text-primary opacity-90"
            aria-hidden
          />
          <span className="text-xs font-semibold tabular-nums text-primary">
            {kpi.trendPercent}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{kpi.hint}</p>
    </>
  );
}
