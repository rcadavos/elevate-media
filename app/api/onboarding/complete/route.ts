import { NextResponse } from "next/server";
import { isDirectoryRole, type DirectoryRole } from "@/lib/constants/directory-roles";
import { hashInviteToken } from "@/lib/onboarding/invite-token";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";

type CompleteBody = {
  invite?: string;
  role?: string;
  password?: string;
  full_name?: string;
};

export async function POST(request: Request) {
  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = typeof body.invite === "string" ? body.invite.trim() : "";
  const roleRaw = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName =
    typeof body.full_name === "string" && body.full_name.trim()
      ? body.full_name.trim()
      : "";

  if (!token || !roleRaw || !isDirectoryRole(roleRaw)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const role = roleRaw as DirectoryRole;

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const tokenHash = hashInviteToken(token);
  const { data: invite, error: invErr } = await admin
    .from("onboarding_invites")
    .select("id, user_id, role, expires_at, consumed_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (invErr || !invite) {
    return NextResponse.json({ error: "Invalid or unknown invite" }, { status: 404 });
  }

  if (invite.role !== role) {
    return NextResponse.json({ error: "Invite does not match role" }, { status: 400 });
  }

  if (invite.consumed_at) {
    return NextResponse.json({ error: "This invite was already used" }, { status: 410 });
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  const userId = invite.user_id as string;

  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    password,
    user_metadata: {
      full_name: fullName,
      role,
    },
    email_confirm: true,
  });

  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 400 });
  }

  const { error: profErr } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  const consumedAt = new Date().toISOString();
  await admin
    .from("onboarding_invites")
    .update({ consumed_at: consumedAt })
    .eq("id", invite.id);

  const { data: userRow } = await admin.auth.admin.getUserById(userId);
  const email = userRow?.user?.email ?? null;

  return NextResponse.json({
    ok: true as const,
    email,
  });
}
