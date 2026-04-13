-- Business logo + client avatar URLs; canonical join date for directory UI.

alter table public.profiles
  add column if not exists business_logo_url text,
  add column if not exists avatar_url text,
  add column if not exists date_joined timestamptz;

update public.profiles
set date_joined = created_at
where date_joined is null;

alter table public.profiles
  alter column date_joined set default now();

alter table public.profiles
  alter column date_joined set not null;

-- Public bucket for profile images (served via public URL; uploads use service role in app API).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-assets',
  'profile-assets',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
