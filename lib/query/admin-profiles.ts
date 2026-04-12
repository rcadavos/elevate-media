import type { DirectoryRole } from "@/lib/constants/directory-roles";
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
  return data.profiles ?? [];
}
