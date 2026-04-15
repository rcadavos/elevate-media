/** Stored auth method on `sign_in_events.auth_factor`. */
export type LoginHistoryFactor =
  | "password"
  | "email_link"
  | "magic_link"
  | "sso"
  | "recovery";

/** One row from `public.sign_in_events`. */
export type LoginHistoryRow = {
  id: string;
  occurred_at: string;
  user_email: string;
  user_id: string | null;
  ip_address: string | null;
  /** Optional geo label (e.g. from IP lookup); often null until wired). */
  location: string | null;
  user_agent: string | null;
  auth_factor: LoginHistoryFactor | string;
  success: boolean;
};
