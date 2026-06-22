-- Agency CRM core data — clients roster, Meta-tracking weekly metrics,
-- client feedback flywheel, and SOP playbooks. Seeded with the real
-- elev8temedia roster + SOPs imported from the v7.6 localStorage prototype
-- (https://elev8temedia.netlify.app/).
--
-- Read access is open to any authenticated team member (internal agency OS);
-- writes are restricted to admins via public.is_admin() (defined in the
-- profiles migration). Re-runnable: tables use `if not exists`, policies are
-- dropped first, seeds use `on conflict do nothing`.

-- ────────────────────────────────────────────────────────────────────────────
-- Clients (roster)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id text primary key,
  name text not null,
  status text not null default 'Active',
  service text not null default 'META'
    check (service in ('META', 'SMS')),
  contact text,
  email text,
  channel text not null default 'WhatsApp',
  -- Percentage billing model: agency fee is taken on revenue and/or profit.
  profit_margin int not null default 60,
  fee_on_revenue int not null default 10,
  fee_on_profit int not null default 0,
  billing_day int not null default 1,
  target_revenue numeric not null default 0,
  target_roas numeric not null default 0,
  next_drop_date date,
  next_drop_end_date date,
  next_drop_name text,
  next_drop_time text,
  profile_note text not null default '',
  notes text not null default '',
  archived boolean not null default false,
  logo_url text,
  agreement_name text,
  agreement_url text,
  -- Per-client color theme carried over from the prototype.
  theme_bg text,
  theme_accent text,
  theme_initial text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_archived_idx on public.clients (archived);
create index if not exists clients_service_idx on public.clients (service);

alter table public.clients enable row level security;

drop policy if exists "clients_select_authenticated" on public.clients;
create policy "clients_select_authenticated"
  on public.clients for select
  to authenticated
  using (true);

drop policy if exists "clients_write_admin" on public.clients;
create policy "clients_write_admin"
  on public.clients for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.clients to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- Meta-tracking weekly metrics (one row per client per week)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.client_weekly_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.clients (id) on delete cascade,
  week_start date not null,
  spend numeric not null default 0,
  revenue numeric not null default 0,
  launched int not null default 0,
  optimized int not null default 0,
  killed int not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, week_start)
);

create index if not exists client_weekly_metrics_client_idx
  on public.client_weekly_metrics (client_id, week_start desc);

alter table public.client_weekly_metrics enable row level security;

drop policy if exists "client_weekly_metrics_select_authenticated" on public.client_weekly_metrics;
create policy "client_weekly_metrics_select_authenticated"
  on public.client_weekly_metrics for select
  to authenticated
  using (true);

drop policy if exists "client_weekly_metrics_write_admin" on public.client_weekly_metrics;
create policy "client_weekly_metrics_write_admin"
  on public.client_weekly_metrics for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.client_weekly_metrics to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- Client feedback flywheel
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.client_feedback (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.clients (id) on delete cascade,
  feedback_date date not null default current_date,
  summary text not null,
  action_items text not null default '',
  status text not null default 'Open'
    check (status in ('Open', 'In Progress', 'Resolved')),
  tag text,
  created_at timestamptz not null default now()
);

create index if not exists client_feedback_client_idx
  on public.client_feedback (client_id);
create index if not exists client_feedback_status_idx
  on public.client_feedback (status);

alter table public.client_feedback enable row level security;

drop policy if exists "client_feedback_select_authenticated" on public.client_feedback;
create policy "client_feedback_select_authenticated"
  on public.client_feedback for select
  to authenticated
  using (true);

