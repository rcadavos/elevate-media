import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MeProfile } from "@/lib/types/me-profile";

const SELECT =
  "id,email,full_name,avatar_url,role,created_at" as const;

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
      .select(SELECT)
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: profile as MeProfile });
  } catch {
    return NextResponse.json({ error: "missing_config" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
    }

    const fullNameRaw =
      typeof body === "object" &&
      body !== null &&
      "full_name" in body &&
      typeof (body as { full_name: unknown }).full_name === "string"
        ? (body as { full_name: string }).full_name
        : null;

    if (fullNameRaw === null) {
      return NextResponse.json({ error: "full_name is required" }, { status: 400 });
    }

    const full_name = fullNameRaw.trim();

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        full_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(SELECT)
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: error?.message ?? "Could not update profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile: updated as MeProfile });
  } catch {
    return NextResponse.json({ error: "missing_config" }, { status: 503 });
  }
}
