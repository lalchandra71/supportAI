# SupportAI - AI-Powered Support System

## 1. Project Overview

**Project Name:** SupportAI  
**Type:** Web Application (AI Chat Support System)  
**Core Functionality:** An AI-powered support system that uses RAG (Retrieval Augmented Generation) to answer user questions based on knowledge base documents. Users can ask questions and receive accurate, context-aware responses powered by OpenAI.  
**Target Users:** Support teams, helpdesk operators, and end-users seeking answers

## 2. Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js Server Actions + API Routes
- **Database:** PostgreSQL with Supabase
- **Vector DB:** Supabase pgvector
- **AI:** OpenAI API (GPT-4o)
- **Embeddings:** OpenAI text-embedding-3-small

## 3. UI/UX Specification

### Layout Structure

- **Header:** Fixed top navigation with logo and nav links
- **Main Content:** Two-column layout on desktop (sidebar + chat area)
- **Sidebar:** Document management panel (left, 280px)
- **Chat Area:** Message history + input (right, flexible)
- **Responsive:** Single column on mobile with collapsible sidebar

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette:**
- Background Primary: `#0a0a0f` (deep dark)
- Background Secondary: `#12121a` (card dark)
- Background Tertiary: `#1a1a24` (input fields)
- Accent Primary: `#6366f1` (indigo)
- Accent Hover: `#818cf8` (light indigo)
- Accent Glow: `rgba(99, 102, 241, 0.15)`
- Text Primary: `#f4f4f5` (zinc-100)
- Text Secondary: `#a1a1aa` (zinc-400)
- Text Muted: `#71717a` (zinc-500)
- Border: `#27272a` (zinc-800)
- Success: `#22c55e`
- Error: `#ef4444`
- User Message Bubble: `#1e1b4b` (indigo-950)
- AI Message Bubble: `#27272a` (zinc-800)

**Typography:**
- Font Family: `'Geist', 'SF Pro Display', -apple-system, sans-serif`
- Headings: 
  - H1: 32px, font-weight 700
  - H2: 24px, font-weight 600
  - H3: 18px, font-weight 600
- Body: 15px, font-weight 400, line-height 1.6
- Small: 13px
- Code: `'Geist Mono', 'Fira Code', monospace`, 14px

**Spacing System:**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

**Visual Effects:**
- Card shadows: `0 4px 24px rgba(0, 0, 0, 0.4)`
- Glow effect on focus: `0 0 0 2px rgba(99, 102, 241, 0.3)`
- Border radius: 8px (cards), 12px (buttons), 24px (message bubbles)
- Transitions: 200ms ease-out

### Components

**Header:**
- Logo (left): "SupportAI" text with gradient
- Nav links (center): Chat, Documents, Settings
- User avatar (right): Circle with initials

**Sidebar:**
- Document list with title, date, chunk count
- Add Document button (primary)
- Delete button on hover
- Search input for filtering

**Chat Area:**
- Message list with user/AI differentiation
- User messages: Right-aligned, indigo background
- AI messages: Left-aligned, dark background with source citations
- Input area: Fixed bottom with textarea + send button
- Loading state: Typing dots animation

**Buttons:**
- Primary: Indigo background, white text, hover glow
- Secondary: Transparent, border, hover fill
- Icon: Circle with icon, tooltip on hover

**Forms:**
- Input fields: Dark background, border on focus
- Textarea: Auto-resize, max 200px height
- Labels: Above input, zinc-400 color

## 4. Functionality Specification

### Core Features

**Document Management:**
- Upload text documents (paste or file)
- Process documents into chunks (500 chars, 50 overlap)
- Generate embeddings for each chunk
- Store in Supabase with pgvector
- List all documents with metadata
- Delete documents

**Chat Interface:**
- Send messages via server action
- Stream AI responses (simulated for now)
- Display source citations from retrieved chunks
- Show related documents in context
- Clear chat history

**RAG Pipeline:**
- Embed user query using text-embedding-3-small
- Query pgvector for similar chunks (top 5)
- Send context + question to GPT-4o
- Stream response back to user

### API Endpoints

**Server Actions:**
- `uploadDocument(content, title)` - Process and store document
- `deleteDocument(id)` - Remove document and embeddings
- `sendMessage(message, history)` - RAG query with chat history

**Database Functions:**
- `match_documents(embedding, match_count)` - Vector similarity search

### Data Models

**documents:**
```sql
id: uuid PRIMARY KEY
title: text NOT NULL
content: text NOT NULL
created_at: timestamptz DEFAULT NOW()
chunk_count: integer
```

**document_chunks:**
```sql
id: uuid PRIMARY KEY
document_id: uuid REFERENCES documents(id)
content: text NOT NULL
embedding: vector(1536)
created_at: timestamptz DEFAULT NOW()
```

### Edge Cases
- Empty document content: Show error
- Very long documents: Chunk and process in batches
- No similar chunks found: Return fallback response
- API rate limits: Queue and retry
- Database connection failure: Show user-friendly error

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with indigo accents applied
- [ ] Responsive layout works on all breakpoints
- [ ] Message bubbles clearly differentiate user/AI
- [ ] Loading states visible during API calls
- [ ] Smooth animations on interactions

### Functional Checkpoints
- [ ] Can add documents via form
- [ ] Documents appear in sidebar list
- [ ] Can delete documents
- [ ] Can send messages and receive responses
- [ ] Source citations show in AI responses
- [ ] Vector search returns relevant chunks

### Success Conditions
1. Next.js app builds without errors
2. Database schema applies successfully
3. Frontend renders without console errors
4. Document upload creates embeddings
5. Chat returns context-aware responses