-- One-time invite links for directory users to finish onboarding (password + profile).

alter table public.profiles
  add column if not exists onboarding_sent_at timestamptz;

create table if not exists public.onboarding_invites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null
    check (role in ('admin', 'client', 'sales', 'finance', 'operations')),
  token_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists onboarding_invites_token_hash_idx
  on public.onboarding_invites (token_hash);

create index if not exists onboarding_invites_user_id_idx
  on public.onboarding_invites (user_id);

alter table public.onboarding_invites enable row level security;

-- No policies: only the service role (bypasses RLS) touches this table from API routes.
