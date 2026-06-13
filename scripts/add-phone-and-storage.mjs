import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwfmaidiemmakudrxrbk.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Zm1haWRpZW1tYWt1ZHJ4cmJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMzMDA1NiwiZXhwIjoyMDk2OTA2MDU2fQ.sOeQH2737QnThpJsdwIOko0S1cakBLOt1re0YTSGkfY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
  console.log('Adding phone column...')
  const { error: sqlError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;`
  })
  
  if (sqlError) {
    console.log('Fallback to direct pg connection since exec_sql is not available.')
    import('pg').then(async (pg) => {
      const client = new pg.Client({ connectionString: 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres' })
      await client.connect()
      await client.query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;`)
      await client.end()
      console.log('Added phone column.')
      await setupStorage()
    })
  } else {
    await setupStorage()
  }
}

async function setupStorage() {
  console.log('Setting up storage bucket for avatars...')
  const { data, error } = await supabase.storage.getBucket('avatars')
  if (error && error.message.includes('not found')) {
    const { error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })
    if (createError) console.error('Failed to create bucket:', createError)
    else console.log('Created avatars bucket.')
  } else if (error) {
    console.error('Error checking bucket:', error)
  } else {
    console.log('Avatars bucket already exists.')
  }
  process.exit(0)
}

run().catch(console.error)
