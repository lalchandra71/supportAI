import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  if (!supabase) return [];
  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function deleteDocument(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function matchDocuments(
  embedding: number[],
  matchCount: number = 5
): Promise<{ content: string; document_id: string; title: string }[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) throw error;
  return data || [];
}

export async function getConversations(userId?: string): Promise<Conversation[]> {
  if (!supabase) return [];
  let query = supabase
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
  if (!supabase) return '';
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, message, response, sources })
    .select()
    .single();
  
  if (error) throw error;
  return data.id;
}

export async function resolveConversation(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
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
  if (!supabase) return { totalConversations: 0, conversationsToday: 0, unresolved: 0, resolvedCount: 0 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let baseQuery = supabase.from('conversations').select('*', { count: 'exact', head: true });
  if (userId) {
    baseQuery = baseQuery.eq('user_id', userId);
  }

  const { count: totalConversations } = await baseQuery;
  
  const todayQuery = supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
  if (userId) {
    todayQuery.eq('user_id', userId);
  }
  const { count: conversationsToday } = await todayQuery;

  const unresolvedQuery = supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false);
  if (userId) {
    unresolvedQuery.eq('user_id', userId);
  }
  const { count: unresolved } = await unresolvedQuery;

  const resolvedQuery = supabase
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