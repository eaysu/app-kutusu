-- App Kutusu — database schema
-- Run this once against a fresh Supabase Postgres project.

create extension if not exists "pgcrypto";

-- Uniqueness analysis enum
do $$ begin
  create type ai_uniqueness as enum ('original', 'similar_exists', 'common');
exception
  when duplicate_object then null;
end $$;

-- ideas: one active idea per session_id
create table if not exists ideas (
  id            uuid primary key default gen_random_uuid(),
  session_id    text not null unique,
  title         text not null check (char_length(title) >= 3),
  description   text not null check (char_length(description) >= 80),
  similar_links text[] not null default '{}',
  upvotes       integer not null default 0,
  ai_analysis   jsonb,
  ai_uniqueness ai_uniqueness,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists ideas_upvotes_idx on ideas (upvotes desc, created_at desc);

-- upvotes: one upvote per (idea, session) — the unique constraint prevents double-vote
create table if not exists upvotes (
  id         uuid primary key default gen_random_uuid(),
  idea_id    uuid not null references ideas(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  unique (idea_id, session_id)
);

create index if not exists upvotes_idea_idx on upvotes (idea_id);

-- Keep ideas.upvotes denormalised in sync with the upvotes table.
create or replace function bump_idea_upvotes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update ideas set upvotes = upvotes + 1 where id = new.idea_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update ideas set upvotes = greatest(upvotes - 1, 0) where id = old.idea_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists upvotes_count_trg on upvotes;
create trigger upvotes_count_trg
after insert or delete on upvotes
for each row execute function bump_idea_upvotes();

-- updated_at auto-touch on idea edits
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists ideas_touch_trg on ideas;
create trigger ideas_touch_trg
before update on ideas
for each row execute function touch_updated_at();
