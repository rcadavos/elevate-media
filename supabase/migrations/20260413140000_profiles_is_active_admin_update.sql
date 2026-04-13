-- Active flag for directory users; admins can update profiles via API.

alter table public.profiles
  add column if not exists is_active boolean not null default true;

drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
