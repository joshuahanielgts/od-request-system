// This script creates the required user accounts
// Run this manually after the authentication system is set up

import { supabase } from '@/integrations/supabase/client';

const users = [
  {
    email: 'jj9568@odms.local',
    password: 'jj9568',
    userData: {
      role: 'student',
      full_name: 'Student JJ9568',
      registration_number: 'jj9568'
    }
  },
  {
    email: 'hod@srm',
    password: 'hod@srm',
    userData: {
      role: 'hod',
      full_name: 'Head of Department',
      registration_number: undefined
    }
  },
  {
    email: 'fcse@srm',
    password: 'fcse@srm',
    userData: {
      role: 'faculty',
      full_name: 'Faculty CSE',
      registration_number: undefined
    }
  }
];

export const createTestUsers = async () => {
  console.log('Creating test users...');
  
  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.userData,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
      } else {
        console.log(`User ${user.email} created successfully`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
  
  console.log('Test user creation completed');
};

// To use this script, import and call createTestUsers() from the browser console
// or temporarily add it to a component
console.log('Test user creation script loaded. Call createTestUsers() to create users.');