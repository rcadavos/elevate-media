-- Allow onboarding invites before an auth user exists (client directory flow).
-- Admins capture email + names + business name; the auth user is created in /api/onboarding/complete.

alter table public.onboarding_invites
  alter column user_id drop not null;

alter table public.onboarding_invites
  add column if not exists email text,
  add column if not exists pending_full_name text,
  add column if not exists business_name text;

alter table public.onboarding_invites
  drop constraint if exists onboarding_invites_user_or_email_ck;

alter table public.onboarding_invites
  add constraint onboarding_invites_user_or_email_ck
  check (
    user_id is not null
    or (
      email is not null
      and length(trim(email)) > 0
    )
  );

alter table public.profiles
  add column if not exists business_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, business_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'client'),
    nullif(trim(coalesce(new.raw_user_meta_data->>'business_name', '')), '')
  );
  return new;
end;
$$;
