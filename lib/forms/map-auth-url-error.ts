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
