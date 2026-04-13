import { NextResponse } from "next/server";
import { diffProfileFields } from "@/lib/audit/profile-change-summary";
import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import {
  isDirectoryRole,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/profile";

const PROFILE_SELECT =
  "id,email,full_name,business_name,business_logo_url,avatar_url,role,created_at,date_joined,onboarding_sent_at,is_active";

type PatchBody = {
  role?: unknown;
  full_name?: unknown;
  business_name?: unknown;
  business_logo_url?: unknown;
  avatar_url?: unknown;
  is_active?: unknown;
  date_joined?: unknown;
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

  const businessNameRaw = body.business_name;
  const businessName =
    typeof businessNameRaw === "string"
      ? businessNameRaw.trim() || null
      : businessNameRaw === null
        ? null
        : undefined;

  const businessLogoRaw = body.business_logo_url;
  const businessLogoUrl =
    typeof businessLogoRaw === "string"
      ? businessLogoRaw.trim() || null
      : businessLogoRaw === null
        ? null
        : undefined;

  const avatarRaw = body.avatar_url;
  const avatarUrl =
    typeof avatarRaw === "string"
      ? avatarRaw.trim() || null
      : avatarRaw === null
        ? null
        : undefined;

  const isActiveRaw = body.is_active;
  const isActive =
    typeof isActiveRaw === "boolean"
      ? isActiveRaw
      : undefined;

  const dateJoinedRaw = body.date_joined;
  let dateJoined: string | undefined;
  if (dateJoinedRaw === null) {
    return NextResponse.json(
      { error: "date_joined cannot be null; omit the field to leave unchanged" },
      { status: 400 },
    );
  }
  if (typeof dateJoinedRaw === "string") {
    const t = dateJoinedRaw.trim();
    if (!t) {
      dateJoined = undefined;
    } else {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]);
        const d = Number(m[3]);
        const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
        if (
          dt.getFullYear() !== y ||
          dt.getMonth() !== mo - 1 ||
          dt.getDate() !== d
        ) {
          return NextResponse.json(
            { error: "date_joined must be a valid YYYY-MM-DD or ISO timestamp" },
            { status: 400 },
          );
        }
        dateJoined = dt.toISOString();
      } else {
        const parsed = new Date(t);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "date_joined must be a valid YYYY-MM-DD or ISO timestamp" },
            { status: 400 },
          );
        }
        dateJoined = parsed.toISOString();
      }
    }
  } else {
    dateJoined = undefined;
  }

  if (
    fullName === undefined &&
    businessName === undefined &&
    businessLogoUrl === undefined &&
    avatarUrl === undefined &&
    isActive === undefined &&
    dateJoined === undefined
  ) {
    return NextResponse.json(
      {
        error:
          "Provide at least one of: full_name, business_name, business_logo_url, avatar_url, is_active, date_joined",
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: existing, error: readErr } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
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

  if (dateJoined !== undefined && role !== "client") {
    return NextResponse.json(
      { error: "date_joined can only be updated for client profiles" },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (fullName !== undefined) {
    patch.full_name = fullName;
  }
  if (businessName !== undefined) {
    patch.business_name = businessName;
  }
  if (businessLogoUrl !== undefined) {
    patch.business_logo_url = businessLogoUrl;
  }
  if (avatarUrl !== undefined) {
    patch.avatar_url = avatarUrl;
  }
  if (isActive !== undefined) {
    patch.is_active = isActive;
  }
  if (dateJoined !== undefined) {
    patch.date_joined = dateJoined;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(PROFILE_SELECT)
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const existingRow = existing as ProfileRow;
  const updatedRow = updated as ProfileRow;

  const beforeSnap = {
    full_name: existingRow.full_name,
    email: existingRow.email,
    business_name: existingRow.business_name ?? null,
    business_logo_url: existingRow.business_logo_url ?? null,
    avatar_url: existingRow.avatar_url ?? null,
    is_active: existingRow.is_active !== false,
    onboarding_sent_at: existingRow.onboarding_sent_at ?? null,
    date_joined: existingRow.date_joined ?? null,
  };
  const afterSnap = {
    full_name: updatedRow.full_name,
    email: updatedRow.email,
    business_name: updatedRow.business_name ?? null,
    business_logo_url: updatedRow.business_logo_url ?? null,
    avatar_url: updatedRow.avatar_url ?? null,
    is_active: updatedRow.is_active !== false,
    onboarding_sent_at: updatedRow.onboarding_sent_at ?? null,
    date_joined: updatedRow.date_joined ?? null,
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
