import type { DirectoryRole } from "@/lib/constants/directory-roles";
import type { ProfileRow } from "@/lib/types/profile";

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
  return null;
}
