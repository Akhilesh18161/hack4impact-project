const { Client } = require('pg');

const run = async () => {
  const connectionStrings = [
    'postgresql://postgres.wwfmaidiemmakudrxrbk:Akhilesh%40911@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.wwfmaidiemmakudrxrbk:Akhilesh%40911@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres'
  ];

  for (const connectionString of connectionStrings) {
    console.log('Trying:', connectionString.split('@')[1]);
    const client = new Client({ connectionString });
    try {
      await client.connect();
      console.log('Connected to', connectionString.split('@')[1]);
      
      const res = await client.query('SELECT current_database();');
      console.log('Database:', res.rows[0].current_database);
      
      await client.end();
      return;
    } catch (err) {
      console.log('Failed:', err.message);
    }
  }
  console.log('All connection attempts failed.');
};

run();
