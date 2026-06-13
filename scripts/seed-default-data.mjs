import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwfmaidiemmakudrxrbk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Zm1haWRpZW1tYWt1ZHJ4cmJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMzMDA1NiwiZXhwIjoyMDk2OTA2MDU2fQ.sOeQH2737QnThpJsdwIOko0S1cakBLOt1re0YTSGkfY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const SEED_REPORTS = [
  {
    id: 'PR-1042',
    title: 'Massive Pothole on Ring Road',
    description: 'There is a massive pothole spanning the entire left lane. Several cars have been damaged over the past two days.',
    category: 'Infrastructure',
    location: 'Ring Road South, near Koteshwor',
    priority: 'High',
    status: 'Implementation in Progress',
    date_submitted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 42,
    reporter_name: 'Anonymous Citizen',
    images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400'],
    admin_updates: [
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), message: 'Assessment complete. Crew dispatched.' }
    ]
  },
  {
    id: 'PR-1045',
    title: 'Streetlights out in Thamel',
    description: 'Entire block is completely dark. High risk of accidents and security concerns.',
    category: 'Water & Electricity',
    location: 'Thamel Marg',
    priority: 'Critical',
    status: 'Under Review',
    date_submitted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 18,
    reporter_name: 'Aayush',
  },
  {
    id: 'PR-1021',
    title: 'Illegal Dumping at Bagmati River Bank',
    description: 'A construction company is dumping debris into the river late at night.',
    category: 'Environmental',
    location: 'Bagmati Corridor',
    priority: 'High',
    status: 'Resolved',
    date_submitted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    date_resolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 85,
    reporter_name: 'EcoWarrior',
    resolution_summary: 'City authorities investigated and fined the responsible company. Site has been cleared and warning signs installed.',
    admin_updates: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), message: 'Investigation initiated.' },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), message: 'Perpetrators identified and fined. Cleanup scheduled.' }
    ],
    images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400']
  },
  {
    id: 'PR-1050',
    title: 'New cycling lane needed',
    description: 'Traffic is getting worse and cyclists have no safe route from Patan to Kathmandu.',
    category: 'Improvement Suggestion',
    location: 'Patan to Kathmandu Route',
    priority: 'Low',
    status: 'Assessment in Progress',
    date_submitted: new Date().toISOString(),
    confirmations: 120,
    reporter_name: 'UrbanCyclist',
  }
];

// Add a few default Community Posts to the 'posts' table
// We need a generic author_id. Let's see if we can find any user, or create one if we must.
// Or we can just let 'author_id' be null? The schema says: `author_id uuid references public.profiles(id) on delete cascade`
// If it's foreign key, we must use an existing profile ID. I'll fetch one.

async function seedData() {
  console.log('Seeding Pulse Reports...');
  
  // Upsert Pulse Reports
  const { error: pulseError } = await supabase
    .from('pulse_reports')
    .upsert(SEED_REPORTS, { onConflict: 'id' });
    
  if (pulseError) {
    console.error('Error inserting pulse reports:', pulseError);
  } else {
    console.log('Pulse reports seeded successfully!');
  }

  // Find a user for community posts
  const { data: users } = await supabase.from('profiles').select('id, full_name, role').limit(1);
  if (users && users.length > 0) {
    const user = users[0];
    console.log('Seeding Community Posts for user:', user.full_name);
    
    const SEED_POSTS = [
      {
        author_id: user.id,
        author_name: 'System Admin',
        author_role: 'admin',
        title: 'Welcome to the new Community Hub!',
        description: 'We have fully migrated our backend to Supabase. All posts, reports, and comments are now live and persistent across all your devices. Enjoy the new platform!',
        categories: ['Community Events', 'Other'],
        media_type: 'none',
        priority: 'High',
        comment_count: 0,
        upvotes: 5,
      },
      {
        author_id: user.id,
        author_name: 'System Admin',
        author_role: 'admin',
        title: 'Reminder: Use City Pulse for official reports',
        description: 'While you can discuss issues here in the Community Hub, please remember to use the City Pulse feature for official reports that require municipal action. Pulse reports are tracked by city administrators.',
        categories: ['Infrastructure', 'Public Safety'],
        media_type: 'none',
        priority: 'Medium',
        comment_count: 0,
        upvotes: 2,
      }
    ];

    const { error: postsError } = await supabase
      .from('posts')
      .insert(SEED_POSTS);

    if (postsError) {
      console.error('Error inserting community posts:', postsError);
    } else {
      console.log('Community posts seeded successfully!');
    }
  } else {
    console.log('No users found, skipping community posts seeding. Create an account first!');
  }
}

seedData();
