import type { SupabaseClient } from "@supabase/supabase-js";
import { getRequestClientIp, getRequestUserAgent } from "@/lib/auth/request-client-meta";

const MAX_EMAIL_LEN = 320;
const MAX_UA_LEN = 2000;
const MAX_FACTOR_LEN = 32;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, MAX_EMAIL_LEN);
}

function clampUa(ua: string | null): string | null {
  if (!ua) {
    return null;
  }
  return ua.length > MAX_UA_LEN ? ua.slice(0, MAX_UA_LEN) : ua;
}

function clampFactor(factor: string): string {
  const t = factor.trim().toLowerCase().slice(0, MAX_FACTOR_LEN);
  return t || "password";
}

/**
 * Records a successful sign-in for the current session user (RLS: own row only).
 * Swallows errors so sign-in UX is not blocked if logging fails.
 */
export async function recordSuccessfulSignInForRequest(
  supabase: SupabaseClient,
  request: Request,
  params: { userId: string; email: string; authFactor: string },
): Promise<void> {
  try {
    const { error } = await supabase.from("sign_in_events").insert({
      user_id: params.userId,
      user_email: normalizeEmail(params.email),
      ip_address: getRequestClientIp(request),
      location: null,
      user_agent: clampUa(getRequestUserAgent(request)),
      auth_factor: clampFactor(params.authFactor),
      success: true,
    });
    if (error) {
      console.error("[sign_in_events]", error.message);
    }
  } catch (e) {
    console.error("[sign_in_events]", e);
  }
}

/**
 * Records a failed password (or similar) attempt with no session, using the
 * service-role client (bypasses RLS). No-op if service client is unavailable.
 */
export async function recordFailedSignInForRequest(
  serviceSupabase: SupabaseClient,
  request: Request,
  params: { email: string; authFactor?: string },
): Promise<void> {
  try {
    const email = normalizeEmail(params.email);
    if (!email.includes("@")) {
      return;
    }
    const { error } = await serviceSupabase.from("sign_in_events").insert({
      user_id: null,
      user_email: email,
      ip_address: getRequestClientIp(request),
      location: null,
      user_agent: clampUa(getRequestUserAgent(request)),
      auth_factor: clampFactor(params.authFactor ?? "password"),
      success: false,
    });
    if (error) {
      console.error("[sign_in_events:failed]", error.message);
    }
  } catch (e) {
    console.error("[sign_in_events:failed]", e);
  }
}
