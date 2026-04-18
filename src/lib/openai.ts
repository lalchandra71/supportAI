import OpenAI from 'openai';

export const RAG_CONFIG = {
  matchCount: 3,
  maxContextChars: 800,
  maxHistory: 1,
};

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY env variable is missing');
  }
  
  if (!apiKey.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY format is invalid. Should start with sk-');
  }
  
  console.log('OpenAI API Key loaded, starting with:', apiKey.substring(0, 15));
  
  if (!_openai) {
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function createChatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 150,
  });
  
  return response.choices[0].message.content || '';
}