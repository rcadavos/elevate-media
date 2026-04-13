import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { sendOnboardingInviteEmail } from "@/lib/email/send-onboarding-invite-email";
import { generateInviteToken, hashInviteToken } from "@/lib/onboarding/invite-token";
import { resolveInviteAppOrigin } from "@/lib/onboarding/invite-app-origin";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";
import { createClient } from "@/lib/supabase/server";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function POST(
  request: Request,
  context: { params: Promise<{ inviteId: string }> },
) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { inviteId } = await context.params;
  if (!inviteId || typeof inviteId !== "string") {
    return NextResponse.json({ error: "Missing invite id" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to resend client invites.",
      },
      { status: 503 },
    );
  }

  const { data: invite, error: fetchErr } = await admin
    .from("onboarding_invites")
    .select(
      "id, email, pending_full_name, business_name, role, user_id, consumed_at, expires_at",
    )
    .eq("id", inviteId)
    .maybeSingle();

  if (fetchErr || !invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.role !== "client" || invite.user_id !== null) {
    return NextResponse.json({ error: "Not a pending client invite" }, { status: 400 });
  }

  if (invite.consumed_at) {
    return NextResponse.json(
      { error: "This invite was already used" },
      { status: 410 },
    );
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  const { error: updateErr } = await admin
    .from("onboarding_invites")
    .update({
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .eq("id", inviteId)
    .is("user_id", null)
    .is("consumed_at", null);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const origin = resolveInviteAppOrigin(request);
  const invitePath = `/onboarding/client?invite=${encodeURIComponent(token)}`;
  const inviteUrl = `${origin}${invitePath}`;

  const emailRaw =
    typeof invite.email === "string" && invite.email.trim() ?
      invite.email.trim().toLowerCase()
    : "";

  let emailSent = false;
  let emailError: string | undefined;
  let missingResendConfig = false;

  if (emailRaw) {
    const emailResult = await sendOnboardingInviteEmail({
      to: emailRaw,
      inviteUrl,
      greetingName:
        typeof invite.pending_full_name === "string" ?
          invite.pending_full_name
        : null,
      businessName:
        typeof invite.business_name === "string" ? invite.business_name : null,
      roleLabel: DIRECTORY_ROLE_LABELS.client,
    });
    emailSent = emailResult.ok;
    if (!emailResult.ok) {
      emailError = emailResult.message;
      missingResendConfig = emailResult.reason === "missing_api_key";
    }
  } else {
    emailError = "Invite has no email";
  }

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    action: "directory.client_invite_resent",
    entityType: "onboarding_invite",
    entityId: inviteId,
    targetEmail: emailRaw || null,
    summary: `Admin resent client onboarding invite ${inviteId}`,
    changes: {
      invite_id: inviteId,
      invite_expires_at: expiresAt,
      email_sent: emailSent,
      ...(emailError ? { email_error: emailError } : {}),
    },
  });

  const payload: {
    ok: true;
    message: string;
    inviteUrl: string;
    emailSent: boolean;
    emailError?: string;
  } = {
    ok: true,
    inviteUrl,
    emailSent,
    message: emailSent
      ? "New onboarding link generated and emailed to the client."
      : missingResendConfig
        ? "New link generated. Set RESEND_API_KEY (and INVITE_EMAIL_FROM) to email automatically — copy the link below."
        : emailRaw
          ? `New link generated. Email could not be sent (${emailError ?? "unknown error"}) — copy the link below.`
          : "New link generated. Add an email to this invite — copy the link below.",
  };

  if (!emailSent && emailError) {
    payload.emailError = emailError;
  }

  return NextResponse.json(payload);
}
