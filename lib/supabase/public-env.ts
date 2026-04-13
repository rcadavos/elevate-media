export type SupabasePublicEnv = {
  url: string;
  key: string;
};

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Reads trimmed public Supabase env. Returns null if missing or malformed
 * (e.g. trailing spaces in .env breaking the project URL).
 */
export function readSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key || !isValidHttpUrl(url)) {
    return null;
  }
  return { url, key };
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = readSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Missing or invalid NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy the Project URL and anon key from Supabase → Project Settings → API, and remove any spaces around the values in .env.local.",
    );
  }
  return env;
}
