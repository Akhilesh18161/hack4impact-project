// Run this script once to set up the Supabase database schema
// Usage: node scripts/setup-db.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwfmaidiemmakudrxrbk.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Zm1haWRpZW1tYWt1ZHJ4cmJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMzMDA1NiwiZXhwIjoyMDk2OTA2MDU2fQ.sOeQH2737QnThpJsdwIOko0S1cakBLOt1re0YTSGkfY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

const schema = `
-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'community_user',
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles viewable by everyone." on profiles;
create policy "Profiles viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert own profile." on profiles;
create policy "Users can insert own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Posts
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  author_name text not null,
  author_role text not null,
  title text not null,
  description text not null,
  categories text[] not null default '{}',
  media_type text not null default 'none',
  media_urls text[] not null default '{}',
  media_file_names text[] not null default '{}',
  upvotes int not null default 0,
  downvotes int not null default 0,
  net_score int not null default 0,
  comment_count int not null default 0,
  share_count int not null default 0,
  priority text not null default 'Medium',
  is_solved boolean not null default false,
  created_at timestamptz default now()
);

alter table public.posts enable row level security;

drop policy if exists "Posts viewable by everyone." on posts;
create policy "Posts viewable by everyone." on posts for select using (true);

drop policy if exists "Users can create posts." on posts;
create policy "Users can create posts." on posts for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can update posts." on posts;
create policy "Authors can update posts." on posts for update using (true);

drop policy if exists "Service role can delete posts." on posts;
create policy "Service role can delete posts." on posts for delete using (true);

-- Post Votes
create table if not exists public.post_votes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  vote_type text not null,
  primary key (post_id, user_id)
);

alter table public.post_votes enable row level security;

drop policy if exists "Votes viewable by everyone." on post_votes;
create policy "Votes viewable by everyone." on post_votes for select using (true);

drop policy if exists "Users can manage votes." on post_votes;
create policy "Users can manage votes." on post_votes for all using (auth.uid() = user_id);

-- Saved Posts
create table if not exists public.saved_posts (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.saved_posts enable row level security;

drop policy if exists "Users can manage saved posts." on saved_posts;
create policy "Users can manage saved posts." on saved_posts for all using (auth.uid() = user_id);

-- Reports
create table if not exists public.reported_posts (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.reported_posts enable row level security;

drop policy if exists "Reports viewable by everyone." on reported_posts;
create policy "Reports viewable by everyone." on reported_posts for select using (true);

drop policy if exists "Users can create reports." on reported_posts;
create policy "Users can create reports." on reported_posts for insert with check (auth.uid() = user_id);

-- Comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  author_name text not null,
  author_role text not null,
  content text not null,
  parent_id uuid references public.comments(id),
  upvotes int not null default 0,
  downvotes int not null default 0,
  is_edited boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table public.comments enable row level security;

drop policy if exists "Comments viewable by everyone." on comments;
create policy "Comments viewable by everyone." on comments for select using (true);

drop policy if exists "Users can create comments." on comments;
create policy "Users can create comments." on comments for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can update comments." on comments;
create policy "Authors can update comments." on comments for update using (true);

-- Comment Votes
create table if not exists public.comment_votes (
  comment_id uuid references public.comments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  vote_type text not null,
  primary key (comment_id, user_id)
);

alter table public.comment_votes enable row level security;

drop policy if exists "Comment votes viewable by everyone." on comment_votes;
create policy "Comment votes viewable by everyone." on comment_votes for select using (true);

drop policy if exists "Users can manage comment votes." on comment_votes;
create policy "Users can manage comment votes." on comment_votes for all using (auth.uid() = user_id);

-- Reports Table
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  post_title text not null,
  reported_by_user_id uuid references public.profiles(id),
  reported_by_user_name text not null,
  reason text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

drop policy if exists "Anyone can view reports." on reports;
create policy "Anyone can view reports." on reports for select using (true);

drop policy if exists "Users can create reports." on reports;
create policy "Users can create reports." on reports for insert with check (true);

drop policy if exists "Admins can update reports." on reports;
create policy "Admins can update reports." on reports for update using (true);
`

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

async function runMigration() {
  console.log('Running database migration...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    await client.query(schema);
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
