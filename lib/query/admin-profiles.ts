import type { QueryClient } from "@tanstack/react-query";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { queryKeys } from "@/lib/query/query-keys";
import type { ProfileRow } from "@/lib/types/profile";

export async function fetchAdminProfiles(
  role: DirectoryRole,
): Promise<ProfileRow[]> {
  const res = await fetch(
    `/api/admin/profiles?role=${encodeURIComponent(role)}`,
    { credentials: "same-origin" },
  );
  if (res.status === 401 || res.status === 403) {
    throw new Error("Forbidden");
  }
  if (!res.ok) {
    throw new Error("Could not load directory");
  }
  const data = (await res.json()) as { profiles?: ProfileRow[] };
  const rows = data.profiles ?? [];
  return rows.map(normalizeProfileRow);
}

function normalizeProfileRow(
  row: ProfileRow | (Omit<ProfileRow, "is_active"> & { is_active?: boolean }),
): ProfileRow {
  return {
    ...row,
    is_active: row.is_active !== false,
  };
}

export async function patchAdminProfile(
  userId: string,
  payload: {
    role: DirectoryRole;
    full_name?: string;
    is_active?: boolean;
  },
): Promise<ProfileRow> {
  const res = await fetch(`/api/admin/profiles/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { error?: string; profile?: ProfileRow };
  if (!res.ok) {
    throw new Error(data.error ?? "Update failed");
  }
  if (!data.profile) {
    throw new Error("Missing profile in response");
  }
  return normalizeProfileRow(data.profile);
}

/** Upserts one row in the cached directory list for a role (no refetch). */
export function mergeProfileIntoRoleCache(
  queryClient: QueryClient,
  role: DirectoryRole,
  profile: ProfileRow,
) {
  queryClient.setQueryData<ProfileRow[]>(
    queryKeys.admin.profiles(role),
    (old) => {
      const normalized = normalizeProfileRow(profile);
      if (!old?.length) {
        return [normalized];
      }
      const i = old.findIndex((p) => p.id === normalized.id);
      if (i === -1) {
        return [normalized, ...old];
      }
      const next = [...old];
      next[i] = normalized;
      return next;
    },
  );
}
