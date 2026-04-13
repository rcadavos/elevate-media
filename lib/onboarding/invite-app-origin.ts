/**
 * Public origin used in onboarding URLs (emails, invite links).
 * Prefer INVITE_APP_ORIGIN in production when the app is behind a proxy
 * or differs from the incoming request host.
 */
export function resolveInviteAppOrigin(request: Request): string {
  const env = process.env.INVITE_APP_ORIGIN?.trim();
  if (env) {
    return env.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}
