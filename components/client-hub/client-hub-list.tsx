import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import type { ClientHubSummary } from "@/lib/demo-data/client-hub";

function healthCopy(health: ClientHubSummary["health"]) {
  switch (health) {
    case "strong":
      return { label: "On track", className: "text-primary" };
    case "watch":
      return { label: "Watch", className: "text-amber-600 dark:text-amber-400" };
    case "at_risk":
      return {
        label: "Needs attention",
        className: "text-destructive",
      };
    default:
      return { label: health, className: "text-muted-foreground" };
  }
}

export function ClientHubList({ items }: { items: ClientHubSummary[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((client) => {
        const h = healthCopy(client.health);
        return (
          <li key={client.id}>
            <Card className="h-full border-border transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg leading-tight">
                      {client.name}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {client.tagline}
                    </CardDescription>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${h.className}`}
                  >
                    {h.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-0">
                <p className="text-xs text-muted-foreground">
                  Last activity{" "}
                  <time dateTime={client.lastActivityDate}>
                    {client.lastActivityDate}
                  </time>
                </p>
                <Button
                  render={<Link href={`/client/hub/${client.id}`} />}
                  nativeButton={false}
                  variant="secondary"
                  className="w-full justify-between"
                >
                  Open hub
                  <ChevronRight className="size-4 shrink-0 opacity-70" aria-hidden />
                </Button>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
