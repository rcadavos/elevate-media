"use client";

import { useQuery } from "@tanstack/react-query";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { DirectoryCreateForm } from "@/components/admin/directory-create-form";
import { DirectoryTable } from "@/components/admin/directory-table";
import { fetchAdminProfiles } from "@/lib/query/admin-profiles";
import { queryKeys } from "@/lib/query/query-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <h2 className="text-lg font-semibold text-foreground">
        {DIRECTORY_ROLE_LABELS[role]} accounts
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {profilesQuery.isPending
          ? "Loading…"
          : `${rows.length} user${rows.length === 1 ? "" : "s"} in this segment.`}
      </p>

      {profilesQuery.isError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Directory unavailable</AlertTitle>
          <AlertDescription>
            Could not load this directory segment. Refresh or try again.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8 space-y-8">
        <DirectoryCreateForm role={role} />
        <DirectoryTable rows={rows} />
      </div>
    </div>
  );
}
