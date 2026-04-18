import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client (anon key) - used for read operations and demo mode
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client (service role) - used for server-side write operations that need to bypass RLS
export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

console.log('Supabase clients initialized:', {
  supabase: !!supabase,
  supabaseAdmin: !!supabaseAdmin,
  serviceKeyPresent: !!supabaseServiceKey
});

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  embedding: number[];
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  message: string;
  response: string;
  sources: string[];
  resolved: boolean;
  created_at: string;
}

export async function getDocuments(userId?: string): Promise<Document[]> {
  if (!supabaseAdmin) return [];

  let query = supabaseAdmin
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function deleteDocument(id: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');
  const { error } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function matchDocuments(
  embedding: number[],
  matchCount: number = 5,
  userId?: string
): Promise<{ content: string; document_id: string; title: string }[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: embedding,
    match_count: matchCount,
    p_user_id: userId || null,
  });

  if (error) throw error;
  return data || [];
}

export async function getConversations(userId?: string): Promise<Conversation[]> {
  if (!supabaseAdmin) return [];
  let query = supabaseAdmin
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addConversation(
  userId: string,
  message: string,
  response: string,
  sources: string[] = []
): Promise<string> {
  if (!supabaseAdmin) return '';
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ user_id: userId, message, response, sources })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function resolveConversation(id: string): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ resolved: true })
    .eq('id', id);

  if (error) throw error;
}

export async function getDashboardStats(userId?: string): Promise<{
  totalConversations: number;
  conversationsToday: number;
  unresolved: number;
  resolvedCount: number;
}> {
  if (!supabaseAdmin) return { totalConversations: 0, conversationsToday: 0, unresolved: 0, resolvedCount: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let baseQuery = supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true });
  if (userId) {
    baseQuery = baseQuery.eq('user_id', userId);
  }

  const { count: totalConversations } = await baseQuery;

  const todayQuery = supabaseAdmin
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
  if (userId) {
    todayQuery.eq('user_id', userId);
  }
  const { count: conversationsToday } = await todayQuery;

  const unresolvedQuery = supabaseAdmin
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false);
  if (userId) {
    unresolvedQuery.eq('user_id', userId);
  }
  const { count: unresolved } = await unresolvedQuery;

  const resolvedQuery = supabaseAdmin
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', true);
  if (userId) {
    resolvedQuery.eq('user_id', userId);
  }
  const { count: resolvedCount } = await resolvedQuery;

  return {
    totalConversations: totalConversations || 0,
    conversationsToday: conversationsToday || 0,
    unresolved: unresolved || 0,
    resolvedCount: resolvedCount || 0,
  };
}