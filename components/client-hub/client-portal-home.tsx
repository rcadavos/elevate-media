"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchSessionSummary } from "@/lib/query/session-summary";
import { Alert, AlertDescription, AlertTitle, Button } from "@/components/ui";
import { getClientHubSummaries } from "@/lib/demo-data/client-hub";

export function ClientPortalHome() {
  const router = useRouter();
  const hubCount = getClientHubSummaries().length;

  const sessionQuery = useQuery({
    queryKey: queryKeys.me.sessionSummary(),
    queryFn: () =>
      fetchSessionSummary({
        onUnauthorized: () => {
          router.replace("/login");
        },
      }),
    retry: false,
  });

  if (sessionQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] flex-col justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (sessionQuery.isError) {
    if (sessionQuery.error.message === "Unauthorized") {
      return (
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
      );
    }
    return (
      <Alert variant="destructive">
        <AlertTitle>Session unavailable</AlertTitle>
        <AlertDescription>
          Session could not be loaded. Check your Supabase environment and refresh.
        </AlertDescription>
      </Alert>
    );
  }

  const data = sessionQuery.data;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          elev8temedia
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Client portal
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{data.email}</span>. Open
          Client Hub for revenue, payments, performance, weekly updates, and recent
          communication with your elev8temedia team.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          render={<Link href="/client/hub" />}
          nativeButton={false}
          className="justify-center sm:min-w-[12rem]"
        >
          <Building2 className="size-4 shrink-0 opacity-90" aria-hidden />
          Client Hub
          {hubCount > 0 ? (
            <span className="ml-1.5 text-xs font-normal tabular-nums opacity-80">
              ({hubCount})
            </span>
          ) : null}
        </Button>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="outline"
        >
          Marketing home
        </Button>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
