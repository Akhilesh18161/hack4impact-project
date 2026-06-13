import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

const schema = `
create table if not exists public.pulse_reports (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  other_category text,
  location text not null,
  map_lat float,
  map_lng float,
  priority text not null,
  status text not null,
  date_submitted timestamptz not null default now(),
  date_resolved timestamptz,
  confirmations int not null default 0,
  reporter_name text not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  images text[] default '{}',
  videos text[] default '{}',
  resolution_summary text,
  admin_updates jsonb default '[]'::jsonb
);

alter table public.pulse_reports enable row level security;

drop policy if exists "Pulse reports viewable by everyone." on pulse_reports;
create policy "Pulse reports viewable by everyone." on pulse_reports for select using (true);

drop policy if exists "Users can insert pulse reports." on pulse_reports;
-- Anyone can insert for now, because it allows anonymous reporting based on current logic
create policy "Users can insert pulse reports." on pulse_reports for insert with check (true);

drop policy if exists "Admins can update pulse reports." on pulse_reports;
-- Currently any authenticated user can upvote or admins can update status. 
create policy "Admins can update pulse reports." on pulse_reports for update using (true);
`;

async function runMigration() {
  console.log('Creating pulse_reports table...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    await client.query(schema);
    console.log('Table created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
