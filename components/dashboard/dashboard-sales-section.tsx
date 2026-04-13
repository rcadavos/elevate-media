import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dashboardSalesActivity,
  formatSalesOutcome,
} from "@/lib/demo-data/dashboard";
import { cn } from "@/lib/utils";

export function DashboardSalesSection() {
  return (
    <section aria-labelledby="dashboard-sales-heading" className="min-w-0">
      <h2
        id="dashboard-sales-heading"
        className="text-sm font-medium text-foreground"
      >
        Daily sales activity
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Snippet of outreach and calls — mirrors the Sales Pipeline module.
      </p>
      <Card className="mt-4 shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Today</CardTitle>
          <CardDescription>
            Last updated for demo — 2026-04-13 (America/New_York)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="min-w-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap pl-4">Time</TableHead>
                  <TableHead className="whitespace-nowrap">Lead</TableHead>
                  <TableHead className="min-w-[12rem]">Activity</TableHead>
                  <TableHead className="whitespace-nowrap pr-4 text-right">
                    Outcome
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardSalesActivity.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap pl-4 font-mono text-xs text-muted-foreground">
                      {row.timeLabel}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-foreground">
                      {row.leadName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.summary}
                    </TableCell>
                    <TableCell className="pr-4 text-right text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "inline-block rounded-md border px-2 py-0.5 tabular-nums",
                          row.outcome === "booked"
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        {formatSalesOutcome(row.outcome)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
