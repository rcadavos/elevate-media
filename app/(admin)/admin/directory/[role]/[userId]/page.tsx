import { notFound } from "next/navigation";
import { DirectoryUserDetailClient } from "@/components/admin/directory-user-detail-client";
import { isDirectoryRole } from "@/lib/constants/directory-roles";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/profile";

export default async function AdminDirectoryUserPage({
  params,
}: {
  params: Promise<{ role: string; userId: string }>;
}) {
  await requireAdmin();
  const { role: roleParam, userId } = await params;

  if (!isDirectoryRole(roleParam)) {
    notFound();
  }
  const role = roleParam as DirectoryRole;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at,onboarding_sent_at,is_active")
    .eq("id", userId)
    .eq("role", role)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <DirectoryUserDetailClient
      key={userId}
      role={role}
      profile={data as ProfileRow}
    />
  );
}
