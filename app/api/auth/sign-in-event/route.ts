import { NextResponse } from "next/server";
import { recordFailedSignInForRequest } from "@/lib/auth/record-sign-in-event";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";

/**
 * Records a failed sign-in (no session). Uses service role so RLS does not apply.
 * Always responds 204 to avoid leaking account existence.
 */
export async function POST(request: Request) {
  try {
    let body: { email?: string; auth_factor?: string } = {};
    try {
      body = (await request.json()) as { email?: string; auth_factor?: string };
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const email =
      typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
    if (!email || !email.includes("@")) {
      return new NextResponse(null, { status: 204 });
    }

    const service = createServiceRoleClient();
    if (!service) {
      return new NextResponse(null, { status: 204 });
    }

    const factor =
      typeof body.auth_factor === "string" ? body.auth_factor : "password";
    await recordFailedSignInForRequest(service, request, {
      email,
      authFactor: factor,
    });
  } catch {
    /* ignore */
  }
  return new NextResponse(null, { status: 204 });
}
