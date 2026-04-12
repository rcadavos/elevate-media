import Link from "next/link";
import {
  DIRECTORY_ROLE_LABELS,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";

type NonAdminWorkspaceRole = Exclude<DirectoryRole, "admin">;

export function RoleWorkspacePlaceholder({
  role,
}: {
  role: NonAdminWorkspaceRole;
}) {
  const label = DIRECTORY_ROLE_LABELS[role];

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
        elev8temedia
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {label} workspace
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        This URL is reserved for {label.toLowerCase()}-specific modules. Add
        nested routes beside this page inside the matching{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          ({role})
        </code>{" "}
        route group in the app directory.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
        >
          Workspace home
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Marketing home
        </Link>
      </div>
    </div>
  );
}
