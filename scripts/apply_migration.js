import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const sql = fs.readFileSync('supabase/migrations/20250417_update_match_documents.sql', 'utf8');

  // Supabase doesn't have a direct "execute arbitrary SQL" RPC by default.
  // We'll use the Postgres REST API via supabase-js: use .rpc with a helper function?
  // Instead, split statements and execute via fetch to Supabase's SQL endpoint.
  
  console.log('Applying migration: update_match_documents');
  
  // Use Supabase's REST API to run raw SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (response.ok) {
    console.log('✅ Migration applied successfully');
  } else {
    const err = await response.text();
    console.error('❌ Migration failed:', response.status, err);
  }
}

runMigration().catch(console.error);
