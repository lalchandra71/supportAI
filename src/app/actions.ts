'use server';

import { revalidatePath } from 'next/cache';
import { supabase, supabaseAdmin, getDocuments, deleteDocument as deleteDoc, matchDocuments, getConversations, addConversation, getDashboardStats, getWidgetSettings, saveWidgetSettings } from '@/lib/supabase';
import { createEmbedding, createChatCompletion, RAG_CONFIG } from '@/lib/openai';
import crypto from 'crypto';

export interface Plan {
  name: string;
  price: number | null;
  interval: string;
  display_order: number;
  is_enterprise: boolean;
  description: string;
  features: string[];
}

export async function getPlans(): Promise<Plan[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('supportai_plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting plans:', error);
    return [];
  }
}

export async function uploadDocument(
  content: string,
  title: string,
  userId?: string,
  folderId?: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    console.log('uploadDocument START — userId:', userId, 'type:', typeof userId);
    if (!content.trim()) {
      return { success: false, error: 'Content cannot be empty' };
    }

    if (!supabaseAdmin) {
      console.error('supabaseAdmin is not initialized');
      return { success: false, error: 'Database not configured' };
    }

    let embedding: number[] | null = null;
    let embeddingError: string | null = null;

    try {
      console.log('Creating embedding for:', title);
      embedding = await createEmbedding(content);
      console.log('Embedding created, dims:', embedding?.length);
    } catch (err) {
      console.error('Embedding error:', err);
      embeddingError = String(err);
    }

    const insertPayload: Record<string, unknown> = {
      title,
      content,
      embedding: embedding,
      user_id: userId || null
    };

    if (folderId && folderId !== 'none') {
      insertPayload.folder_id = folderId;
    }
    console.log('Insert payload user_id:', insertPayload.user_id);

    if (!supabaseAdmin) {
      console.error('supabaseAdmin is not initialized');
      return { success: false, error: 'Database not configured' };
    }

    const { data, error: docError } = await supabaseAdmin
      .from('documents')
      .insert(insertPayload)
      .select()
      .single();

    if (docError) {
      console.error('Supabase insert error:', docError);
      throw docError;
    }

    console.log('Document inserted:', data.id);
    revalidatePath('/admin');
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error uploading document:', error);
    const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
    return { success: false, error: 'Failed to upload document: ' + errMsg };
  }
}

export async function getDocumentList(userId?: string) {
  try {
    // If userId provided, show only user's documents.
    // If no userId (demo mode), show only demo documents (user_id IS NULL)
    return await getDocuments(userId);
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}

export async function deleteDocument(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    // Verify ownership before deleting
    const { data: doc, error: fetchErr } = await supabase
      .from('documents')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !doc) {
      return { success: false, error: 'Document not found or unauthorized' };
    }

    await deleteDoc(id);
    revalidatePath('/admin');
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
  userId?: string,
  folderId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!content.trim()) {
      return { success: false, error: 'Content cannot be empty' };
    }

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Create new embedding
    let embedding: number[] | null = null;
    let embeddingError: string | null = null;

    try {
      embedding = await createEmbedding(content);
    } catch (err) {
      console.error('Embedding error:', err);
      embeddingError = String(err);
    }

    // Update document with new embedding
    const updatePayload: Record<string, unknown> = {
      title,
      content,
      embedding: embedding
    };

    if (folderId && folderId !== 'none') {
      updatePayload.folder_id = folderId;
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Database not configured' };
    }

    const { error: docError } = await supabaseAdmin
      .from('documents')
      .update(updatePayload)
      .eq('id', id);

    if (embeddingError && docError) {
      return { success: false, error: 'Document saved but embedding failed: ' + embeddingError };
    }

    if (docError) throw docError;

    revalidatePath('/admin');
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
      console.log('Embedding created, dims:', embedding?.length);
      matches = await matchDocuments(embedding, RAG_CONFIG.matchCount, userId);
      console.log('Matched documents:', matches?.length, matches?.map(m => m.title));
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

    const context = matches
      .slice(0, 2)
      .map(m => `Doc: ${m.title}\n${m.content.slice(0, RAG_CONFIG.maxContextChars)}`)
      .join('\n\n');

    console.log('Context built:', context.substring(0, 300));

    const sources = [...new Set(matches.map(m => m.title))];

    const systemMessage = `You are a helpful AI support assistant. Read the context below and answer the user's question in your own words. Summarize and explain the answer naturally - don't just repeat the text verbatim. If the question cannot be answered from the context, say you don't have that information.\n\nContext:\n${context}`;

    console.log('System message:', systemMessage.substring(0, 400));

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...history.slice(-RAG_CONFIG.maxHistory).map(h => ({ role: h.role, content: h.content.slice(0, 200) })),
      { role: 'user' as const, content: message },
    ];

    let response: string;
    try {
      response = await createChatCompletion(messages);
      console.log('Chat completion response:', response);
    } catch (chatErr) {
      console.error('Chat completion error:', chatErr);
      return { 
        response: 'AI service error. Please check API keys.', 
        sources: [],
        error: 'AI service error'
      };
    }

    if (supabase && userId) {
      try {
        await addConversation(userId, message, response, sources);
      } catch (convErr) {
        console.error('Failed to save conversation:', convErr);
      }
    }

    revalidatePath('/admin');
    return { response, sources };
  } catch (error) {
    console.error('Error sending message:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return { 
      response: '', 
      sources: [],
      error: 'Failed to get response: ' + errMsg
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

// Forgot Password: Generate reset token and log link (dev)
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string; resetUrl?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('supportai_users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Email not found — inform the user
      console.log('User not found for email:', email);
      return { success: false, error: 'No account found with that email address' };
    }

    console.log('Found user:', user.id);

    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    console.log('Updating user with reset token:', { userId: user.id, token, expiresAt });

    // Save token to user record
    const { error: updateError } = await supabase
      .from('supportai_users')
      .update({
        reset_token: token,
        reset_token_expires_at: expiresAt,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      throw updateError;
    }

    // Generate the reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log(`🔑 Password reset link for ${email}: ${resetUrl}`);

    return { success: true, resetUrl };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, error: 'Failed to process request' };
  }
}

