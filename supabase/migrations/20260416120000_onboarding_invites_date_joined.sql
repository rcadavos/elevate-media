-- Optional join date chosen when creating a pending client invite; applied to profile on onboarding complete.

alter table public.onboarding_invites
  add column if not exists date_joined timestamptz;
