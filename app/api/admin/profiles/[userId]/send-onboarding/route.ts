import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { isDirectoryRole, type DirectoryRole } from "@/lib/constants/directory-roles";
import { generateInviteToken, hashInviteToken } from "@/lib/onboarding/invite-token";
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
    .select("id, email, role")
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

  const origin = new URL(request.url).origin;
  const invitePath = `/onboarding/${role}?invite=${encodeURIComponent(token)}`;
  const inviteUrl = `${origin}${invitePath}`;

  const payload: {
    ok: true;
    sentAt: string;
    inviteUrl?: string;
    message: string;
  } = {
    ok: true,
    sentAt,
    message:
      "Onboarding invite created. Deliver the link to the user by your org email or SMS.",
  };

  if (process.env.NODE_ENV === "development") {
    payload.inviteUrl = inviteUrl;
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
    },
  });

  return NextResponse.json(payload);
}
