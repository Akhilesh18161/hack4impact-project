import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

const schema = `
drop policy if exists "Authors can delete comments." on comments;
create policy "Authors can delete comments." on comments for delete using (true);
`;

async function runMigration() {
  console.log('Running database migration for comment deletion policy...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    await client.query(schema);
    console.log('Policy added successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
