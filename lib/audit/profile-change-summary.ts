type ProfileSnapshot = {
  full_name: string | null;
  email: string | null;
  business_name?: string | null;
  business_logo_url?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  onboarding_sent_at?: string | null;
  date_joined?: string | null;
};

export function diffProfileFields(
  before: ProfileSnapshot,
  after: ProfileSnapshot,
): Record<string, { from: unknown; to: unknown }> {
  const keys = [
    "full_name",
    "email",
    "business_name",
    "business_logo_url",
    "avatar_url",
    "is_active",
    "onboarding_sent_at",
    "date_joined",
  ] as const;
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of keys) {
    const a = before[k];
    const b = after[k];
    if (a !== b) {
      out[k] = { from: a ?? null, to: b ?? null };
    }
  }
  return out;
}
