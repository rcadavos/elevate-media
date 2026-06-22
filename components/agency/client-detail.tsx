"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Mail, MessageCircle, Pencil, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { billingModelSummary, clientInitials, serviceLabel } from "@/lib/agency/format";
import {
  mergeClientIntoCache,
  patchAdminClient,
  type ClientPatch,
} from "@/lib/query/clients";
import type {
  AgencyClient,
  ClientFeedback,
  ClientWeeklyMetric,
} from "@/lib/types/agency";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "billing", label: "Billing" },
  { id: "performance", label: "Performance" },
  { id: "feedback", label: "Feedback" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATUS_OPTIONS = ["Active", "Paused", "Inactive"] as const;
const SERVICE_OPTIONS = ["META", "SMS"] as const;

type Draft = {
  name: string;
  status: string;
  service: AgencyClient["service"];
  contact: string;
  email: string;
  profileNote: string;
  profitMargin: number;
  feeOnRevenue: number;
  feeOnProfit: number;
  billingDay: number;
  targetRevenue: number;
  targetRoas: number;
};

function draftFrom(c: AgencyClient): Draft {
  return {
    name: c.name,
    status: c.status,
    service: c.service,
    contact: c.contact,
    email: c.email,
    profileNote: c.profileNote,
    profitMargin: c.profitMargin,
    feeOnRevenue: c.feeOnRevenue,
    feeOnProfit: c.feeOnProfit,
    billingDay: c.billingDay,
    targetRevenue: c.targetRevenue,
    targetRoas: c.targetRoas,
  };
}

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function EditRow({
  label,
  editing,
  display,
  children,
}: {
  label: string;
  editing: boolean;
  display: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted-foreground sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-foreground sm:text-right">
        {editing && children ? children : display}
      </dd>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ClientDetail({
  client: initialClient,
  metrics,
  feedback,
  basePath = "/clients",
  editable = false,
}: {
  client: AgencyClient;
  metrics: ClientWeeklyMetric[];
  feedback: ClientFeedback[];
  /** Roster list route this detail links back to. */
  basePath?: string;
  /** Admin only — enables the edit mode (saves to the clients table). */
  editable?: boolean;
}) {
  const queryClient = useQueryClient();
  const [client, setClient] = React.useState(initialClient);
  const [tab, setTab] = React.useState<TabId>("profile");
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(initialClient));
  const baseId = `client-${client.id}`;

  const saveMutation = useMutation({
    mutationFn: (patch: ClientPatch) => patchAdminClient(client.id, patch),
    onSuccess: (updated) => {
      setClient(updated);
      setDraft(draftFrom(updated));
      mergeClientIntoCache(queryClient, updated);
      setEditing(false);
    },
  });

  const startEdit = () => {
    saveMutation.reset();
    setDraft(draftFrom(client));
    setTab("profile");
    setEditing(true);
  };

  const cancelEdit = () => {
    saveMutation.reset();
    setDraft(draftFrom(client));
    setEditing(false);
  };

  const num = (key: keyof Draft) => ({
    type: "number" as const,
    value: String(draft[key] as number),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({ ...d, [key]: Number(e.target.value) || 0 })),
    className: "h-9 sm:max-w-[12rem]",
  });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div>
        <Button
          render={<Link href={basePath} />}
          nativeButton={false}
          variant="ghost"
          className="mb-3 -ml-2 h-9 gap-1 px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          All clients
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ring-1 ring-inset ring-black/5 dark:ring-white/10"
              style={{ backgroundColor: client.theme.initial, color: client.theme.accent }}
              aria-hidden
            >
              {clientInitials(client.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {client.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    client.service === "META"
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {serviceLabel(client.service)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{client.contact}</span>
                <a
                  href={`mailto:${client.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-foreground hover:underline"
                >
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  {client.email}
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="size-3.5 shrink-0" aria-hidden />
                  {client.channel}
                </span>
              </div>
            </div>
          </div>

          {editable ? (
            <div className="flex shrink-0 gap-2">
              {editing ? (
                <>
                  <Button
                    type="button"
                    size="toolbar"
                    disabled={saveMutation.isPending}
                    onClick={() => saveMutation.mutate(draft)}
                  >
                    <Check className="size-4 shrink-0" aria-hidden />
                    {saveMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="toolbar"
                    disabled={saveMutation.isPending}
                    onClick={cancelEdit}
                  >
                    <X className="size-4 shrink-0" aria-hidden />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button type="button" variant="outline" size="toolbar" onClick={startEdit}>
                  <Pencil className="size-4 shrink-0" aria-hidden />
                  Edit
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {saveMutation.isError ? (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>{saveMutation.error.message}</AlertDescription>
          </Alert>
        ) : null}

        {editing ? (
          <div className="mt-4">
            <Label htmlFor={`${baseId}-note`} className="text-xs text-muted-foreground">
              Profile note
            </Label>
            <textarea
              id={`${baseId}-note`}
              value={draft.profileNote}
              onChange={(e) => setDraft((d) => ({ ...d, profileNote: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        ) : client.profileNote ? (
          <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
            {client.profileNote}
          </p>
        ) : null}
      </div>

      <div className="min-w-0">
        <div
          role="tablist"
          aria-label="Client sections"
          className="flex min-w-0 gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t, i) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${t.id}`}
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
          {/* Profile */}
          <div
            role="tabpanel"
            id={`${baseId}-panel-profile`}
            aria-labelledby={`${baseId}-tab-profile`}
            hidden={tab !== "profile"}
          >
            <dl className="max-w-xl">
              <EditRow label="Client name" editing={editing} display={client.name}>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className="h-9 sm:max-w-[16rem]"
                />
              </EditRow>
              <EditRow label="Status" editing={editing} display={client.status}>
                <select
                  aria-label="Status"
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring sm:w-40"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </EditRow>
              <EditRow
                label="Service"
                editing={editing}
                display={serviceLabel(client.service)}
              >
                <select
                  aria-label="Service"
                  value={draft.service}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      service: e.target.value as AgencyClient["service"],
                    }))
                  }
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring sm:w-40"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {serviceLabel(s)}
                    </option>
                  ))}
                </select>
              </EditRow>
              <EditRow label="Primary contact" editing={editing} display={client.contact}>
                <Input
                  value={draft.contact}
                  onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))}
                  className="h-9 sm:max-w-[16rem]"
                />
              </EditRow>
              <EditRow label="Email" editing={editing} display={client.email}>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  className="h-9 sm:max-w-[16rem]"
                />
              </EditRow>
              <EditRow label="Comms channel" editing={false} display={client.channel} />
              <EditRow
                label="Next drop"
                editing={false}
                display={
                  client.nextDropName || client.nextDropDate
                    ? `${client.nextDropName ?? "Scheduled"}${client.nextDropDate ? ` · ${client.nextDropDate}` : ""}`
                    : "None scheduled"
                }
              />
            </dl>
          </div>

          {/* Billing */}
          <div
            role="tabpanel"
            id={`${baseId}-panel-billing`}
            aria-labelledby={`${baseId}-tab-billing`}
            hidden={tab !== "billing"}
          >
            {!editing ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Card size="sm" className="bg-background/50">
                  <CardHeader className="pb-1">
                    <CardDescription>Agency fee</CardDescription>
                    <CardTitle className="text-xl">{billingModelSummary(client)}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    Percentage model — we get paid when the client gets paid.
                  </CardContent>
                </Card>
                <Card size="sm" className="bg-background/50">
                  <CardHeader className="pb-1">
                    <CardDescription>Assumed profit margin</CardDescription>
                    <CardTitle className="text-xl tabular-nums">
                      {client.profitMargin}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    Used to estimate client take-home.
                  </CardContent>
                </Card>
                <Card size="sm" className="bg-background/50">
                  <CardHeader className="pb-1">
                    <CardDescription>Target ROAS</CardDescription>
                    <CardTitle className="text-xl tabular-nums">
                      {client.targetRoas > 0 ? `${client.targetRoas.toFixed(1)}×` : "—"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    {client.service === "SMS" ? "Not tracked for SMS-only" : "Break-even guardrail"}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <dl className={cn("max-w-xl", !editing && "mt-6")}>
              <EditRow
                label="Fee on revenue"
                editing={editing}
                display={`${client.feeOnRevenue}%`}
              >
                <Input {...num("feeOnRevenue")} />
              </EditRow>
              <EditRow
                label="Fee on profit"
                editing={editing}
                display={`${client.feeOnProfit}%`}
              >
                <Input {...num("feeOnProfit")} />
              </EditRow>
              <EditRow
                label="Profit margin"
                editing={editing}
                display={`${client.profitMargin}%`}
              >
                <Input {...num("profitMargin")} />
              </EditRow>
              <EditRow
                label="Billing day"
                editing={editing}
                display={`Day ${client.billingDay} of month`}
              >
                <Input {...num("billingDay")} />
              </EditRow>
              <EditRow
                label="Target revenue"
                editing={editing}
                display={client.targetRevenue > 0 ? money(client.targetRevenue) : "Not set"}
              >
                <Input {...num("targetRevenue")} />
              </EditRow>
              <EditRow
                label="Target ROAS"
                editing={editing}
                display={client.targetRoas > 0 ? `${client.targetRoas.toFixed(1)}×` : "—"}
              >
                <Input {...num("targetRoas")} step="0.1" />
              </EditRow>
            </dl>
          </div>

          {/* Performance */}
          <div
            role="tabpanel"
            id={`${baseId}-panel-performance`}
            aria-labelledby={`${baseId}-tab-performance`}
            hidden={tab !== "performance"}
          >
            {metrics.length === 0 ? (
              <EmptyState
                title="No weekly Meta data yet"
                hint="Log weekly spend, revenue, and creatives in Meta Tracking to see ROAS trends and our cut here."
              />
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week of</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                      <TableHead className="text-right">Launched</TableHead>
                      <TableHead className="text-right">Killed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="whitespace-nowrap">{m.weekStart}</TableCell>
                        <TableCell className="text-right tabular-nums">{money(m.spend)}</TableCell>
                        <TableCell className="text-right tabular-nums">{money(m.revenue)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {m.spend > 0 ? `${(m.revenue / m.spend).toFixed(1)}×` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{m.launched}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.killed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div
            role="tabpanel"
            id={`${baseId}-panel-feedback`}
            aria-labelledby={`${baseId}-tab-feedback`}
            hidden={tab !== "feedback"}
          >
            {feedback.length === 0 ? (
              <EmptyState
                title="No feedback logged"
                hint="Capture what this client said on calls and in chat. Flip status from Open to Resolved as you close the loop."
              />
            ) : (
              <ul className="space-y-3">
                {feedback.map((f) => (
                  <li key={f.id}>
                    <Card size="sm" className="bg-background/50">
                      <CardHeader className="pb-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-base">{f.summary}</CardTitle>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                              f.status === "Resolved"
                                ? "border-primary/30 bg-primary/10 text-foreground"
                                : f.status === "In Progress"
                                  ? "border-border bg-muted text-muted-foreground"
                                  : "border-destructive/40 bg-destructive/5 text-destructive",
                            )}
                          >
                            {f.status}
                          </span>
                        </div>
                        <CardDescription>{f.date}{f.tag ? ` · ${f.tag}` : ""}</CardDescription>
                      </CardHeader>
                      {f.actionItems ? (
                        <CardContent className="pt-0 text-sm text-muted-foreground">
                          {f.actionItems}
                        </CardContent>
                      ) : null}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
