import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

const schema = `
-- Update posts
alter table public.posts 
add column if not exists status text default 'Submitted',
add column if not exists verification_status text default 'Pending Review',
add column if not exists verified_by uuid references public.profiles(id) on delete set null,
add column if not exists verification_date timestamptz,
add column if not exists edit_history jsonb default '[]'::jsonb,
add column if not exists is_deleted boolean default false,
add column if not exists deletion_reason text,
add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
add column if not exists deleted_at timestamptz;

-- Update pulse_reports
alter table public.pulse_reports
add column if not exists verification_status text default 'Pending Review',
add column if not exists verified_by uuid references public.profiles(id) on delete set null,
add column if not exists verification_date timestamptz,
add column if not exists edit_history jsonb default '[]'::jsonb,
add column if not exists is_deleted boolean default false,
add column if not exists deletion_reason text,
add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
add column if not exists deleted_at timestamptz;

-- Create content_requests
create table if not exists public.content_requests (
  id uuid primary key default gen_random_uuid(),
  content_id text not null,
  content_type text not null,
  request_type text not null,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  requested_changes jsonb,
  reason text not null,
  status text default 'Pending' not null,
  admin_notes text
);

alter table public.content_requests enable row level security;
drop policy if exists "Users can view their own requests." on content_requests;
create policy "Users can view their own requests." on content_requests for select using (true);
drop policy if exists "Users can insert requests." on content_requests;
create policy "Users can insert requests." on content_requests for insert with check (true);
drop policy if exists "Admins can update requests." on content_requests;
create policy "Admins can update requests." on content_requests for update using (true);

-- Create notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  created_at timestamptz default now() not null,
  is_read boolean default false not null,
  link text
);

alter table public.notifications enable row level security;
drop policy if exists "Users can view their own notifications." on notifications;
create policy "Users can view their own notifications." on notifications for select using (true);
drop policy if exists "System can insert notifications." on notifications;
create policy "System can insert notifications." on notifications for insert with check (true);
drop policy if exists "Users can update their notifications." on notifications;
create policy "Users can update their notifications." on notifications for update using (true);
`;

async function runMigration() {
  console.log('Running moderation schema migration...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    await client.query(schema);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
