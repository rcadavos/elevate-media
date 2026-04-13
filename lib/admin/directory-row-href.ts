import type { DirectoryRole } from "@/lib/constants/directory-roles";
import type { ProfileRow } from "@/lib/types/profile";

const INVITE_PREFIX = "invite:";

/** `true` when this directory row is a pending onboarding invite (no auth user yet). */
export function isPendingInviteProfileRow(row: ProfileRow): boolean {
  return row.id.startsWith(INVITE_PREFIX);
}

export function pendingInviteUuidFromProfileId(profileListId: string): string | null {
  if (!profileListId.startsWith(INVITE_PREFIX)) return null;
  return profileListId.slice(INVITE_PREFIX.length);
}

/**
 * Admin directory drill-down URL, or `null` when the row is not navigable.
 */
export function adminDirectoryRowHref(
  role: DirectoryRole,
  row: ProfileRow,
): string | null {
  if (row.user_id) {
    return `/admin/directory/${role}/${row.user_id}`;
  }
  if (role === "client" && isPendingInviteProfileRow(row)) {
    const inviteId = pendingInviteUuidFromProfileId(row.id);
    if (inviteId) {
      return `/admin/directory/client/pending/${inviteId}`;
    }
  }
  return null;
}
