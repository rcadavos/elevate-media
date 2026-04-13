"use client";

import * as React from "react";
import { AlertTriangle, CalendarX2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardOperationalNotice } from "@/lib/demo-data/dashboard";
import { cn } from "@/lib/utils";

function storageKey(scope: string) {
  return `elev8te_operational_notices_dismissed:${scope}`;
}

function loadDismissed(scope: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(scope));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveDismissed(scope: string, ids: Set<string>) {
  try {
    localStorage.setItem(storageKey(scope), JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

type NeedsAttentionCardListProps = {
  items: readonly DashboardOperationalNotice[];
  scope: "admin" | "workspace";
  /** Admin sidebar: single column. Workspace: two columns from `sm`. */
  layout: "sidebar" | "grid";
};

export function NeedsAttentionCardList({
  items,
  scope,
  layout,
}: NeedsAttentionCardListProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(() => new Set());
  const [storageRead, setStorageRead] = React.useState(false);

  React.useEffect(() => {
    setDismissed(loadDismissed(scope));
    setStorageRead(true);
  }, [scope]);

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(scope, next);
      return next;
    });
  };

  const visible = items.filter((i) => !dismissed.has(i.id));

  if (storageRead && visible.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground" role="status">
        No open alerts to show.
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "mt-3 list-none p-0",
        layout === "sidebar"
          ? "flex flex-col gap-3"
          : "grid gap-3 sm:grid-cols-2 sm:gap-4",
      )}
    >
      {visible.map((item) => (
        <li key={item.id}>
          <Card
            size="sm"
            className={cn(
              "relative h-full shadow-sm",
              item.kind === "critical"
                ? "border-destructive/40 bg-destructive/5"
                : "border-border bg-muted/30",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 z-[1] size-8 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={`Dismiss alert: ${item.title}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => dismiss(item.id)}
            >
              <X className="size-4" aria-hidden />
            </Button>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2 pr-10">
              {item.kind === "critical" ? (
                <AlertTriangle
                  className="mt-0.5 size-5 shrink-0 text-destructive"
                  aria-hidden
                />
              ) : (
                <CalendarX2
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              )}
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-base leading-snug">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-pretty">
                  {item.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  );
}
