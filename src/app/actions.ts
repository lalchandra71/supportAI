'use server';

import { revalidatePath } from 'next/cache';
import { supabase, getDocuments, deleteDocument as deleteDoc, matchDocuments, getConversations, addConversation, getDashboardStats } from '@/lib/supabase';
import { createEmbedding, createChatCompletion } from '@/lib/openai';

export async function uploadDocument(
  content: string,
  title: string,
  userId?: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    if (!content.trim()) {
      return { success: false, error: 'Content cannot be empty' };
    }

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    let embedding: number[] | null = null;
    let embeddingError: string | null = null;
    
    try {
      embedding = await createEmbedding(content);
    } catch (err) {
      console.error('Embedding error:', err);
      embeddingError = String(err);
    }

    const { data, error: docError } = await supabase
      .from('documents')
      .insert({ 
        title, 
        content, 
        embedding: embedding,
        user_id: userId || null
      })
      .select()
      .single();
    
    if (docError) throw docError;
    
    revalidatePath('/');
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: 'Failed to upload document' };
  }
}

export async function getDocumentList(userId?: string) {
  try {
    return await getDocuments(userId);
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}

export async function deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: 'Failed to delete document' };
  }
}

export async function updateDocument(
  id: string,
  title: string,
  content: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!content.trim()) {
      return { success: false, error: 'Content cannot be empty' };
    }

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    // First delete the old embedding
    await deleteDoc(id);

    // Create new embedding
    let embedding: number[] | null = null;
    let embeddingError: string | null = null;
    
    try {
      embedding = await createEmbedding(content);
    } catch (err) {
      console.error('Embedding error:', err);
      embeddingError = String(err);
    }

    // Insert updated document with new embedding
    const { error: docError } = await supabase
      .from('documents')
      .insert({ 
        title, 
        content, 
        embedding: embedding,
        user_id: userId || null
      });
    
    if (embeddingError && docError) {
      return { success: false, error: 'Document saved but embedding failed: ' + embeddingError };
    }
    
    if (docError) throw docError;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating document:', error);
    return { success: false, error: 'Failed to update document' };
  }
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(
  message: string,
  history: Message[],
  userId?: string
): Promise<{ response: string; sources: string[]; error?: string }> {
  try {
    let embedding: number[];
    let matches: { content: string; document_id: string; title: string }[];
    
    try {
      embedding = await createEmbedding(message);
      matches = await matchDocuments(embedding, 3);
    } catch {
      return { 
        response: 'AI service not configured. Please set OPENAI_API_KEY.', 
        sources: [],
        error: 'AI not configured'
      };
    }

    if (matches.length === 0) {
      const fallbackResponse = "I don't have any documents to answer this. Please add documents first.";
      
      if (supabase && userId) {
        await addConversation(userId, message, fallbackResponse, []);
      }
      
      return { response: fallbackResponse, sources: [] };
    }

    const MAX_CONTEXT = 500;
    const context = matches
      .slice(0, 2)
      .map(m => `Doc: ${m.title}\n${m.content.slice(0, MAX_CONTEXT)}`)
      .join('\n\n');

    const sources = [...new Set(matches.map(m => m.title))];

    const systemMessage = `You are a helpful AI support assistant. Answer briefly using this context:\n${context}`;

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...history.slice(-2).map(h => ({ role: h.role, content: h.content.slice(0, 200) })),
      { role: 'user' as const, content: message },
    ];

    let response: string;
    try {
      response = await createChatCompletion(messages);
    } catch {
      return { 
        response: 'AI service not configured. Please set OPENAI_API_KEY.', 
        sources: [],
        error: 'AI not configured'
      };
    }

    if (supabase && userId) {
      await addConversation(userId, message, response, sources);
    }

    revalidatePath('/admin');
    return { response, sources };
  } catch (error) {
    console.error('Error sending message:', error);
    return { 
      response: '', 
      sources: [],
      error: 'Failed to get response. Please check your API keys.'
    };
  }
}

export async function getConversationList(userId?: string) {
  try {
    return await getConversations(userId);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

export async function getStats(userId?: string) {
  try {
    return await getDashboardStats(userId);
  } catch (error) {
    console.error('Error getting stats:', error);
    return { totalConversations: 0, conversationsToday: 0, unresolved: 0, resolvedCount: 0 };
  }
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  created_at: string;
}

export interface Stats {
  totalConversations: number;
  conversationsToday: number;
  unresolved: number;
  resolvedCount: number;
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

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const passwordHash = btoa(password);

    const { data: existing } = await supabase
      .from('supportai_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    const { data, error } = await supabase
      .from('supportai_users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        plan: 'free'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        plan: data.plan,
        created_at: data.created_at
      }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const passwordHash = btoa(password);

    const { data, error } = await supabase
      .from('supportai_users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid email or password' };
    }

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        plan: data.plan,
        created_at: data.created_at
      }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export async function updateUserProfile(
  userId: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const { error: updateError } = await supabase
      .from('supportai_users')
      .update({ full_name: fullName })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function updateUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const currentHash = btoa(currentPassword);
    const { data: user, error: userError } = await supabase
      .from('supportai_users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password_hash !== currentHash) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const newHash = btoa(newPassword);
    const { error: updateError } = await supabase
      .from('supportai_users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}