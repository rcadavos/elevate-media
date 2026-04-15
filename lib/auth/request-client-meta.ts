/** Best-effort client IP from edge / reverse proxies (Vercel, nginx, etc.). */
export function getRequestClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return null;
}

export function getRequestUserAgent(request: Request): string | null {
  const ua = request.headers.get("user-agent")?.trim();
  return ua && ua.length > 0 ? ua : null;
}
