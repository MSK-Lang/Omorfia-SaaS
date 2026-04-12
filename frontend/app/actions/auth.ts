'use server';

import { createClient } from '@supabase/supabase-js';

export async function createOrganization(clinicName: string, ownerId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  // Use service role key to bypass RLS when creating the organization during onboarding
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabaseAdmin
    .from('organizations')
    .insert({ 
      name: clinicName,
      owner_id: ownerId 
    })
    .select()
    .single();

  if (error) {
    console.error('Server action organization creation error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
