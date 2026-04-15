"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchSessionSummary } from "@/lib/query/session-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice") ?? undefined;
  const errorParam = searchParams.get("error") ?? undefined;

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
      <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col bg-background px-4 py-12 sm:px-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (sessionQuery.isError) {
    if (sessionQuery.error.message === "Unauthorized") {
      return (
        <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col bg-background px-4 py-12 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Redirecting to sign in…
          </p>
        </div>
      );
    }
    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col bg-background px-4 py-12 sm:px-6">
        <Alert variant="destructive">
          <AlertTitle>Session unavailable</AlertTitle>
          <AlertDescription>
            Session could not be loaded. Check your Supabase environment and
            refresh.
          </AlertDescription>
        </Alert>
        <Button
          render={<Link href="/login?error=missing_config" />}
          nativeButton={false}
          variant="link"
          className="mt-4 inline-flex h-auto items-center gap-1.5 px-0"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          Back to sign in
        </Button>
      </div>
    );
  }

  const data = sessionQuery.data;
  if (!data) {
    return null;
  }

  const workspaceRole = data.role?.trim().toLowerCase() ?? null;
  const isAdmin = workspaceRole === "admin";
  const profileError = data.profileError;
  const noProfile = data.noProfile;
  const showAdminRoleHint =
    !profileError &&
    !noProfile &&
    workspaceRole !== null &&
    !isAdmin;

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col bg-background px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        elev8temedia
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        Welcome to your workspace
      </h1>

      {notice === "admin_only" ? (
        <p
          className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          That area is limited to admin accounts. Ask an admin to grant you
          access if you need it.
        </p>
      ) : null}

      {errorParam === "profiles_unavailable" || profileError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Profiles unavailable</AlertTitle>
          <AlertDescription>
            Profiles could not be loaded. Apply the{" "}
            <code className="rounded bg-destructive/10 px-1 text-xs">
              profiles
            </code>{" "}
            migration in Supabase, then refresh.
          </AlertDescription>
        </Alert>
      ) : null}

      {errorParam === "no_profile" || noProfile ? (
        <p
          className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          No profile row was found for your account. After running the database
          migration, sign out and sign in again, or ask an admin to fix your
          profile in Supabase.
        </p>
      ) : null}

      {showAdminRoleHint ? (
        <p className="mt-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          Your workspace role is{" "}
          <span className="font-medium text-foreground">{workspaceRole}</span>
          . The Admin dashboard only appears when{" "}
          <code className="rounded bg-muted px-1 text-xs">public.profiles.role</code>{" "}
          is{" "}
          <code className="rounded bg-muted px-1 text-xs">admin</code> for your
          user (this is separate from being a project owner in the Supabase
          dashboard). In the Supabase SQL editor:{" "}
          <code className="mt-1 block whitespace-pre-wrap break-all rounded bg-muted p-2 text-xs text-foreground">
            {`update public.profiles set role = 'admin' where email = 'your@email.com';`}
          </code>{" "}
          Then refresh this page.
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{data.email}</span>. The
        full dashboard modules live under{" "}
        <span className="font-medium text-foreground">Admin dashboard</span> for
        admin accounts; this screen confirms your session is active.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {isAdmin ? (
          <Button render={<Link href="/admin/dashboard" />} nativeButton={false}>
            Admin dashboard
          </Button>
        ) : null}
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="outline"
          className="inline-flex items-center gap-1.5"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          Back to marketing home
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
