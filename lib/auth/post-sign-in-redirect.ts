import type { SupabaseClient } from "@supabase/supabase-js";

/** Logged-in admins land on the admin app home (stats + directory CTA). */
export const ADMIN_HOME_PATH = "/admin/dashboard" as const;

export const DEFAULT_SIGNED_IN_PATH = "/dashboard" as const;

/** Limits open redirects on `?next=` after OAuth / email link. */
export function isSafeAuthRedirectPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }
  if (path.includes("..")) {
    return false;
  }
  const prefixes = [
    "/dashboard",
    "/admin",
    "/client",
    "/sales",
    "/finance",
    "/operations",
  ] as const;
  return prefixes.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function resolvePostSignInPath(
  role: string | null | undefined,
  requestedNext: string | null,
): string {
  const r = role?.trim().toLowerCase() ?? "";
  if (r === "admin") {
    return ADMIN_HOME_PATH;
  }
  if (requestedNext && isSafeAuthRedirectPath(requestedNext)) {
    return requestedNext;
  }
  return DEFAULT_SIGNED_IN_PATH;
}

export async function getPostSignInRedirectPath(
  supabase: SupabaseClient,
  requestedNext: string | null = null,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return DEFAULT_SIGNED_IN_PATH;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return resolvePostSignInPath(profile?.role ?? null, requestedNext);
}
