-- Past Graph — schema (run this first in Supabase SQL Editor)
-- Safe to re-run: drops and rebuilds the app's public tables.

create extension if not exists pgcrypto;

drop table if exists public.video_annotations cascade;
drop table if exists public.videos cascade;
drop table if exists public.sims cascade;
drop table if exists public.articles cascade;
drop table if exists public.questions cascade;
drop table if exists public.topics cascade;
drop table if exists public.subjects cascade;
drop table if exists public.jamb_combos cascade;
drop table if exists public.attempts cascade;
drop table if exists public.events cascade;
drop table if exists public.saved_items cascade;
drop table if exists public.profiles cascade;

-- ------------------------------------------------------------------ content
create table public.subjects (
  slug        text primary key,
  name        text not null,
  blurb       text not null default '',
  color       text not null default '#0071e3',
  created_at  timestamptz not null default now()
);

create table public.topics (
  slug         text primary key,
  subject_slug text not null references public.subjects(slug) on delete cascade,
  name         text not null,
  blurb        text not null default '',
  created_at   timestamptz not null default now()
);

create table public.questions (
  id          uuid primary key default gen_random_uuid(),
  subject_slug text not null references public.subjects(slug) on delete cascade,
  topic_slug   text not null references public.topics(slug) on delete cascade,
  year         int  not null check (year between 2000 and 2025),
  qnum         int  not null default 1,
  stem         text not null,
  options      jsonb not null,
  answer       text not null,
  explanation  text not null default '',
  kind         text not null default 'single' check (kind in ('single','multi')),
  steps        jsonb,
  difficulty   int  not null default 2 check (difficulty between 1 and 3),
  is_free      boolean generated always as (year >= 2021) stored,
  created_at   timestamptz not null default now(),
  unique (subject_slug, year, qnum)
);

create index questions_subject_idx on public.questions (subject_slug, year desc);
create index questions_topic_idx on public.questions (topic_slug);

create table public.articles (
  slug         text primary key,
  subject_slug text not null references public.subjects(slug) on delete cascade,
  topic_slug   text not null references public.topics(slug) on delete cascade,
  title        text not null,
  summary      text not null default '',
  body         text not null default '',
  read_min     int  not null default 4,
  created_at   timestamptz not null default now()
);

create table public.sims (
  slug       text primary key,
  topic_slug text not null references public.topics(slug) on delete cascade,
  title      text not null,
  blurb      text not null default '',
  kind       text not null check (kind in ('projectile','wave','ohm')),
  created_at timestamptz not null default now()
);

create table public.videos (
  id           uuid primary key default gen_random_uuid(),
  subject_slug text not null references public.subjects(slug) on delete cascade,
  topic_slug   text not null references public.topics(slug) on delete cascade,
  youtube_id   text not null,
  title        text not null,
  channel      text not null default '',
  blurb        text not null default '',
  created_at   timestamptz not null default now(),
  unique (youtube_id)
);

create table public.video_annotations (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid not null references public.videos(id) on delete cascade,
  t_start      int not null,
  t_end        int not null,
  title        text not null,
  body         text not null default '',
  kind         text not null default 'note' check (kind in ('note','sim','article')),
  sim_slug     text references public.sims(slug) on delete set null,
  article_slug text references public.articles(slug) on delete set null,
  created_at   timestamptz not null default now(),
  check (t_end > t_start)
);

create index annotations_video_idx on public.video_annotations (video_id, t_start);

create table public.jamb_combos (
  id           bigserial primary key,
  career       text not null,
  course       text not null unique,
  master_key   text not null,
  jamb_subjects text[] not null,
  olevel_note  text not null default '',
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------ people
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  is_premium    boolean not null default false,
  premium_until timestamptz,
  created_at    timestamptz not null default now()
);

create table public.attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  picked      text not null,
  correct     boolean not null,
  created_at  timestamptz not null default now()
);

create index attempts_user_idx on public.attempts (user_id, created_at desc);

create table public.events (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete set null,
  kind       text not null,
  ref        text,
  created_at timestamptz not null default now()
);

create table public.saved_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  ref_type   text not null check (ref_type in ('video','article','sim','question')),
  ref_slug   text not null,
  created_at timestamptz not null default now(),
  unique (user_id, ref_type, ref_slug)
);

-- ------------------------------------------------------------------ RLS
alter table public.subjects          enable row level security;
alter table public.topics            enable row level security;
alter table public.questions         enable row level security;
alter table public.articles          enable row level security;
alter table public.sims              enable row level security;
alter table public.videos            enable row level security;
alter table public.video_annotations enable row level security;
alter table public.jamb_combos       enable row level security;
alter table public.profiles          enable row level security;
alter table public.attempts          enable row level security;
alter table public.events            enable row level security;
alter table public.saved_items       enable row level security;

create policy "read subjects"  on public.subjects          for select using (true);
create policy "read topics"    on public.topics            for select using (true);
create policy "read questions" on public.questions         for select using (true);
create policy "read articles"  on public.articles          for select using (true);
create policy "read sims"      on public.sims              for select using (true);
create policy "read videos"    on public.videos            for select using (true);
create policy "read annots"    on public.video_annotations for select using (true);
create policy "read combos"    on public.jamb_combos       for select using (true);

create policy "own profile read"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id and is_premium = false);
-- Deliberately no UPDATE policy: premium changes only happen server-side (service role / Paystack webhook).

create policy "own attempts insert" on public.attempts for insert to authenticated with check (auth.uid() = user_id);
create policy "own attempts read"   on public.attempts for select to authenticated using (auth.uid() = user_id);

create policy "own events insert" on public.events for insert to authenticated with check (auth.uid() = user_id);
create policy "own events read"   on public.events for select to authenticated using (auth.uid() = user_id);

create policy "own saved all" on public.saved_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
