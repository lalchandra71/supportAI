# SupportAI - AI-Powered Customer Support Agent

A SaaS platform that uses RAG (Retrieval-Augmented Generation) to answer customer questions using your own documents and knowledge base.

## What is SupportAI?

SupportAI is an AI-powered customer support agent that learns from your documents (PDFs, text, help center content) and answers customer questions instantly. It reduces support tickets by 80% by providing accurate, context-aware responses.

## How RAG Works

SupportAI uses **Retrieval-Augmented Generation (RAG)** to provide accurate answers:

```
User Question → Embed → Vector Search → Relevant Documents → GPT-4o-mini → Answer + Sources
```

### Step-by-Step RAG Pipeline

1. **Document Ingestion**
   - User uploads documents (PDFs, text)
   - Content is chunked into smaller pieces
   - Each chunk is converted to an embedding vector using OpenAI's text-embedding-3-small

2. **Storage**
   - Embeddings are stored in Supabase (PostgreSQL with pgvector)
   - Original content is stored alongside embeddings
   - User ownership is tracked for multi-tenant isolation

3. **Query Processing**
   - User asks a question
   - Question is converted to an embedding vector
   - Vector similarity search finds the most relevant document chunks

4. **Answer Generation**
   - Retrieved context is passed to GPT-4o-mini
   - Model generates a natural language answer
   - Sources are cited in the response)

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js 14 (App Router), React 19, Tailwind CSS |
| AI | OpenAI GPT-4o-mini, text-embedding-3-small |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth / localStorage (demo) |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx         # Sign in/up
│   ├── demo/page.tsx          # Live demo chatbot
│   ├── pricing/page.tsx        # Pricing plans
│   ├── privacy/page.tsx       # Privacy policy
│   ├── terms/page.tsx        # Terms of service
│   ├── contact/page.tsx      # Contact form
│   ├── admin/page.tsx         # Dashboard (protected)
│   ├── upload/page.tsx        # Document upload
│   ├── chat/page.tsx          # Chat interface
│   ├── setup/page.tsx        # Widget setup
│   ├── settings/page.tsx      # Settings
│   └── actions.ts            # Server actions (RAG logic)
├── lib/
│   ├── supabase.ts          # Supabase client & queries
│   └── openai.ts           # OpenAI client
└── globals.css             # Tailwind + custom variables
```

## Pages Overview

### Public Pages (No Login Required)

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with hero, demo CTA |
| Demo | `/demo` | Live demo chatbot (preloaded knowledge) |
| Pricing | `/pricing` | Free / Pro / Enterprise plans |
| Login | `/login` | Sign in or sign up |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| Contact | `/contact` | Contact form |

### Protected Pages (After Login)

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | Stats, quick actions |
| Upload | `/upload` | Add documents to knowledge base |
| Chat | `/chat` | Test the AI |
| Conversations | `/admin/conversations` | View all chats |
| Widget | `/setup` | Get embed code |
| Settings | `/settings` | Configure widget, API keys |

## Setup

### 1. Environment Variables

Create `.env.local`:

```bash
# OpenAI (required for AI features)
OPENAI_API_KEY=sk-...

# Supabase (required for storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Database Setup

Run in Supabase SQL Editor:

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with embedding storage
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create embedding index (cosine distance)
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);

-- Create match_documents function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (content text, document_id uuid, title text, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.content,
    d.id,
    d.title,
    1 - (d.embedding <=> query_embedding) as similarity
  FROM documents d
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Document Upload**: Paste text or upload PDFs
- **Vector Search**: Semantic similarity matching
- **Chat Interface**: Test the AI with your documents
- **Widget Embed**: Copy-paste code to your website
- **Analytics**: Track conversations and resolution rate
- **Multi-tenant**: Users have isolated knowledge bases

## API Keys Needed

| Service | Key | Purpose |
|---------|-----|---------|
| OpenAI | `OPENAI_API_KEY` | Embeddings + GPT-4o |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` | Database URL |
| Supabase | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key |

## License

MIT