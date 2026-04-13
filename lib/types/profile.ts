export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  onboarding_sent_at?: string | null;
  /** Directory / admin: account enabled (false = inactive). */
  is_active: boolean;
};
