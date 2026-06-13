// Adds `username` column to profiles, backfills existing users, adds UNIQUE constraint
// Usage: node scripts/add-username.mjs

import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://postgres:Akhilesh%40911@db.wwfmaidiemmakudrxrbk.supabase.co:5432/postgres'

function slugify(str) {
  return (str || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // keep only letters and numbers
    .slice(0, 12) || 'user'
}

function randomSuffix() {
  return String(Math.floor(100 + Math.random() * 900)) // 3-digit number 100-999
}

async function run() {
  const client = new Client({ connectionString })
  await client.connect()
  console.log('Connected to database.')

  // ── Step 1: Add column + unique constraint (idempotent) ──────────────────
  console.log('\nStep 1: Adding username column and unique index...')
  await client.query(`
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS username text;
  `)
  // Unique index (non-blocking, skips if already exists)
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
      ON public.profiles (username);
  `)
  console.log('  ✓ Column and unique index ready.')

  // ── Step 2: Fetch all profiles that need a username ───────────────────────
  console.log('\nStep 2: Fetching profiles...')
  const { rows: profiles } = await client.query(
    `SELECT id, full_name, username FROM public.profiles`
  )
  console.log(`  Found ${profiles.length} profiles.`)

  // Collect already-taken usernames to avoid collisions in the same batch
  const taken = new Set(profiles.map(p => p.username).filter(Boolean))

  // ── Step 3: Backfill ─────────────────────────────────────────────────────
  console.log('\nStep 3: Backfilling missing usernames...')
  let updated = 0
  for (const profile of profiles) {
    if (profile.username) {
      console.log(`  ✓ ${profile.full_name} → already has @${profile.username}`)
      continue
    }

    const firstName = (profile.full_name || '').split(' ')[0]
    const base = slugify(firstName)
    let candidate = `${base}${randomSuffix()}`
    while (taken.has(candidate)) {
      candidate = `${base}${randomSuffix()}`
    }
    taken.add(candidate)

    await client.query(
      `UPDATE public.profiles SET username = $1 WHERE id = $2`,
      [candidate, profile.id]
    )
    console.log(`  ✓ ${profile.full_name} → assigned @${candidate}`)
    updated++
  }

  // ── Step 4: Summary ──────────────────────────────────────────────────────
  console.log(`\nDone! ${updated} username(s) assigned, ${profiles.length - updated} already had one.`)
  await client.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
