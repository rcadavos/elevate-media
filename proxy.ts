import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets, PWA service worker / workbox scripts, and the web manifest
     * so session refresh does not run on those requests.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|workbox-|swe-worker-|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
