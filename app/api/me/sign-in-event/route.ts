import { NextResponse } from "next/server";
import { recordSuccessfulSignInForRequest } from "@/lib/auth/record-sign-in-event";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FACTORS = new Set([
  "password",
  "email_link",
  "magic_link",
  "sso",
  "recovery",
]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { auth_factor?: string } = {};
    try {
      body = (await request.json()) as { auth_factor?: string };
    } catch {
      body = {};
    }
    const raw = typeof body.auth_factor === "string" ? body.auth_factor : "password";
    const authFactor = ALLOWED_FACTORS.has(raw) ? raw : "password";

    await recordSuccessfulSignInForRequest(supabase, request, {
      userId: user.id,
      email: user.email,
      authFactor,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "missing_config" }, { status: 503 });
  }
}
