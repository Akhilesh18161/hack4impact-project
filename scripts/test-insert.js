import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wwfmaidiemmakudrxrbk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Zm1haWRpZW1tYWt1ZHJ4cmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzAwNTYsImV4cCI6MjA5NjkwNjA1Nn0.U2PGlPvxFKIQuljtk_huVd7Fa6f_9IZF7Sr_PbMxVy4'
);

async function test() {
  // 1. Sign in
  console.log('Signing in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ky4689135@gmail.com',
    password: 'user123', // I don't know the password actually.
  });

  if (authError) {
    console.log('Auth Error:', authError.message);
    // Let's use service key to simulate instead
  } else {
    console.log('Signed in as:', authData.user.id);
  }
}

test();
