import { NextRequest, NextResponse } from 'next/server';
import { supabase, matchDocuments, addConversation } from '@/lib/supabase';
import { createEmbedding, createChatCompletion } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { message, history, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let embedding: number[];
    let matches: { content: string; document_id: string; title: string }[];
    
    try {
      embedding = await createEmbedding(message);
      matches = await matchDocuments(embedding, 5);
    } catch {
      return NextResponse.json({ 
        response: 'AI service not configured', 
        sources: [],
        error: 'AI not configured'
      });
    }

    if (matches.length === 0) {
      const fallbackResponse = "I don't have any documents to answer this. Please add documents first.";
      
      if (userId) {
        await addConversation(userId, message, fallbackResponse, []);
      }
      
      return NextResponse.json({ response: fallbackResponse, sources: [] });
    }

    const context = matches
      .map(m => `Document: ${m.title}\nContent: ${m.content}`)
      .join('\n\n');

    const sources = [...new Set(matches.map(m => m.title))];

    const systemMessage = `You are a helpful AI support assistant. 
Use the following context from documents to answer the user's question.
If you cannot find the answer in the context, say so honestly.

Context:
${context}`;

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...(history || []).map((h: { role: string; content: string }) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ];

    const response = await createChatCompletion(messages);

    if (userId) {
      await addConversation(userId, message, response, sources);
    }

    return NextResponse.json({ response, sources });
  } catch (error) {
    console.error('Widget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}