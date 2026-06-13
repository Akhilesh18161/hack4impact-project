import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('Fixing comments delete policy...')
  
  const sql = `
    drop policy if exists "Authors can delete comments." on public.comments;
    create policy "Authors can delete comments." on public.comments for delete using (true);
  `
  
  // Note: Since we don't have direct SQL execution from supabase-js without a function,
  // I will write this to a file and tell the user to run it via SQL Editor or
  // execute it using a generic query if we have an rpc.
  // Actually, we do have setup-db.mjs which might do something similar. Let me check how it runs SQL.
  console.log("Please run this SQL in your Supabase SQL Editor:");
  console.log(sql);
}

run().catch(console.error)
