import { NextResponse } from "next/server";
import { isDirectoryRole } from "@/lib/constants/directory-roles";
import { emailInviteHint } from "@/lib/onboarding/invite-email-hint";
import { hashInviteToken } from "@/lib/onboarding/invite-token";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";

/**
 * Validates an invite token for the onboarding UI (no auth).
 * Role in the query must match the invite row.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("invite")?.trim() ?? "";
  const role = searchParams.get("role")?.trim().toLowerCase() ?? "";

  if (!token || !role || !isDirectoryRole(role)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const tokenHash = hashInviteToken(token);
  const { data: invite, error } = await admin
    .from("onboarding_invites")
    .select(
      "user_id, role, expires_at, consumed_at, email, pending_full_name, business_name",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !invite) {
    return NextResponse.json({ error: "Invalid or unknown invite" }, { status: 404 });
  }

  if (invite.role !== role) {
    return NextResponse.json({ error: "Invite does not match this path" }, { status: 400 });
  }

  if (invite.consumed_at) {
    return NextResponse.json({ error: "This invite was already used" }, { status: 410 });
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  if (invite.user_id) {
    const { data: userRow, error: userErr } = await admin.auth.admin.getUserById(
      invite.user_id,
    );

    if (userErr || !userRow?.user?.email) {
      return NextResponse.json({ error: "User record unavailable" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true as const,
      emailHint: emailInviteHint(userRow.user.email),
    });
  }

  const pendingEmail =
    typeof invite.email === "string" && invite.email.trim() ? invite.email.trim() : "";

  if (!pendingEmail) {
    return NextResponse.json({ error: "Invite is missing email" }, { status: 500 });
  }

  const defaultFullName =
    typeof invite.pending_full_name === "string" && invite.pending_full_name.trim()
      ? invite.pending_full_name.trim()
      : undefined;
  const businessName =
    typeof invite.business_name === "string" && invite.business_name.trim()
      ? invite.business_name.trim()
      : undefined;

  return NextResponse.json({
    ok: true as const,
    emailHint: emailInviteHint(pendingEmail),
    defaultFullName,
    businessName,
  });
}