drop policy if exists "client_feedback_write_admin" on public.client_feedback;
create policy "client_feedback_write_admin"
  on public.client_feedback for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.client_feedback to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- SOP playbooks (categories → SOPs → steps)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.sop_categories (
  id text primary key,
  name text not null,
  emoji text,
  bg text,
  accent text,
  initial text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sops (
  id text primary key,
  title text not null,
  category_id text references public.sop_categories (id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sops_category_idx on public.sops (category_id);

create table if not exists public.sop_steps (
  id uuid primary key default gen_random_uuid(),
  sop_id text not null references public.sops (id) on delete cascade,
  step_key text not null,
  position int not null default 0,
  body text not null,
  checked boolean not null default false,
  template text,
  created_at timestamptz not null default now(),
  unique (sop_id, step_key)
);

create index if not exists sop_steps_sop_idx on public.sop_steps (sop_id, position);

alter table public.sop_categories enable row level security;
alter table public.sops enable row level security;
alter table public.sop_steps enable row level security;

drop policy if exists "sop_categories_select_authenticated" on public.sop_categories;
create policy "sop_categories_select_authenticated"
  on public.sop_categories for select to authenticated using (true);
drop policy if exists "sop_categories_write_admin" on public.sop_categories;
create policy "sop_categories_write_admin"
  on public.sop_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sops_select_authenticated" on public.sops;
create policy "sops_select_authenticated"
  on public.sops for select to authenticated using (true);
drop policy if exists "sops_write_admin" on public.sops;
create policy "sops_write_admin"
  on public.sops for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sop_steps_select_authenticated" on public.sop_steps;
create policy "sop_steps_select_authenticated"
  on public.sop_steps for select to authenticated using (true);
drop policy if exists "sop_steps_write_admin" on public.sop_steps;
create policy "sop_steps_write_admin"
  on public.sop_steps for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on table public.sop_categories to authenticated;
grant select, insert, update, delete on table public.sops to authenticated;
grant select, insert, update, delete on table public.sop_steps to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Seed data (real elev8temedia roster + SOPs)
-- ════════════════════════════════════════════════════════════════════════════

insert into public.clients
  (id, name, status, service, contact, email, channel, profit_margin,
   fee_on_revenue, fee_on_profit, billing_day, target_revenue, target_roas,
   profile_note, theme_bg, theme_accent, theme_initial, sort_order)
values
  ('time-is-wealth-usa', 'Time Is Wealth USA', 'Active', 'META', 'Luis Garcia', 'luis@timeiswealth.co', 'WhatsApp', 60, 5, 0, 1, 0, 3.5, '', '#FFF7E6', '#B45309', '#FFE4A8', 1),
  ('same-24-hours', 'Same 24 Hours', 'Active', 'SMS', 'Tykwon Wade', 'same24hoursapparel@gmail.com', 'WhatsApp', 60, 10, 0, 1, 0, 0, 'SMS-only client. 10% of Postscript-attributed revenue only. No Meta tracking, no Shopify cut.', '#E6F4FF', '#1D4ED8', '#BFDBFE', 2),
  ('dos-santos', 'Dos Santos Collective', 'Active', 'META', 'Louis Dos Santos', 'Dossantoscollective@gmail.com', 'WhatsApp', 60, 10, 0, 1, 0, 3.5, '', '#FFEEF0', '#BE185D', '#FBCFE8', 3),
  ('holy-spirit-co', 'Holy Spirit Co', 'Active', 'SMS', 'Christian Graves', 'hspiritclothing@gmail.com', 'WhatsApp', 60, 10, 0, 1, 0, 0, '', '#F3EBFF', '#6D28D9', '#DDD6FE', 4),
  ('art-shordy', 'Art Shordy', 'Active', 'META', 'Tievin Walker', 'shordy@artshordy.com', 'WhatsApp', 60, 10, 0, 1, 0, 3.5, '', '#FFF0E6', '#C2410C', '#FED7AA', 5),
  ('forever-situated', 'Forever Situated', 'Active', 'META', 'Jahlil', 'foreversituated60@gmail.com', 'WhatsApp', 60, 10, 0, 1, 0, 3.5, '', '#EBFAEF', '#047857', '#A7F3D0', 6),
  ('umbra-rare', 'Umbra Rare', 'Active', 'META', 'Alberto Flores', 'umbrareclothing@gmail.com', 'WhatsApp', 60, 10, 0, 1, 0, 3.5, '', '#EBF1FA', '#374151', '#CBD5E1', 7),
  ('outflow-clothing', 'Outflow Clothing', 'Active', 'META', 'Brady Lemon', 'outflowandclothing@gmail.com', 'WhatsApp', 60, 10, 0, 1, 0, 3.5, '', '#FFF4F0', '#9F1239', '#FECDD3', 8)
on conflict (id) do nothing;

insert into public.sop_categories (id, name, emoji, bg, accent, initial, sort_order)
values
  ('onboarding', 'Onboarding', '📥', '#EEEDFE', '#3C3489', '#CECBF6', 1),
  ('client-calls', 'Client Calls', '📞', '#E6F1FB', '#0C447C', '#B5D4F4', 2),
  ('drop-days', 'Drop Days', '🚀', '#FAECE7', '#712B13', '#F5C4B3', 3),
  ('client-reads', 'Client Reads', '🧠', '#EAF3DE', '#27500A', '#C0DD97', 4)
on conflict (id) do nothing;

insert into public.sops (id, title, category_id, sort_order)
values
  ('sop_new_client', 'New client setup', 'onboarding', 1),
  ('sop_discovery_call', 'Discovery call agenda', 'client-calls', 2),
  ('sop_drop_day', 'Drop day timeline', 'drop-days', 3)
on conflict (id) do nothing;

insert into public.sop_steps (sop_id, step_key, position, body, template)
values
  -- New client setup
  ('sop_new_client', 's1', 1, 'Send welcome email within 24 hours of signed contract', $tpl$Hey [name],

Stoked to have you on the Elevate Media roster. I'm Orlando, COO. Quick rundown of next steps:

1. I'll drop a Dropbox folder for our shared assets
2. We lock in a 30-min kickoff call within the week
3. By call time, you'll get an intake sheet to fill out

Reply with your best email for the Dropbox invite and 3 time slots that work this week. Let's get to it.

Orlando$tpl$),
  ('sop_new_client', 's2', 2, 'Create Dropbox folder named after the brand', null),
  ('sop_new_client', 's3', 3, 'Add client to ClickUp Active Roster board', null),
  ('sop_new_client', 's4', 4, 'Update CLAUDE.md with the new client in the Active Clients list', null),
  ('sop_new_client', 's5', 5, 'Create Context and Call Recap subfolders inside the client folder', null),
  ('sop_new_client', 's6', 6, 'Schedule kickoff call (Calendly link or WhatsApp it)', null),
  ('sop_new_client', 's7', 7, 'Send confirmation message after call is booked', $tpl$Locked in. Kickoff call set for [day] at [time] EST. Link in your inbox.

Before the call:
- Fill out the intake sheet I sent
- Send over any existing creative, brand guides, or analytics access

Talk soon.$tpl$),
  ('sop_new_client', 's8', 8, 'Review intake form 24 hours before call so you walk in prepped', null),
  -- Discovery call agenda
  ('sop_discovery_call', 's1', 1, 'Pre-call prep: 5 minutes researching their Instagram, website, last 3 drops', null),
  ('sop_discovery_call', 's2', 2, 'Open with rapport. Where they at, how their week is going. Keep it human.', null),
  ('sop_discovery_call', 's3', 3, 'Hard numbers: ask for current AOV, monthly revenue, profit margin, biggest expense', null),
  ('sop_discovery_call', 's4', 4, 'Identify the biggest 90-day problem. Could be revenue, retention, creative, ops. Pick the one.', null),
  ('sop_discovery_call', 's5', 5, 'Walk through the percentage model. We only get paid when they get paid. Match risk on both sides.', null),
  ('sop_discovery_call', 's6', 6, 'Lock cadence and comms channel. Weekly WhatsApp check-in or biweekly Zoom. Their pick.', null),
  ('sop_discovery_call', 's7', 7, 'Send recap message within 2 hours of call ending', $tpl$Hey [name],

Stoked we got on. Quick recap of what we covered:

Pain point: [biggest 90-day problem]
What we're attacking first: [angle]
Next step from your side: [intake form / pixel access / brand guide]
Next step from mine: [avatar blueprint / creative brief]

I'll have [deliverable] in your inbox by [day]. Talk soon.

Orlando$tpl$),
  -- Drop day timeline
  ('sop_drop_day', 's1', 1, 'T-7 days: confirm exact drop date and time with client. Lock it in EST.', null),
  ('sop_drop_day', 's2', 2, 'T-5 days: lock creative and copy. No more changes after this.', null),
  ('sop_drop_day', 's3', 3, 'T-3 days: final review call with client. Walk through every asset, every message.', null),
  ('sop_drop_day', 's4', 4, 'T-2 days: schedule SMS blast in Postscript for exact drop time', $tpl$Drop incoming.

[Product] live tomorrow at [time] EST.

Limited run. Set your alarm.

Link locked until launch.$tpl$),
  ('sop_drop_day', 's5', 5, 'T-1 day: test SMS flow with internal numbers. Confirm pixel firing.', null),
  ('sop_drop_day', 's6', 6, 'T-0 launch hour: fire SMS blast at exact drop time', $tpl$It's live.

[Product] available now.
[link]

Limited drop. Don't sleep.$tpl$),
  ('sop_drop_day', 's7', 7, 'T+1 hour: monitor for technical issues. Site speed, checkout flow, pixel.', null),
  ('sop_drop_day', 's8', 8, 'T+2 days: pull 24-hour and 48-hour performance numbers', null),
  ('sop_drop_day', 's9', 9, 'T+3 days: send post-launch report', $tpl$Drop recap.

Revenue: [X]
ROAS: [X]
SMS open rate: [X]
Click rate: [X]
Killers: [the angle/creative/segment that performed best]
Losers: [what to cut next drop]

Next drop prep starts [date]. Talk soon.$tpl$)
on conflict (sop_id, step_key) do nothing;
