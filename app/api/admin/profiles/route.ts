import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { createClient } from "@/lib/supabase/server";
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
    .select("id,email,full_name,role,created_at,onboarding_sent_at,is_active")
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles: data ?? [] });
}
