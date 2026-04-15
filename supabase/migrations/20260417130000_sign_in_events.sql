-- Per sign-in attempts for admin reporting (IP, UA, geo placeholder, success).

create table if not exists public.sign_in_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  user_email text not null,
  ip_address text,
  location text,
  user_agent text,
  auth_factor text not null default 'password',
  success boolean not null
);

create index if not exists sign_in_events_occurred_at_idx
  on public.sign_in_events (occurred_at desc);

create index if not exists sign_in_events_user_id_idx
  on public.sign_in_events (user_id);

alter table public.sign_in_events enable row level security;

drop policy if exists "sign_in_events_select_admin" on public.sign_in_events;
create policy "sign_in_events_select_admin"
  on public.sign_in_events for select
  to authenticated
  using (public.is_admin());

drop policy if exists "sign_in_events_insert_self" on public.sign_in_events;
create policy "sign_in_events_insert_self"
  on public.sign_in_events for insert
  to authenticated
  with check (
    success is true
    and user_id is not null
    and user_id = auth.uid()
  );

grant select, insert on table public.sign_in_events to authenticated;
