"use client";

import { useQuery } from "@tanstack/react-query";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { DirectoryCreateUserModal } from "@/components/admin/directory-create-user-modal";
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
  const isInitialLoading =
    profilesQuery.isPending && profilesQuery.data === undefined;

  return (
    <div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {DIRECTORY_ROLE_LABELS[role]} accounts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isInitialLoading
            ? "Loading…"
            : `${rows.length} user${rows.length === 1 ? "" : "s"} in this segment.`}
        </p>
      </div>

      {profilesQuery.isError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Directory unavailable</AlertTitle>
          <AlertDescription>
            Could not load this directory segment. Refresh or try again.
          </AlertDescription>
        </Alert>
      ) : null}

      <DirectoryTable
        role={role}
        rows={rows}
        isInitialLoading={isInitialLoading}
        toolbarEnd={<DirectoryCreateUserModal role={role} />}
      />
    </div>
  );
}
