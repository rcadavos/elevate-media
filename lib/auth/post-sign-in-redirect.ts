import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isDirectoryRole,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";

/** Logged-in admins land on the admin app home (stats + directory CTA). */
export const ADMIN_HOME_PATH = "/admin/dashboard" as const;
export const PORTALS_HOME_PATH = "/portals" as const;

export const DEFAULT_SIGNED_IN_PATH = "/dashboard" as const;

const ROLE_PORTAL_PATHS: Record<DirectoryRole, string> = {
  admin: ADMIN_HOME_PATH,
  client: "/client",
  sales: "/sales",
  finance: "/finance",
  operations: "/operations",
};

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
    "/portals",
    "/admin",
    "/client",
    "/sales",
    "/finance",
    "/operations",
    "/onboarding",
  ] as const;
  return prefixes.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function parseProfileRoles(
  roleValue: string | null | undefined,
): DirectoryRole[] {
  if (!roleValue) {
    return [];
  }
  const parsed = roleValue
    .split(/[|,]/)
    .map((role) => role.trim().toLowerCase())
    .filter((role): role is DirectoryRole => isDirectoryRole(role));
  return Array.from(new Set(parsed));
}

export function getPortalPathForRole(role: DirectoryRole): string {
  return ROLE_PORTAL_PATHS[role];
}

export function resolvePostSignInPath(
  role: string | null | undefined,
  requestedNext: string | null,
): string {
  const roles = parseProfileRoles(role);
  if (roles.length > 1) {
    return PORTALS_HOME_PATH;
  }
  if (roles.length === 1) {
    return getPortalPathForRole(roles[0]);
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
