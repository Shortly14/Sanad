-- Sanad — Supabase schema
-- Run this whole file in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run more than once (every step is written to not fail on a rerun).

create extension if not exists pgcrypto; -- gen_random_uuid() + crypt() for password hashing

-- ============================================================
-- 1. Tables that were already implied by the app but never
--    formally documented. Skipped automatically if they exist.
-- ============================================================

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  phone text
);

create table if not exists housing_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  city text, rent int, room_type text, gender_pref text,
  nationality_pref text, bills_included boolean,
  description text, poster_role text, whatsapp text, video_url text,
  poster_user_id uuid references app_users(id) on delete set null
);

create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  category text, question text, posted_by text, votes int default 0,
  poster_user_id uuid references app_users(id) on delete set null
);

create table if not exists forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references forum_posts(id) on delete cascade,
  reply_text text
);

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references app_users(id) on delete cascade,
  page text, code text unique
);

create table if not exists share_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  share_link_id uuid references share_links(id) on delete cascade
);

create table if not exists buddies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references app_users(id) on delete cascade,
  help_areas text[], bio text, whatsapp text
);

-- create table if not exists is a no-op on a table that already existed
-- before poster_user_id was added to it here, so add it explicitly too —
-- this is what lets tapping a listing's avatar open the poster's profile.
alter table housing_listings add column if not exists poster_user_id uuid references app_users(id) on delete set null;
alter table forum_posts add column if not exists poster_user_id uuid references app_users(id) on delete set null;

-- ============================================================
-- 2. Username + password login
-- ============================================================

alter table app_users
  add column if not exists username text,
  add column if not exists password_hash text;

-- The old quick sign-in required a phone number; the new username+password
-- flow doesn't collect one, so it can no longer be mandatory.
alter table app_users alter column phone drop not null;

-- Backfill: any accounts created by the old "name + phone, no password"
-- quick sign-in won't have a username yet. Give them a placeholder so
-- the unique constraint below doesn't fail — they'll need to sign up
-- fresh to set a real password.
update app_users
set username = 'user_' || substr(id::text, 1, 8)
where username is null;

alter table app_users alter column username set not null;

do $$
begin
  alter table app_users add constraint app_users_username_key unique (username);
exception
  -- A unique constraint is backed by an index, so Postgres reports a repeat
  -- attempt as 42P07 (duplicate_table), not 42710 (duplicate_object) — catch
  -- both so this is safe however it was created.
  when duplicate_table then null;
  when duplicate_object then null;
end $$;

-- ============================================================
-- 3. Lock the table down. password_hash must never be reachable
--    through the public API — only through the two functions below,
--    which run as the table owner and bypass RLS entirely.
-- ============================================================

alter table app_users enable row level security;

-- Wipe any older policies (e.g. from the previous phone-based sign-in)
-- so nothing accidentally leaves the table open to direct reads.
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'app_users' loop
    execute format('drop policy %I on public.app_users', pol.policyname);
  end loop;
end $$;

revoke all on app_users from anon, authenticated;

-- The only thing safe to expose directly: buddy cards show the
-- poster's display name via a join (app_users(name)) — nothing else.
-- Row-level policy makes every row visible; the column grant above
-- narrows *which columns* of that row anyone can actually see, so
-- username/password_hash/phone stay unreachable through the API
-- no matter what a client asks for.
grant select (id, name) on app_users to anon, authenticated;

create policy "public name lookup" on app_users for select using (true);

-- ============================================================
-- 4. Sign-up / login functions (SECURITY DEFINER = run with the
--    table owner's rights, so they work even though anon/authenticated
--    have no direct table access above).
-- ============================================================

-- session_token proves "I am this user" to the mutating functions added later
-- (vote_on_reply, set_open_to_work) without needing a real auth/session layer —
-- a random, unguessable value only login/signup ever mint or rotate.
alter table app_users add column if not exists session_token text;
create unique index if not exists idx_app_users_session_token on app_users(session_token) where session_token is not null;

