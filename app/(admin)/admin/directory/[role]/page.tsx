import { notFound } from "next/navigation";
import { DirectoryRoleClient } from "@/components/admin/directory-role-client";
import { isDirectoryRole } from "@/lib/constants/directory-roles";

export default async function AdminDirectoryRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleParam } = await params;
  if (!isDirectoryRole(roleParam)) {
    notFound();
  }

  return <DirectoryRoleClient role={roleParam} />;
}
