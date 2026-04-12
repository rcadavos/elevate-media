"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchSessionSummary } from "@/lib/query/session-summary";

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
      <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (sessionQuery.isError) {
    if (sessionQuery.error.message === "Unauthorized") {
      return (
        <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Redirecting to sign in…
          </p>
        </div>
      );
    }
    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          Session could not be loaded. Check your Supabase environment and
          refresh.
        </p>
        <Link
          href="/login?error=missing_config"
          className="mt-4 text-sm font-medium text-violet-600 dark:text-violet-400"
        >
          Back to sign in
        </Link>
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
    <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
        elev8temedia
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Welcome to your workspace
      </h1>

      {notice === "admin_only" ? (
        <p
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          That area is limited to admin accounts. Ask an admin to grant you
          access if you need it.
        </p>
      ) : null}

      {errorParam === "profiles_unavailable" || profileError ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          Profiles could not be loaded. Apply the{" "}
          <code className="rounded bg-red-100/80 px-1 text-xs dark:bg-red-900/60">
            profiles
          </code>{" "}
          migration in Supabase, then refresh.
        </p>
      ) : null}

      {errorParam === "no_profile" || noProfile ? (
        <p
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          No profile row was found for your account. After running the database
          migration, sign out and sign in again, or ask an admin to fix your
          profile in Supabase.
        </p>
      ) : null}

      {showAdminRoleHint ? (
        <p
          className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300"
        >
          Your workspace role is{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {workspaceRole}
          </span>
          . The Admin dashboard only appears when{" "}
          <code className="rounded bg-zinc-200/80 px-1 text-xs dark:bg-zinc-800">
            public.profiles.role
          </code>{" "}
          is{" "}
          <code className="rounded bg-zinc-200/80 px-1 text-xs dark:bg-zinc-800">
            admin
          </code>{" "}
          for your user (this is separate from being a project owner in the
          Supabase dashboard). In the Supabase SQL editor:{" "}
          <code className="mt-1 block whitespace-pre-wrap break-all rounded bg-zinc-200/80 p-2 text-xs dark:bg-zinc-800">
            {`update public.profiles set role = 'admin' where email = 'your@email.com';`}
          </code>{" "}
          Then refresh this page.
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Signed in as{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-200">
          {data.email}
        </span>
        . The full dashboard modules will land here next — this screen confirms
        your session is active.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {isAdmin ? (
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
          >
            Admin dashboard
          </Link>
        ) : null}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Back to marketing home
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
