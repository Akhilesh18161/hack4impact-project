import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    const userId = '95acca12-d9be-4f8f-829f-c8459571dc53'; // Ansh Yadav

    // Insert post
    const res = await client.query(`
      INSERT INTO public.posts (author_id, author_name, author_role, title, description, categories)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      userId,
      'Ansh Yadav',
      'community_user',
      'Test Post from DB Script',
      'This is a test description',
      ['Environment']
    ]);
    
    console.log('Successfully inserted post:', res.rows[0].id);

  } catch (error) {
    console.error('Error inserting post:', error.message);
  } finally {
    await client.end();
  }
}

run();
