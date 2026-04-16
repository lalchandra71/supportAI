'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { uploadDocument, getDocumentList, deleteDocument, sendMessage, Message } from '../actions';
import Layout from '@/components/Sidebar';

interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  embedding: number[];
  created_at: string;
}

export default function ChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m SupportAI. Add some documents to the sidebar, and I\'ll answer questions about them.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docError, setDocError] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadDocuments() {
    const docs = await getDocumentList();
    setDocuments(docs);
  }

  async function handleSendMessage() {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const history = messages.slice(-6);
      const result = await sendMessage(userMessage, history);
      
      if (result.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${result.error}` 
        }]);
      } else {
        let responseContent = result.response;
        if (result.sources.length > 0) {
          responseContent += `\n\n*Sources: ${result.sources.join(', ')}*`;
        }
        setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Failed to get response. Please try again.' 
      }]);
    }
    
    setIsLoading(false);
  }

  async function handleAddDocument() {
    if (!docTitle.trim() || !docContent.trim()) {
      setDocError('Please fill in both title and content');
      return;
    }
    
    setDocLoading(true);
    setDocError('');
    
    try {
      const result = await uploadDocument(docContent.trim(), docTitle.trim());
      
      if (result.success) {
        setShowAddDoc(false);
        setDocTitle('');
        setDocContent('');
        loadDocuments();
      } else {
        setDocError(result.error || 'Failed to upload document');
      }
    } catch (error) {
      setDocError('Failed to upload document');
    }
    
    setDocLoading(false);
  }

  async function handleDeleteDocument(id: string) {
    await deleteDocument(id);
    loadDocuments();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <Layout>
    <div className="flex min-h-screen">
      {/* Document Sidebar */}
      <aside className="w-72 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold gradient-text">Documents</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {documents.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm p-4 text-center">
              No documents yet. Add some to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li 
                  key={doc.id}
                  className="group p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[var(--error)] hover:text-[var(--error)] p-1 rounded transition-all"
                      title="Delete document"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={() => setShowAddDoc(true)}
            className="w-full py-2 px-4 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Document
          </button>
        </div>
      </aside>

      {/* Add Document Modal */}
      {showAddDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-xl w-full max-w-lg card-shadow animate-fade-in">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Document</h3>
              <button
                onClick={() => setShowAddDoc(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Content</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste your document text here..."
                  rows={8}
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors resize-none"
                />
              </div>
              {docError && (
                <p className="text-[var(--error)] text-sm">{docError}</p>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border)] flex justify-end gap-2">
              <button
                onClick={() => setShowAddDoc(false)}
                className="py-2 px-4 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                disabled={docLoading}
                className="py-2 px-4 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {docLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-semibold gradient-text">SupportAI</Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddDoc(true)}
              className="md:hidden p-2 rounded-lg bg-[var(--accent-primary)] text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-[var(--user-bubble)] text-white'
                    : 'bg-[var(--ai-bubble)] text-[var(--text-primary)]'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--ai-bubble)] rounded-2xl p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-dot" />
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors resize-none max-h-40"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
}