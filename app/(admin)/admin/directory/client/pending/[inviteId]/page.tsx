import { notFound } from "next/navigation";
import { DirectoryPendingInviteClient } from "@/components/admin/directory-pending-invite-client";
import type { PendingInviteDetail } from "@/components/admin/directory-pending-invite-client";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";

export default async function AdminPendingClientInvitePage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  await requireAdmin();
  const { inviteId } = await params;

  if (!inviteId || typeof inviteId !== "string") {
    notFound();
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    notFound();
  }

  const { data: invite, error } = await admin
    .from("onboarding_invites")
    .select(
      "id, email, pending_full_name, business_name, role, user_id, consumed_at, expires_at, created_at",
    )
    .eq("id", inviteId)
    .maybeSingle();

  if (error || !invite) {
    notFound();
  }

  if (invite.role !== "client" || invite.user_id !== null || invite.consumed_at) {
    notFound();
  }

  const email =
    typeof invite.email === "string" && invite.email.trim() ? invite.email.trim() : "";

  if (!email) {
    notFound();
  }

  const detail: PendingInviteDetail = {
    id: invite.id as string,
    email,
    pending_full_name:
      typeof invite.pending_full_name === "string" ?
        invite.pending_full_name
      : null,
    business_name:
      typeof invite.business_name === "string" ? invite.business_name : null,
    expires_at: invite.expires_at as string,
    created_at: invite.created_at as string,
  };

  return <DirectoryPendingInviteClient invite={detail} />;
}
