-- Profiles linked to auth.users; roles for RBAC and Directory.
-- After this migration, promote your first admin in the SQL editor, for example:
--   update public.profiles set role = 'admin' where email = 'you@yourdomain.com';

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text not null default 'client'
    check (role in ('admin', 'client', 'sales', 'finance', 'operations')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- Admin checks must not scan `profiles` under the same RLS policies (recursion / errors).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Idempotent: allow re-running this migration in the SQL editor without 42710 errors.
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep email in sync from auth (optional convenience)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'client')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Backfill existing auth users (run once after migration)
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  coalesce(nullif(u.raw_user_meta_data->>'role', ''), 'client')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

grant select, update on table public.profiles to authenticated;
