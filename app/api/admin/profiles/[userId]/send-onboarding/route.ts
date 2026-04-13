import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import {
  DIRECTORY_ROLE_LABELS,
  isDirectoryRole,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";
import { sendOnboardingInviteEmail } from "@/lib/email/send-onboarding-invite-email";
import { generateInviteToken, hashInviteToken } from "@/lib/onboarding/invite-token";
import { resolveInviteAppOrigin } from "@/lib/onboarding/invite-app-origin";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";
import { createClient } from "@/lib/supabase/server";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { userId } = await context.params;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  let roleParam: string | null = null;
  try {
    const body = await request.json();
    if (body && typeof body === "object" && "role" in body) {
      roleParam = typeof (body as { role: unknown }).role === "string"
        ? (body as { role: string }).role
        : null;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!roleParam || !isDirectoryRole(roleParam)) {
    return NextResponse.json({ error: "Invalid or missing role" }, { status: 400 });
  }
  const role = roleParam as DirectoryRole;

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to send onboarding invites.",
      },
      { status: 503 },
    );
  }

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id, email, full_name, role, business_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (profile.role !== role) {
    return NextResponse.json(
      { error: "Profile role does not match this directory segment" },
      { status: 400 },
    );
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  await admin.from("onboarding_invites").delete().eq("user_id", userId);

  const { error: insertErr } = await admin.from("onboarding_invites").insert({
    user_id: userId,
    role,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const sentAt = new Date().toISOString();
  await admin
    .from("profiles")
    .update({ onboarding_sent_at: sentAt, updated_at: sentAt })
    .eq("id", userId);

  const origin = resolveInviteAppOrigin(request);
  const invitePath = `/onboarding/${role}?invite=${encodeURIComponent(token)}`;
  const inviteUrl = `${origin}${invitePath}`;

  const toEmail = typeof profile.email === "string" ? profile.email.trim() : "";
  let emailSent = false;
  let emailError: string | undefined;
  let missingResendConfig = false;
  if (toEmail) {
    const emailResult = await sendOnboardingInviteEmail({
      to: toEmail,
      inviteUrl,
      greetingName: profile.full_name,
      businessName:
        typeof profile.business_name === "string" ? profile.business_name : null,
      roleLabel: DIRECTORY_ROLE_LABELS[role],
    });
    emailSent = emailResult.ok;
    if (!emailResult.ok) {
      emailError = emailResult.message;
      missingResendConfig = emailResult.reason === "missing_api_key";
    }
  } else {
    emailError = "Profile has no email address";
  }

  const payload: {
    ok: true;
    sentAt: string;
    inviteUrl: string;
    emailSent: boolean;
    emailError?: string;
    message: string;
  } = {
    ok: true,
    sentAt,
    inviteUrl,
    emailSent,
    message: emailSent
      ? "Onboarding invite created and emailed to the user."
      : missingResendConfig
        ? "Onboarding invite created. Set RESEND_API_KEY (and INVITE_EMAIL_FROM) to email automatically — copy the invite link below."
        : toEmail
          ? `Onboarding invite created. Email could not be sent (${emailError ?? "unknown error"}) — copy the invite link below.`
          : "Onboarding invite created. Add an email to this profile to send automatically — copy the invite link below.",
  };

  if (!emailSent && emailError) {
    payload.emailError = emailError;
  }

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    action: "directory.onboarding_sent",
    entityId: userId,
    targetEmail: profile.email,
    summary: `Admin sent onboarding invite to ${profile.email ?? userId}`,
    changes: {
      invite_expires_at: expiresAt,
      role,
      email_sent: emailSent,
      ...(emailError ? { email_error: emailError } : {}),
    },
  });

  return NextResponse.json(payload);
}
