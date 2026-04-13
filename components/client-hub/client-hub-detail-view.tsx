"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ClientHubDetail } from "@/lib/demo-data/client-hub";

const TABS = [
  { id: "revenue", label: "Revenue" },
  { id: "payments", label: "Payments" },
  { id: "performance", label: "Performance" },
  { id: "updates", label: "Weekly updates" },
  { id: "comms", label: "Communication" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatChannel(channel: ClientHubDetail["communications"][number]["channel"]) {
  switch (channel) {
    case "email":
      return "Email";
    case "slack":
      return "Slack";
    case "call":
      return "Call";
    case "sms":
      return "SMS";
    default:
      return channel;
  }
}

function paymentStatusClass(status: "paid" | "scheduled" | "overdue") {
  switch (status) {
    case "paid":
      return "text-primary";
    case "scheduled":
      return "text-muted-foreground";
    case "overdue":
      return "text-destructive font-medium";
    default:
      return "";
  }
}

export function ClientHubDetailView({ detail }: { detail: ClientHubDetail }) {
  const [tab, setTab] = React.useState<TabId>("revenue");
  const baseId = `client-hub-${detail.id}`;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Button
            render={<Link href="/client/hub" />}
            nativeButton={false}
            variant="ghost"
            className="mb-2 -ml-2 h-9 gap-1 px-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            All clients
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {detail.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{detail.tagline}</p>
        </div>
      </div>

      <div className="min-w-0">
        <div
          role="tablist"
          aria-label="Client hub sections"
          className="flex min-w-0 gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t, i) => {
            const selected = tab === t.id;
            const panelId = `${baseId}-panel-${t.id}`;
            const tabId = `${baseId}-tab-${t.id}`;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className={cn(
                  "shrink-0 rounded-t-md border border-b-0 px-3 py-2.5 text-sm transition-colors",
                  selected
                    ? "border-border bg-card text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next =
                    e.key === "ArrowRight"
                      ? Math.min(TABS.length - 1, i + 1)
                      : Math.max(0, i - 1);
                  setTab(TABS[next]!.id);
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-b-md rounded-tr-md border border-t-0 border-border bg-card p-4 sm:p-6">
          <div
            role="tabpanel"
            id={`${baseId}-panel-revenue`}
            aria-labelledby={`${baseId}-tab-revenue`}
            hidden={tab !== "revenue"}
            className={tab === "revenue" ? undefined : "hidden"}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {detail.revenue.snapshots.map((s) => (
                <Card key={s.label} className="border-border bg-background/50">
                  <CardHeader className="pb-2">
                    <CardDescription>{s.label}</CardDescription>
                    <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {s.hint}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              {detail.revenue.footnote}
            </p>
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-payments`}
            aria-labelledby={`${baseId}-tab-payments`}
            hidden={tab !== "payments"}
            className={tab === "payments" ? undefined : "hidden"}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              {detail.payments.nextInvoiceNote}
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.payments.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.id}</TableCell>
                      <TableCell>
                        <time dateTime={row.date}>{row.date}</time>
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate sm:max-w-none">
                        {row.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.amount}
                      </TableCell>
                      <TableCell
                        className={cn("capitalize", paymentStatusClass(row.status))}
                      >
                        {row.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-performance`}
            aria-labelledby={`${baseId}-tab-performance`}
            hidden={tab !== "performance"}
            className={tab === "performance" ? undefined : "hidden"}
          >
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {detail.performance.narrative}
            </p>
            <ul className="grid gap-4 sm:grid-cols-3">
              {detail.performance.metrics.map((m) => (
                <li key={m.id}>
                  <Card className="border-border bg-background/50">
                    <CardHeader className="pb-2">
                      <CardDescription>{m.label}</CardDescription>
                      <CardTitle className="text-2xl tabular-nums">{m.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-0 text-xs text-muted-foreground">
                      <p>{m.period}</p>
                      <p className="text-foreground/80">{m.deltaLabel}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-updates`}
            aria-labelledby={`${baseId}-tab-updates`}
            hidden={tab !== "updates"}
            className={tab === "updates" ? undefined : "hidden"}
          >
            <ul className="space-y-6">
              {detail.weeklyUpdates.map((wu) => (
                <li key={wu.id}>
                  <Card className="border-border bg-background/50">
                    <CardHeader>
                      <CardTitle className="text-base">{wu.weekLabel}</CardTitle>
                      <CardDescription>{wu.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {wu.highlights.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-comms`}
            aria-labelledby={`${baseId}-tab-comms`}
            hidden={tab !== "comms"}
            className={tab === "comms" ? undefined : "hidden"}
          >
            <ul className="space-y-4">
              {detail.communications.map((c) => (
                <li key={c.id}>
                  <Card className="border-border bg-background/50">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <CardTitle className="text-base">{c.subject}</CardTitle>
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={c.at}
                        >
                          {new Date(c.at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                      <CardDescription>{formatChannel(c.channel)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {c.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