-- Postgres won't let CREATE OR REPLACE change a function's return type —
-- and these already exist (without session_token) from the first version
-- of this file — so drop them first. Safe: the bodies below recreate both
-- immediately, and DROP...IF EXISTS is a no-op on a first-time run.
drop function if exists signup_user(text, text, text, text);
drop function if exists login_user(text, text);

-- Failed logins, so login_user can slow down password guessing: 5 misses per
-- username or 20 per IP address inside 15 minutes locks that username/IP out
-- for the rest of the window. Nobody reads this table through the API.
create table if not exists login_attempts (
  id bigserial primary key,
  attempted_at timestamptz default now(),
  username text,
  ip text
);
create index if not exists idx_login_attempts_username on login_attempts(username, attempted_at);
create index if not exists idx_login_attempts_ip on login_attempts(ip, attempted_at);
alter table login_attempts enable row level security;
revoke all on login_attempts from anon, authenticated;

create or replace function signup_user(
  p_username text,
  p_password text,
  p_name text default null,
  p_phone text default null
)
returns table(id uuid, username text, name text, created_at timestamptz, session_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  -- New accounts are created only by a verified WhatsApp code (phone_login,
  -- section 14). Kept so older cached copies of the app get a clear error.
  raise exception 'Sign up with your WhatsApp number';
end;
$$;

create or replace function login_user(
  p_username text,
  p_password text
)
returns table(id uuid, username text, name text, created_at timestamptz, session_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_username text := lower(trim(p_username));
  -- Cloudflare sets cf-connecting-ip on every request through the tunnel and
  -- overwrites any value a client sends. Null when called outside the API.
  v_ip text := nullif(current_setting('request.headers', true), '')::json->>'cf-connecting-ip';
begin
  delete from login_attempts where attempted_at < now() - interval '1 day';

  if (select count(*) from login_attempts
      where login_attempts.username = v_username and attempted_at > now() - interval '15 minutes') >= 5
     or (v_ip is not null and (select count(*) from login_attempts
      where login_attempts.ip = v_ip and attempted_at > now() - interval '15 minutes') >= 20) then
    raise exception 'Too many failed attempts, try again in 15 minutes';
  end if;

  select app_users.id into v_id
  from app_users
  where app_users.username = v_username
    and app_users.password_hash = crypt(p_password, app_users.password_hash);

  if v_id is null then
    -- Returning no row (instead of raising) is what the app treats as
    -- "Invalid username or password" — and it keeps this insert, which a
    -- raised exception would roll back. Deliberately vague either way.
    insert into login_attempts (username, ip) values (v_username, v_ip);
    return;
  end if;

  delete from login_attempts where login_attempts.username = v_username;

  -- Each login adds a session (app_sessions, section 14), so signing in on
  -- a second phone no longer signs the first one out.
  return query select * from sanad_new_session(v_id);
end;
$$;

grant execute on function signup_user(text, text, text, text) to anon, authenticated;
grant execute on function login_user(text, text) to anon, authenticated;

-- ============================================================
-- 5. Everything else (housing_listings, forum_posts, forum_replies,
--    share_links, share_clicks, buddies) stays publicly readable —
--    this is a public board, only app_users holds anything secret.
--    Skips a table's policy if you've already set one up by hand.
-- ============================================================

alter table housing_listings enable row level security;
alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table share_links enable row level security;
alter table share_clicks enable row level security;
alter table buddies enable row level security;

do $$
declare
  t text;
  tables text[] := array['housing_listings','forum_posts','forum_replies','share_links','share_clicks','buddies'];
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'public read'
    ) then
      execute format('create policy "public read" on public.%I for select using (true)', t);
    end if;
    -- Only share_clicks keeps a direct public insert (an anonymous visitor
    -- landing on a ?ref= link). Every other table is written through the
    -- session-token functions in section 11, which drop these policies.
    if t = 'share_clicks' and not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'public insert'
    ) then
      execute format('create policy "public insert" on public.%I for insert with check (true)', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- 6. Reply attribution + votes. forum_replies already had public
--    read/insert from section 5 (it's in that tables[] array), so
--    only the new columns + the votes table need policies here.
-- ============================================================

alter table forum_replies add column if not exists poster_user_id uuid references app_users(id) on delete set null;
alter table forum_replies add column if not exists created_at timestamptz default now();
alter table forum_replies add column if not exists votes int default 0;
create index if not exists idx_forum_replies_created_at on forum_replies(created_at);
create index if not exists idx_forum_replies_poster on forum_replies(poster_user_id);

create table if not exists forum_reply_votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  reply_id uuid references forum_replies(id) on delete cascade,
  user_id uuid references app_users(id) on delete cascade,
  unique (reply_id, user_id)
);
alter table forum_reply_votes enable row level security;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'forum_reply_votes' loop
    execute format('drop policy %I on public.forum_reply_votes', pol.policyname);
  end loop;
end $$;

create policy "public read" on public.forum_reply_votes for select using (true);
-- Deliberately no insert policy — the only insert path is vote_on_reply()
-- below, so a raw POST to this table from a client is always rejected.

-- ============================================================
-- 7. Reply voting — one vote per signed-in user per reply, enforced
--    server-side. p_session_token (not a raw user id) proves who's
--    calling, the same way login_user proves identity by checking a
--    password rather than trusting a client-asserted username.
-- ============================================================

create or replace function vote_on_reply(p_session_token text, p_reply_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user_id uuid;
begin
  select id into v_user_id from sanad_session_user(p_session_token);
  if not exists (select 1 from forum_replies where id = p_reply_id) then
    raise exception 'That reply no longer exists';
  end if;

  insert into forum_reply_votes (reply_id, user_id) values (p_reply_id, v_user_id);
  update forum_replies set votes = votes + 1 where id = p_reply_id;
exception
  when unique_violation then
    raise exception 'You already upvoted this reply';
end;
$$;

grant execute on function vote_on_reply(text, uuid) to anon, authenticated;

-- ============================================================
-- 8. Monthly helpfulness aggregate. A plain view, not a materialized
--    one — this app has no cron infra, and a GROUP BY over an indexed
--    created_at column is cheap at this scale, so recomputing on every
--    read keeps it simple and always fresh instead of trading that for
--    a staleness/refresh-schedule problem the app doesn't need yet.
--    Raw counts only — score weighting happens client-side in app.js
--    so the formula can be tuned without a migration.
-- ============================================================

create or replace view leaderboard_components as
select
  fr.poster_user_id as user_id,
  count(fr.id) filter (where fr.created_at >= date_trunc('month', now())) as reply_count_month,
  count(v.id)  filter (where v.created_at  >= date_trunc('month', now())) as vote_count_month
from forum_replies fr
left join forum_reply_votes v on v.reply_id = fr.id
where fr.poster_user_id is not null
group by fr.poster_user_id;

grant select on leaderboard_components to anon, authenticated;

-- ============================================================
-- 9. Employer opt-in. open_to_work_directory is a *view*, not a
--    grant on app_users — same "one narrow named door" pattern as
--    signup_user/login_user. Its `where open_to_work = true` clause
--    is fixed at creation time, so an opted-out user's contact info
--    is structurally unreachable through it, not just filtered by
--    convention. employer_contact_whatsapp is a separate column from
--    phone (which is optional/private, collected in a different
--    context) — opting in explicitly asks for a number at that moment.
-- ============================================================

alter table app_users add column if not exists open_to_work boolean default false;
alter table app_users add column if not exists employer_contact_whatsapp text;

create or replace function set_open_to_work(p_session_token text, p_enabled boolean, p_whatsapp text default null)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user_id uuid;
begin
  select id into v_user_id from sanad_session_user(p_session_token);
  if p_enabled and (p_whatsapp is null or length(trim(p_whatsapp)) < 8) then
    raise exception 'A WhatsApp number is required to become visible to employers';
  end if;

  update app_users
  set open_to_work = p_enabled,
      employer_contact_whatsapp = case when p_enabled then trim(p_whatsapp) else null end
  where id = v_user_id;
end;
$$;

grant execute on function set_open_to_work(text, boolean, text) to anon, authenticated;

create or replace view open_to_work_directory as
  select id, name, employer_contact_whatsapp, created_at
  from app_users
  where open_to_work = true;

grant select on open_to_work_directory to anon, authenticated;

-- ============================================================
-- 10. Phase 2 (plan.md): generalize housing_listings toward a
--     unified "Posts" structure so Phase 3's Explore feed can
--     show housing, inquiries, and guides from one table.
--     description already serves as the bio/description "content"
--     column the plan asks for, so it's left as-is — no rename,
--     no change to the existing RLS policies from section 5.
-- ============================================================

alter table housing_listings add column if not exists post_type text default 'housing';
alter table housing_listings add column if not exists media_url text;
alter table housing_listings add column if not exists nationality_target text;

-- Every row that predates this migration was a housing listing.
update housing_listings set post_type = 'housing' where post_type is null;

alter table housing_listings alter column post_type set not null;

do $$
begin
  alter table housing_listings add constraint housing_listings_post_type_check
    check (post_type in ('housing', 'inquiry', 'guide'));
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_housing_listings_post_type on housing_listings(post_type);

-- ============================================================
-- 11. Writes go through the signed-in user's session token.
--     Direct inserts used to trust whatever poster_user_id /
--     posted_by / user_id the browser sent, so anyone could post
--     as anyone. These functions look the user up from
--     p_session_token (same pattern as vote_on_reply) and fill in
--     the id and display name themselves.
-- ============================================================

-- Internal helper — not callable through the API.
create or replace function sanad_session_user(p_session_token text)
returns table(id uuid, name text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_id uuid; v_name text; v_verified timestamptz;
begin
  if p_session_token is null or length(p_session_token) < 32 then
    raise exception 'You need to be signed in to do this';
  end if;
  -- app_sessions (section 14) holds one row per signed-in device. Tokens
  -- minted before it existed live in app_users.session_token.
  select u.id, u.name, u.phone_verified_at into v_id, v_name, v_verified
  from app_sessions s join app_users u on u.id = s.user_id
  where s.token = p_session_token and s.last_used_at > now() - interval '90 days';
  if v_id is null then
    select u.id, u.name, u.phone_verified_at into v_id, v_name, v_verified
    from app_users u where u.session_token = p_session_token;
  end if;
  if v_id is null then
    raise exception 'You need to be signed in to do this';
  end if;
  if v_verified is null then
    raise exception 'Verify your WhatsApp number first';
  end if;
  update app_sessions set last_used_at = now()
  where token = p_session_token and last_used_at < now() - interval '1 day';
  -- A WhatsApp account that closed the app before picking a name.
  return query select v_id, coalesce(v_name, 'Member');
end;
$$;
revoke execute on function sanad_session_user(text) from public, anon, authenticated;

create or replace function create_listing(
  p_session_token text,
  p_post_type text,
  p_description text,
  p_city text default null,
  p_rent int default null,
  p_room_type text default null,
  p_gender_pref text default null,
  p_nationality_pref text default null,
  p_bills_included boolean default null,
  p_whatsapp text default null,
  p_video_url text default null,
  p_media_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user record; v_id uuid;
begin
  select * into v_user from sanad_session_user(p_session_token);
  if length(coalesce(p_description, '')) > 2000 then raise exception 'Text is too long'; end if;
  if length(coalesce(p_city, '')) > 60 or length(coalesce(p_room_type, '')) > 30
     or length(coalesce(p_gender_pref, '')) > 30 or length(coalesce(p_nationality_pref, '')) > 60
     or length(coalesce(p_whatsapp, '')) > 32 then
    raise exception 'A field is too long';
  end if;
  -- Media must be a file this site's own storage handed out, not any URL.
  if p_video_url is not null and p_video_url !~ '^https?://[^/"''<>\s]+/storage/v1/object/public/listing-videos/[A-Za-z0-9._-]+$' then
    raise exception 'Invalid video link';
  end if;
  if p_media_url is not null and p_media_url !~ '^https?://[^/"''<>\s]+/storage/v1/object/public/post-images/[A-Za-z0-9._-]+$' then
    raise exception 'Invalid image link';
  end if;

  insert into housing_listings (post_type, city, rent, room_type, gender_pref, nationality_pref, bills_included,
                                description, whatsapp, video_url, media_url, poster_role, poster_user_id)
  values (p_post_type, p_city, p_rent, p_room_type, p_gender_pref, p_nationality_pref, p_bills_included,
          p_description, p_whatsapp, p_video_url, p_media_url, v_user.name, v_user.id)
  returning housing_listings.id into v_id;
  return v_id;
end;
$$;

create or replace function create_forum_post(p_session_token text, p_category text, p_question text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user record; v_id uuid;
begin
  select * into v_user from sanad_session_user(p_session_token);
  if length(trim(coalesce(p_question, ''))) = 0 then raise exception 'Question is empty'; end if;
  if length(p_question) > 1000 or length(coalesce(p_category, '')) > 40 then raise exception 'Text is too long'; end if;

  insert into forum_posts (category, question, posted_by, votes, poster_user_id)
  values (p_category, p_question, v_user.name, 0, v_user.id)
  returning forum_posts.id into v_id;
  return v_id;
end;
$$;

create or replace function create_forum_reply(p_session_token text, p_post_id uuid, p_reply_text text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user record; v_id uuid;
begin
  select * into v_user from sanad_session_user(p_session_token);
  if length(trim(coalesce(p_reply_text, ''))) = 0 then raise exception 'Reply is empty'; end if;
  if length(p_reply_text) > 2000 then raise exception 'Text is too long'; end if;
  if not exists (select 1 from forum_posts where forum_posts.id = p_post_id) then
    raise exception 'That question no longer exists';
  end if;

  insert into forum_replies (post_id, reply_text, poster_user_id)
  values (p_post_id, p_reply_text, v_user.id)
  returning forum_replies.id into v_id;
  return v_id;
end;
$$;

create or replace function create_buddy(p_session_token text, p_help_areas text[], p_bio text, p_whatsapp text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user record; v_id uuid;
begin
  select * into v_user from sanad_session_user(p_session_token);
  if length(coalesce(p_bio, '')) > 500 then raise exception 'Text is too long'; end if;
  if coalesce(p_whatsapp, '') !~ '^[0-9]{0,20}$' then raise exception 'Invalid WhatsApp number'; end if;
  if coalesce(array_length(p_help_areas, 1), 0) > 10 then raise exception 'Too many help areas'; end if;

  insert into buddies (user_id, help_areas, bio, whatsapp)
  values (v_user.id, p_help_areas, p_bio, p_whatsapp)
  returning buddies.id into v_id;
  return v_id;
end;
$$;

create or replace function create_share_link(p_session_token text, p_page text, p_code text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user record; v_id uuid;
begin
  select * into v_user from sanad_session_user(p_session_token);
  if p_page not in ('guide', 'housing', 'community') then raise exception 'Unknown page'; end if;
  if coalesce(p_code, '') !~ '^[a-z0-9]{4,16}$' then raise exception 'Invalid code'; end if;

  insert into share_links (user_id, page, code)
  values (v_user.id, p_page, p_code)
  returning share_links.id into v_id;
  return v_id;
end;
$$;

grant execute on function create_listing(text, text, text, text, int, text, text, text, boolean, text, text, text) to anon, authenticated;
grant execute on function create_forum_post(text, text, text) to anon, authenticated;
grant execute on function create_forum_reply(text, uuid, text) to anon, authenticated;
grant execute on function create_buddy(text, text[], text, text) to anon, authenticated;
grant execute on function create_share_link(text, text, text) to anon, authenticated;

-- Close the direct write path. Drops every insert/update/delete policy on
-- these tables — the "public insert" ones from section 5 and any older
-- hand-made duplicates (e.g. "Public update forum votes") — and removes the
-- table privileges too, so a raw POST/PATCH/DELETE from a client is refused.
-- share_clicks keeps only its "public insert" (anonymous ?ref= link clicks).
do $$
declare pol record;
begin
  for pol in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and cmd <> 'SELECT'
      and (tablename in ('housing_listings','forum_posts','forum_replies','share_links','buddies','forum_reply_votes')
           or (tablename = 'share_clicks' and not (cmd = 'INSERT' and policyname = 'public insert')))
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

revoke insert, update, delete, truncate on housing_listings, forum_posts, forum_replies, share_links, buddies, forum_reply_votes from anon, authenticated;
revoke update, delete, truncate on share_clicks from anon, authenticated;

-- ============================================================
-- 12. Storage limits. Uploads were unlimited (any size, any file
--     type, any number), so anyone could fill the PC's disk or host
--     arbitrary files on the API domain. Skipped when the storage
--     schema isn't there (plain Postgres).
-- ============================================================

-- At most 100 uploads per hour across the whole site — a brake on
-- disk-filling, far above normal use. Checked by the upload policy below.
create or replace function sanad_upload_budget_ok()
returns boolean
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
begin
  return (select count(*) from storage.objects
          where bucket_id in ('listing-videos', 'post-images')
            and created_at > now() - interval '1 hour') < 100;
end;
$$;
grant execute on function sanad_upload_budget_ok() to anon, authenticated;

do $$
declare pol record;
begin
  if to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    return;
  end if;

  -- 50 MB matches self-hosted Storage's default global FILE_SIZE_LIMIT.
  update storage.buckets
  set file_size_limit = 52428800,
      allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp']
  where id = 'listing-videos';

  update storage.buckets
  set file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  where id = 'post-images';

  -- Replace any existing write policy on these two buckets (e.g. "Public
  -- upload sanad media") — including update/delete ones, which let anyone
  -- overwrite or remove other people's files. Public reads don't use RLS.
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and cmd <> 'SELECT'
      and (coalesce(qual, '') || coalesce(with_check, '')) ~ '(listing-videos|post-images)'
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;

  create policy "sanad upload" on storage.objects for insert to anon, authenticated
    with check (
      bucket_id in ('listing-videos', 'post-images')
      and position('/' in name) = 0
      and public.sanad_upload_budget_ok()
    );
end $$;

-- ============================================================
-- 14. WhatsApp code sign-in. otp_create() makes a 6-digit code;
--     the send-otp Edge Function (supabase/functions/send-otp) is the
--     only caller (service_role key) and sends it through Meta's
--     WhatsApp Cloud API. The browser then calls verify_phone_code()
--     with the code it received.
--     - Every write now needs a verified WhatsApp number (checked in
--       sanad_session_user). Username accounts keep working after
--       they add their number once.
--     - app_sessions keeps one row per signed-in device, so signing
--       in on a second phone no longer signs the first one out.
--     - otp_requests limits how many codes can be sent, so nobody can
--       run up the WhatsApp bill. Each code allows 5 guesses and
--       expires after 10 minutes.
-- ============================================================

alter table app_users add column if not exists phone_verified_at timestamptz;
-- One account per verified number. Older unverified phone values are
-- ignored, so this can't fail on existing data.
create unique index if not exists idx_app_users_verified_phone on app_users(phone) where phone_verified_at is not null;

create table if not exists app_sessions (
  token text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz default now(),
  last_used_at timestamptz default now()
);
create index if not exists idx_app_sessions_user on app_sessions(user_id);
alter table app_sessions enable row level security;
revoke all on app_sessions from anon, authenticated;

create table if not exists otp_requests (
  id bigserial primary key,
  phone text not null,
  ip text,
  requested_at timestamptz default now()
);
create index if not exists idx_otp_requests_phone on otp_requests(phone, requested_at);
create index if not exists idx_otp_requests_ip on otp_requests(ip, requested_at);
alter table otp_requests enable row level security;
revoke all on otp_requests from anon, authenticated;

-- The latest code per number, stored hashed.
create table if not exists otp_codes (
  phone text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0
);
alter table otp_codes enable row level security;
revoke all on otp_codes from anon, authenticated;

-- Internal helper: adds a session for a user, same shape login_user returns.
create or replace function sanad_new_session(p_user_id uuid)
returns table(id uuid, username text, name text, created_at timestamptz, session_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_token text := encode(gen_random_bytes(32), 'hex');
begin
  insert into app_sessions (token, user_id) values (v_token, p_user_id);
  return query select u.id, u.username, u.name, u.created_at, v_token from app_users u where u.id = p_user_id;
end;
$$;

-- Called by send-otp. Returns a new code for the number, or null when the
-- limit is reached: at most 3 codes per number per 15 minutes, 10 per IP
-- per hour, and 300 per hour site-wide.
create or replace function otp_create(p_phone text, p_ip text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  -- gen_random_bytes is cryptographically random; random() is not.
  v_code text := lpad((('x' || lpad(encode(gen_random_bytes(4), 'hex'), 16, '0'))::bit(64)::bigint % 1000000)::text, 6, '0');
begin
  if p_phone is null or p_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Invalid phone number';
  end if;
  delete from otp_requests where requested_at < now() - interval '1 day';
  delete from otp_codes where expires_at < now() - interval '1 day';
  if (select count(*) from otp_requests where phone = p_phone and requested_at > now() - interval '15 minutes') >= 3
     or (p_ip is not null and (select count(*) from otp_requests where ip = p_ip and requested_at > now() - interval '1 hour') >= 10)
     or (select count(*) from otp_requests where requested_at > now() - interval '1 hour') >= 300 then
    return null;
  end if;
  insert into otp_requests (phone, ip) values (p_phone, p_ip);
  insert into otp_codes (phone, code_hash, expires_at, attempts)
  values (p_phone, crypt(v_code, gen_salt('bf')), now() + interval '10 minutes', 0)
  on conflict (phone) do update set code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0;
  return v_code;
end;
$$;

-- Internal (called by verify_phone_code once the code is right). Signs in
-- the account with this number, or creates one. With p_link_token (a
-- username account that just logged in), attaches the number to it.
create or replace function phone_login(p_phone text, p_link_token text default null)
returns table(id uuid, username text, name text, created_at timestamptz, session_token text, is_new boolean)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_id uuid; v_link uuid; v_new boolean := false;
begin
  if p_phone is null or p_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Invalid phone number';
  end if;
  select u.id into v_id from app_users u where u.phone = p_phone and u.phone_verified_at is not null;

  if p_link_token is not null then
    select s.user_id into v_link from app_sessions s where s.token = p_link_token;
    if v_link is null then
      select u.id into v_link from app_users u where u.session_token = p_link_token;
    end if;
    if v_link is null then raise exception 'You need to be signed in to do this'; end if;
    if v_id is not null and v_id <> v_link then
      raise exception 'This WhatsApp number is already used by another account';
    end if;
    update app_users set phone = p_phone, phone_verified_at = coalesce(phone_verified_at, now()) where app_users.id = v_link;
    v_id := v_link;
  elsif v_id is null then
    insert into app_users (username, phone, phone_verified_at)
    values ('wa_' || encode(gen_random_bytes(6), 'hex'), p_phone, now())
    returning app_users.id into v_id;
    v_new := true;
  end if;

  return query select s.id, s.username, s.name, s.created_at, s.session_token, v_new from sanad_new_session(v_id) s;
end;
$$;

-- The browser's half of sign-in: checks the code from WhatsApp and, when
-- it's right, signs in. status is 'ok' (the other columns are filled),
-- 'wrong', 'expired', 'too_many', 'number_taken' or 'not_signed_in'.
create or replace function verify_phone_code(p_phone text, p_code text, p_link_token text default null)
returns table(status text, id uuid, username text, name text, created_at timestamptz, session_token text, is_new boolean)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_row otp_codes%rowtype;
begin
  select * into v_row from otp_codes c where c.phone = p_phone;
  if not found or v_row.expires_at < now() then
    return query select 'expired', null::uuid, null::text, null::text, null::timestamptz, null::text, null::boolean;
    return;
  end if;
  if v_row.attempts >= 5 then
    return query select 'too_many', null::uuid, null::text, null::text, null::timestamptz, null::text, null::boolean;
    return;
  end if;
  if v_row.code_hash <> crypt(coalesce(p_code, ''), v_row.code_hash) then
    update otp_codes c set attempts = c.attempts + 1 where c.phone = p_phone;
    return query select 'wrong', null::uuid, null::text, null::text, null::timestamptz, null::text, null::boolean;
    return;
  end if;

  delete from otp_codes c where c.phone = p_phone;
  begin
    return query select 'ok', l.id, l.username, l.name, l.created_at, l.session_token, l.is_new
    from phone_login(p_phone, p_link_token) l;
  exception when raise_exception then
    return query select case when sqlerrm like '%already used%' then 'number_taken' else 'not_signed_in' end,
      null::uuid, null::text, null::text, null::timestamptz, null::text, null::boolean;
  end;
end;
$$;

-- Tells the app whether a saved session still works and has a verified number.
create or replace function session_status(p_session_token text)
returns table(signed_in boolean, phone_verified boolean, phone text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_id uuid;
begin
  if p_session_token is not null and length(p_session_token) >= 32 then
    select s.user_id into v_id from app_sessions s
    where s.token = p_session_token and s.last_used_at > now() - interval '90 days';
    if v_id is null then
      select u.id into v_id from app_users u where u.session_token = p_session_token;
    end if;
  end if;
  if v_id is null then
    return query select false, false, null::text;
    return;
  end if;
  return query select true, u.phone_verified_at is not null, case when u.phone_verified_at is not null then u.phone end
  from app_users u where u.id = v_id;
end;
$$;

-- New WhatsApp accounts pick their public display name right after the code.
create or replace function set_my_name(p_session_token text, p_name text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_user record;
begin
  select * into v_user from sanad_session_user(p_session_token);
  if length(trim(coalesce(p_name, ''))) = 0 then raise exception 'Name is empty'; end if;
  if length(trim(p_name)) > 40 then raise exception 'Text is too long'; end if;
  update app_users set name = trim(p_name) where app_users.id = v_user.id;
end;
$$;

create or replace function sign_out(p_session_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from app_sessions where token = p_session_token;
  update app_users set session_token = null where session_token = p_session_token;
end;
$$;

revoke execute on function sanad_new_session(uuid) from public, anon, authenticated;
revoke execute on function otp_create(text, text) from public, anon, authenticated;
revoke execute on function phone_login(text, text) from public, anon, authenticated;
do $$
begin
  -- service_role is the key the send-otp Edge Function uses. Plain
  -- Postgres (no Supabase roles) skips this.
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function otp_create(text, text) to service_role;
  end if;
end $$;
grant execute on function verify_phone_code(text, text, text) to anon, authenticated;
grant execute on function session_status(text) to anon, authenticated;
grant execute on function set_my_name(text, text) to anon, authenticated;
grant execute on function sign_out(text) to anon, authenticated;
