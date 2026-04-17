import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConstraints() {
  console.log('Checking documents table constraints...\n');

  // Look for check constraints
  const { data: constraints, error } = await supabase
    .from('pg_catalog.pg_constraint')
    .select('conname, pg_get_constraintdef(oid)')
    .ilike('tablename', 'documents')
    .limit(10);

  if (error) {
    console.log('Error querying constraints:', error.message);
  } else {
    console.log('Constraints on documents:');
    constraints?.forEach(c => console.log(`  ${c.conname}: ${c.pg_get_constraintdef}`));
  }

  // Try to get table info via information_schema
  const { data: cols } = await supabase
    .from('information_schema.columns')
    .select('column_name, udt_name, array_dims')
    .eq('table_name', 'documents')
    .eq('table_schema', 'public');

  console.log('\nColumns:');
  cols?.forEach(c => console.log(`  ${c.column_name} (${c.udt_name}${c.array_dims ? '[]' : ''})`));
}

checkConstraints().catch(console.error);
