export type ProfileRow = {
  id: string;
  /** Real auth user id when available; null for pending invites. */
  user_id?: string | null;
  email: string | null;
  full_name: string | null;
  /** Client accounts; optional on other roles. */
  business_name?: string | null;
  /** Public URL for business logo (storage or CDN). */
  business_logo_url?: string | null;
  /** Public URL for client profile photo. */
  avatar_url?: string | null;
  /** When the client joined (defaults from created_at at migration). */
  date_joined?: string | null;
  role: string;
  created_at: string;
  onboarding_sent_at?: string | null;
  onboarding_status?: "pending" | "completed";
  /** Directory / admin: account enabled (false = inactive). */
  is_active: boolean;
};
