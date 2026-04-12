"use client";

import { useQuery } from "@tanstack/react-query";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { DirectoryCreateForm } from "@/components/admin/directory-create-form";
import { DirectoryTable } from "@/components/admin/directory-table";
import { fetchAdminProfiles } from "@/lib/query/admin-profiles";
import { queryKeys } from "@/lib/query/query-keys";

type DirectoryRoleClientProps = {
  role: DirectoryRole;
};

export function DirectoryRoleClient({ role }: DirectoryRoleClientProps) {
  const profilesQuery = useQuery({
    queryKey: queryKeys.admin.profiles(role),
    queryFn: () => fetchAdminProfiles(role),
  });

  const rows = profilesQuery.data ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {DIRECTORY_ROLE_LABELS[role]} accounts
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {profilesQuery.isPending
          ? "Loading…"
          : `${rows.length} user${rows.length === 1 ? "" : "s"} in this segment.`}
      </p>

      {profilesQuery.isError ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          Could not load this directory segment. Refresh or try again.
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        <DirectoryCreateForm role={role} />
        <DirectoryTable rows={rows} />
      </div>
    </div>
  );
}
