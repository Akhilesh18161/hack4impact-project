import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Check profiles
    const profiles = await client.query('SELECT * FROM public.profiles');
    console.log('PROFILES:', profiles.rows);

    // Check posts
    const posts = await client.query('SELECT id, author_id, title FROM public.posts');
    console.log('POSTS:', posts.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
