import { createClient } from "@supabase/supabase-js";
import { readSupabasePublicEnv } from "@/lib/supabase/public-env";

/**
 * Server-only Supabase client with elevated privileges.
 * Never import this module into Client Components.
 */
export function createServiceRoleClient() {
  const env = readSupabasePublicEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!env || !key) {
    return null;
  }
  return createClient(env.url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
