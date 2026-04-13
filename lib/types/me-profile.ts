/** Own profile row returned by `/api/me/profile`. */
export type MeProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};
