import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Still send user home if env/session cleanup fails
  }
  return NextResponse.redirect(new URL("/", request.url));
}
