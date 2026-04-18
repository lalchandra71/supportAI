import { NextRequest, NextResponse } from 'next/server';
import { supabase, matchDocuments, addConversation } from '@/lib/supabase';
import { createEmbedding, createChatCompletion, RAG_CONFIG } from '@/lib/openai';

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
      matches = await matchDocuments(embedding, RAG_CONFIG.matchCount);
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
      .slice(0, 2)
      .map(m => `Document: ${m.title}\nContent: ${m.content.slice(0, RAG_CONFIG.maxContextChars)}`)
      .join('\n\n');

    const sources = [...new Set(matches.map(m => m.title))];

    const systemMessage = `You are a helpful AI support assistant. Read the context below and answer the user's question in your own words. Summarize and explain the answer naturally - don't just repeat the text verbatim. If the question cannot be answered from the context, say you don't have that information.\n\nContext:\n${context}`;

    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...(history || []).slice(-RAG_CONFIG.maxHistory).map((h: { role: string; content: string }) => ({ role: h.role as 'user' | 'assistant', content: h.content.slice(0, 200) })),
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