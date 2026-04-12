/** Maps browser/network failures from auth mutations to readable copy. */
export function mapAuthClientMutationError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Something went wrong. Try again.";
  }
  const msg = err.message.toLowerCase();
  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed") ||
    msg.includes("network request failed")
  ) {
    return "Could not reach Supabase. Confirm NEXT_PUBLIC_SUPABASE_URL and the anon key in .env.local (no spaces), restart the dev server after changing env, check the project is not paused, and try without VPN or strict firewall rules.";
  }
  return err.message;
}

/** Maps Supabase/auth callback query `error` codes to user-facing copy. */
export function mapAuthUrlError(code: string): string {
  if (code === "missing_config") {
    return "Supabase environment variables are not configured.";
  }
  if (code === "auth") {
    return "We could not complete sign-in. Try again.";
  }
  return code.replace(/\+/g, " ");
}