// Reset Password: Validate token and update password
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    if (!token.trim() || !newPassword.trim()) {
      return { success: false, error: 'Token and password are required' };
    }

    // Check token validity: token exists and not expired
    const now = new Date().toISOString();
    const { data: user, error: userError } = await supabase
      .from('supportai_users')
      .select('id')
      .eq('reset_token', token)
      .gt('reset_token_expires_at', now) // expiry > now
      .single();

    if (userError || !user) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    // Update password and clear token
    const newPasswordHash = btoa(newPassword);
    const { error: updateError } = await supabase
      .from('supportai_users')
      .update({
        password_hash: newPasswordHash,
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Failed to reset password' };
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

// Upgrade Plan: Update user's subscription plan
export async function updateUserPlan(
  userId: string,
  newPlan: 'free' | 'basic' | 'pro' | 'enterprise'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!validPlans.includes(newPlan)) {
      return { success: false, error: 'Invalid plan selected' };
    }

    const { error } = await supabase
      .from('supportai_users')
      .update({ plan: newPlan })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    console.error('Update plan error:', error);
    return { success: false, error: 'Failed to update plan' };
  }
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export async function getFolders(userId?: string): Promise<Folder[]> {
  try {
    if (!supabase) return [];

    let query = supabase.from('folders').select('*').order('name', { ascending: true });
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting folders:', error);
    return [];
  }
}

export async function createFolder(name: string, color: string, userId: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({ name, color, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/upload');
    revalidatePath('/chat');

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

export async function deleteFolder(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    revalidatePath('/upload');
    revalidatePath('/chat');

    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    return { success: false, error: 'Failed to delete folder' };
  }
}

export async function updateDocumentFolder(docId: string, folderId: string | null, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    const { error } = await supabase
      .from('documents')
      .update({ folder_id: folderId || null })
      .eq('id', docId)
      .eq('user_id', userId);

    if (error) throw error;

    revalidatePath('/upload');
    revalidatePath('/chat');

    return { success: true };
  } catch (error) {
    console.error('Error updating document folder:', error);
    return { success: false, error: 'Failed to update folder' };
  }
}

export async function getWidgetSettingsAction(userId: string) {
  try {
    const settings = await getWidgetSettings(userId);
    return { success: true, settings };
  } catch (error) {
    console.error('Error getting widget settings:', error);
    return { success: false, error: 'Failed to get settings' };
  }
}

export async function saveWidgetSettingsAction(
  userId: string,
  companyName: string,
  primaryColor: string,
  messageTextColor: string,
  logoColor: string,
  position: string
) {
  try {
    const result = await saveWidgetSettings(userId, {
      company_name: companyName,
      primary_color: primaryColor,
      message_text_color: messageTextColor,
      logo_color: logoColor,
      position: position,
    });
    return result;
  } catch (error) {
    console.error('Error saving widget settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}