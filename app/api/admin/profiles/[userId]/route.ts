import { NextResponse } from "next/server";
import { diffProfileFields } from "@/lib/audit/profile-change-summary";
import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import {
  isDirectoryRole,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";
import { createClient } from "@/lib/supabase/server";

type PatchBody = {
  role?: unknown;
  full_name?: unknown;
  is_active?: unknown;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { userId } = await context.params;
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roleParam = typeof body.role === "string" ? body.role : "";
  if (!isDirectoryRole(roleParam)) {
    return NextResponse.json({ error: "Invalid or missing role" }, { status: 400 });
  }
  const role = roleParam as DirectoryRole;

  const fullNameRaw = body.full_name;
  const fullName =
    typeof fullNameRaw === "string"
      ? fullNameRaw.trim()
      : undefined;

  const isActiveRaw = body.is_active;
  const isActive =
    typeof isActiveRaw === "boolean"
      ? isActiveRaw
      : undefined;

  if (fullName === undefined && isActive === undefined) {
    return NextResponse.json(
      { error: "Provide full_name and/or is_active" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: existing, error: readErr } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,is_active,onboarding_sent_at")
    .eq("id", userId)
    .maybeSingle();

  if (readErr || !existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existing.role !== role) {
    return NextResponse.json(
      { error: "Profile role does not match this directory segment" },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (fullName !== undefined) {
    patch.full_name = fullName;
  }
  if (isActive !== undefined) {
    patch.is_active = isActive;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id,email,full_name,role,created_at,onboarding_sent_at,is_active")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const beforeSnap = {
    full_name: existing.full_name,
    email: existing.email,
    is_active: existing.is_active !== false,
    onboarding_sent_at: existing.onboarding_sent_at ?? null,
  };
  const afterSnap = {
    full_name: updated.full_name,
    email: updated.email,
    is_active: updated.is_active !== false,
    onboarding_sent_at: updated.onboarding_sent_at ?? null,
  };
  const changes = diffProfileFields(beforeSnap, afterSnap);
  if (Object.keys(changes).length > 0) {
    const label = updated.email?.trim() || userId;
    await logAuditEvent(supabase, {
      action: "directory.profile_update",
      entityId: userId,
      targetEmail: updated.email,
      summary: `Admin updated profile ${label} (${Object.keys(changes).join(", ")})`,
      changes,
    });
  }

  return NextResponse.json({ profile: updated });
}
