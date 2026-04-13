import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MIN_LENGTH = 8;

export async function POST(request: Request) {
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

    const password =
      typeof body === "object" &&
      body !== null &&
      "password" in body &&
      typeof (body as { password: unknown }).password === "string"
        ? (body as { password: string }).password
        : "";

    if (password.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_LENGTH} characters` },
        { status: 400 },
      );
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "missing_config" }, { status: 503 });
  }
}
