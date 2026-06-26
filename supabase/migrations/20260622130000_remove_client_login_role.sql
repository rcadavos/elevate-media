-- Remove the "client" LOGIN role. Clients are now data only — the managed
-- roster lives in public.clients (20260622120000_agency_crm.sql) and is NOT
-- touched here. Logins are for elev8temedia team members only:
-- admin, sales, finance, operations.
--
-- This tightens the role CHECK on public.profiles and public.onboarding_invites,
-- changes the new-user default away from 'client', and removes any legacy
-- client logins + pending client onboarding invites. Re-runnable.

-- 1) Remove legacy client-login data BEFORE tightening the CHECK constraints
--    (an ADD CONSTRAINT fails if any surviving row still has role = 'client').
--    NOTE: this deletes client *profile* rows only. Their auth.users records
--    cannot be removed from SQL — delete those from the Supabase dashboard if
--    you want the accounts fully gone. The public.clients roster is untouched.
delete from public.onboarding_invites where role = 'client';
delete from public.profiles where role = 'client';

-- 2) public.profiles.role — new default + tightened CHECK (no 'client').
alter table public.profiles alter column role set default 'operations';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'sales', 'finance', 'operations'));

-- 3) public.onboarding_invites.role — same tightening. The table itself stays:
--    team-member onboarding (admin creates the user, then sends an invite link)
--    still uses it.
alter table public.onboarding_invites drop constraint if exists onboarding_invites_role_check;
alter table public.onboarding_invites
  add constraint onboarding_invites_role_check
  check (role in ('admin', 'sales', 'finance', 'operations'));

-- 4) Recreate the new-user trigger function so the fallback role is no longer
--    'client' (matches the new column default). Preserves the business_name
--    capture from 20260413200000. The on_auth_user_created trigger binding is
--    retained by CREATE OR REPLACE.
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
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'operations'),
    nullif(trim(coalesce(new.raw_user_meta_data->>'business_name', '')), '')
  );
  return new;
end;
$$;
