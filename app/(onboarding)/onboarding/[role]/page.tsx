import { notFound } from "next/navigation";
import { OnboardingRoleClient } from "@/components/onboarding/onboarding-role-client";
import { isDirectoryRole } from "@/lib/constants/directory-roles";

export default async function OnboardingRolePage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { role: roleParam } = await params;
  if (!isDirectoryRole(roleParam)) {
    notFound();
  }

  const sp = await searchParams;
  const invite = typeof sp.invite === "string" ? sp.invite.trim() : "";

  return (
    <OnboardingRoleClient role={roleParam} inviteToken={invite || null} />
  );
}
