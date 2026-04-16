'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { uploadDocument, getDocumentList, deleteDocument } from '../actions';
import { extractPdfText } from '../pdf';
import Sidebar from '@/components/Sidebar';

interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  embedding: number[];
  created_at: string;
}

export default function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    const docs = await getDocumentList();
    setDocuments(docs);
  }

  async function handleUpload() {
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await uploadDocument(content, title);
      if (result.success) {
        setTitle('');
        setContent('');
        setFileName('');
        loadDocuments();
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    }
    
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    await deleteDocument(id);
    loadDocuments();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      const reader = new FileReader();
      reader.onload = (e) => setContent(e.target?.result as string || '');
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setContent(`[PDF: ${file.name}]\n\nTo use PDF content:\n1. Open PDF in reader\n2. Select & copy text\n3. Paste in content area below`);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setContent(e.target?.result as string || '');
      reader.readAsText(file);
    }
  }

  return (
    <Sidebar>
      <h1 className="text-2xl font-semibold mb-6">Upload Documents</h1>

        {/* Upload Form */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste text content here..."
                rows={10}
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--border)]"></div>
              <span className="text-[var(--text-muted)] text-sm">or</span>
              <div className="flex-1 h-px bg-[var(--border)]"></div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Upload File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.html,.css,.js,.ts,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors text-center cursor-pointer"
              >
                {fileName ? (
                  <span className="text-[var(--accent-primary)]">{fileName}</span>
                ) : (
                  <span className="text-[var(--text-muted)]">
                    Click to upload .txt, .md, .json, .html, .css, .js, .ts, .pdf files
                  </span>
                )}
              </button>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                For PDF files, content will be extracted as text.
              </p>
            </div>

            {error && (
              <p className="text-[var(--error)] text-sm">{error}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={isLoading || !title.trim() || !content.trim()}
              className="w-full py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold">Your Documents ({documents.length})</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {documents.length === 0 ? (
              <p className="p-4 text-[var(--text-muted)] text-sm">No documents yet. Upload your first document above.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
    </Sidebar>
  );
}