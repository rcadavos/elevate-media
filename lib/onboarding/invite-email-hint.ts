/** Masks an email for display on onboarding (e.g. j***@example.com). */
export function emailInviteHint(email: string | null | undefined): string {
  const e = email?.trim().toLowerCase() ?? "";
  if (!e.includes("@")) {
    return "your work email";
  }
  const [local, domain] = e.split("@");
  if (!domain) {
    return "your work email";
  }
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}
