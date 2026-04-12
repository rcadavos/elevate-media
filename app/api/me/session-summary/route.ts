import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      email: user.email ?? null,
      role: profile?.role ?? null,
      profileError: !!error,
      noProfile: !profile && !error,
    });
  } catch {
    return NextResponse.json(
      { error: "missing_config" },
      { status: 503 },
    );
  }
}
