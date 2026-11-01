-- Shqiponisht accounts: profiles (username, name, age range, level) and synced progress.
-- Every row is private to its owner (row-level security). See supabase/README.md.

create extension if not exists citext with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext not null unique
    check (char_length(username) between 3 and 20 and username ~ '^[a-z][a-z0-9_.]*$'
           and username !~ '[._]{2}' and username !~ '[._]$'),
  name text not null default '' check (char_length(name) <= 30),
  age_range text not null check (age_range in ('16-17', '18-24', '25-34', '35-44', '45+')),
  level text not null check (level in ('new', 'some-kana', 'kana', 'kanji')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null check (pg_column_size(data) < 512000),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;

create policy "Own profile: read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Own profile: update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Own progress: read" on public.progress for select to authenticated using (user_id = (select auth.uid()));
create policy "Own progress: insert" on public.progress for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Own progress: update" on public.progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger progress_touch before update on public.progress for each row execute function public.touch_updated_at();

-- Creates the profile from the sign-up metadata. A taken username makes the
-- sign-up fail ("Database error saving new user"), which the app reports as
-- "username taken".
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, name, age_range, level)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'age_range',
    new.raw_user_meta_data ->> 'level'
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up screen check a username before the account exists.
create function public.username_available(candidate text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.profiles where username = lower(candidate)::extensions.citext);
$$;

-- In-app account deletion (required by the App Store and Google Play).
-- Deleting the auth user removes the profile and progress through ON DELETE CASCADE.
create function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
