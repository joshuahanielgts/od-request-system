import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      'https://ectnxobligjctxgzgwvc.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting to create test users...');

    // Test users data
    const testUsers = [
      {
        email: 'student@test.com',
        password: 'password123',
        profile: {
          registration_number: 'RA2111003010001',
          role: 'student',
          department: 'CSE',
          section: 'A'
        }
      },
      {
        email: 'hod@test.com',
        password: 'password123',
        profile: {
          registration_number: 'HOD001',
          role: 'hod',
          department: 'CSE',
          section: null
        }
      },
      {
        email: 'faculty@test.com',
        password: 'password123',
        profile: {
          registration_number: 'FAC001',
          role: 'faculty',
          department: 'CSE',
          section: 'A'
        }
      }
    ];

    const results = [];

    for (const userData of testUsers) {
      try {
        console.log(`Creating user: ${userData.email}`);

        // Create the user with auto-confirmation
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true // Auto-confirm the email
        });

        if (authError) {
          console.error(`Auth error for ${userData.email}:`, authError);
          results.push({
            email: userData.email,
            success: false,
            error: authError.message
          });
          continue;
        }

        if (!authData.user) {
          console.error(`No user data returned for ${userData.email}`);
          results.push({
            email: userData.email,
            success: false,
            error: 'No user data returned'
          });
          continue;
        }

        console.log(`User created successfully: ${userData.email}, ID: ${authData.user.id}`);

        // Create the profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            registration_number: userData.profile.registration_number,
            role: userData.profile.role,
            department: userData.profile.department,
            section: userData.profile.section
          });

        if (profileError) {
          console.error(`Profile error for ${userData.email}:`, profileError);
          results.push({
            email: userData.email,
            success: false,
            error: `Profile creation failed: ${profileError.message}`
          });
          continue;
        }

        console.log(`Profile created successfully for: ${userData.email}`);

        results.push({
          email: userData.email,
          success: true,
          userId: authData.user.id,
          role: userData.profile.role
        });

      } catch (error) {
        console.error(`Unexpected error for ${userData.email}:`, error);
        results.push({
          email: userData.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed: ${successCount}/${testUsers.length} users created successfully`);

    return new Response(
      JSON.stringify({
        message: `Test users creation completed: ${successCount}/${testUsers.length} successful`,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});