import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres';

const triggerSql = `
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'community_user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`;

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // 1. Create the trigger
    await client.query(triggerSql);
    console.log('Trigger created successfully!');

    // 2. Fix the missing profile for the user who already signed up
    const res = await client.query('SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = $1', ['ky4689135@gmail.com']);
    if (res.rows.length > 0) {
      const user = res.rows[0];
      const fullName = user.raw_user_meta_data?.full_name || 'Aayush';
      const role = user.raw_user_meta_data?.role || 'community_user';
      
      await client.query(`
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.email, fullName, role]);
      console.log('Fixed missing profile for ky4689135@gmail.com!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
