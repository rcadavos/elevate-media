-- If an older `profiles` migration used EXISTS (select from profiles …) for the admin
-- policy, PostgREST could return errors when loading a row. This patch is idempotent.

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

drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

grant select, update on table public.profiles to authenticated;
