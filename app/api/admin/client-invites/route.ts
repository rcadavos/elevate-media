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

type Body = {
  email?: string;
  full_name?: string;
  business_name?: string;
  /** `YYYY-MM-DD` from admin; stored as timestamptz (local noon). */
  date_joined?: string;
};

function parseOptionalDateJoined(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt.toISOString();
}

export async function POST(request: Request) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName =
    typeof body.full_name === "string" && body.full_name.trim()
      ? body.full_name.trim()
      : "";
  const businessName =
    typeof body.business_name === "string" && body.business_name.trim()
      ? body.business_name.trim()
      : "";

  if (!emailRaw || !emailRaw.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }
  if (!businessName) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  const dateJoinedIso = parseOptionalDateJoined(body.date_joined);
  if (
    typeof body.date_joined === "string" &&
    body.date_joined.trim() &&
    !dateJoinedIso
  ) {
    return NextResponse.json(
      { error: "Date joined must be a valid YYYY-MM-DD date when provided" },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to create client invites.",
      },
      { status: 503 },
    );
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", emailRaw)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  await admin
    .from("onboarding_invites")
    .delete()
    .is("user_id", null)
    .ilike("email", emailRaw);

  const { error: insertErr } = await admin.from("onboarding_invites").insert({
    user_id: null,
    role: "client",
    email: emailRaw,
    pending_full_name: fullName,
    business_name: businessName,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ...(dateJoinedIso ? { date_joined: dateJoinedIso } : {}),
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const origin = resolveInviteAppOrigin(request);
  const invitePath = `/onboarding/client?invite=${encodeURIComponent(token)}`;
  const inviteUrl = `${origin}${invitePath}`;

  const emailResult = await sendOnboardingInviteEmail({
    to: emailRaw,
    inviteUrl,
    greetingName: fullName,
    businessName: businessName,
    roleLabel: DIRECTORY_ROLE_LABELS.client,
  });
  const emailSent = emailResult.ok;
  const emailError = emailResult.ok ? undefined : emailResult.message;
  const missingEmailConfig =
    !emailResult.ok && emailResult.reason === "missing_api_key";

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    action: "directory.client_invite_created",
    entityType: "onboarding_invite",
    entityId: null,
    targetEmail: emailRaw,
    summary: `Admin created client onboarding invite for ${emailRaw}`,
    changes: {
      business_name: businessName,
      pending_full_name: fullName,
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
      ? "Invite saved and onboarding email sent. Their account is created when they finish the link."
      : missingEmailConfig
        ? "Invite saved. Set RESEND_API_KEY (and INVITE_EMAIL_FROM) to email the link automatically — copy the invite link below."
        : `Invite saved. Email could not be sent (${emailError ?? "unknown error"}) — copy the invite link below.`,
  };

  if (!emailSent && emailError) {
    payload.emailError = emailError;
  }

  return NextResponse.json(payload);
}
