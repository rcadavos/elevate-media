import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AdminApiAuth =
  | { ok: true }
  | { ok: false; response: NextResponse };

/** Ensures the current Supabase session is an admin (for JSON API routes). */
export async function assertCallerIsAdmin(): Promise<AdminApiAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const workspaceRole = profile?.role?.trim().toLowerCase() ?? "";
  if (error || !profile || workspaceRole !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true };
}
