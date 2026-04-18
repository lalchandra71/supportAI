import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkRls() {
  // Get all policies on documents
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'documents');

  console.log('Policies on documents:', JSON.stringify(policies, null, 2));

  // Check RLS status
  const { data: rel } = await supabase
    .from('pg_class')
    .select('relrowsecurity')
    .eq('relname', 'documents')
    .single();

  console.log('RLS enabled:', rel?.relrowsecurity);
}

checkRls().catch(console.error);
