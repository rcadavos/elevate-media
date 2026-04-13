import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";
import { isDirectoryRole } from "@/lib/constants/directory-roles";

export async function GET(request: Request) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  if (!role || !isDirectoryRole(role)) {
    return NextResponse.json({ error: "Invalid or missing role" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,business_name,business_logo_url,avatar_url,role,created_at,date_joined,onboarding_sent_at,is_active",
    )
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profileRows = (data ?? []).map((row) => ({
    ...row,
    user_id: row.id,
    onboarding_status: "completed" as const,
  }));

  if (role !== "client") {
    return NextResponse.json({ profiles: profileRows });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ profiles: profileRows });
  }

  const { data: pendingInvites, error: inviteError } = await admin
    .from("onboarding_invites")
    .select("id,email,pending_full_name,business_name,role,created_at,date_joined")
    .eq("role", "client")
    .is("consumed_at", null)
    .is("user_id", null)
    .order("created_at", { ascending: false });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const pendingRows = (pendingInvites ?? []).map((invite) => ({
    id: `invite:${invite.id}`,
    user_id: null,
    email: invite.email,
    full_name: invite.pending_full_name,
    business_name: invite.business_name,
    business_logo_url: null,
    avatar_url: null,
    role: invite.role,
    created_at: invite.created_at,
    date_joined:
      typeof invite.date_joined === "string" && invite.date_joined.trim()
        ? invite.date_joined
        : null,
    onboarding_sent_at: null,
    onboarding_status: "pending" as const,
    is_active: true,
  }));

  return NextResponse.json({ profiles: [...pendingRows, ...profileRows] });
}
