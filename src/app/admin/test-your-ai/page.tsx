'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { uploadDocument, getDocumentList, deleteDocument, sendMessage, getFolders, createFolder as createFolderDB, deleteFolder as deleteFolderDB, Message, Folder } from '../../actions';
import Sidebar from '@/components/Sidebar';
import { UploadDocumentModal } from '@/components/UploadDocumentModal';

interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  embedding: number[];
  created_at: string;
  folder_id?: string;
}

export default function ChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m SupportAI. Add some documents to the sidebar, and I\'ll answer questions about them.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get current user from localStorage
  function getCurrentUser() {
    const stored = localStorage.getItem('supportai_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  // Load folders from database
  async function loadFolders() {
    const user = getCurrentUser();
    const folderList = await getFolders(user?.id);
    setFolders(folderList);
  }

  async function loadDocuments() {
    const stored = localStorage.getItem('supportai_current_user');
    const userId = stored ? JSON.parse(stored).id : undefined;
    const docs = await getDocumentList(userId);
    setDocuments(docs);
  }

useEffect(() => {
    loadDocuments();
    loadFolders();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleUploadDocument(content: string, title: string, folderId?: string) {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const result = await uploadDocument(content, title, user.id, folderId);
    if (!result.success || !result.id) {
      throw new Error(result.error || 'Upload failed');
    }
    loadDocuments();
  }

  async function handleDeleteDocument(id: string, title: string) {
    setDeleteTargetId(id);
    setDeleteTargetTitle(title);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    const user = getCurrentUser();
    if (!user) {
      setShowDeleteModal(false);
      return;
    }
    await deleteDocument(deleteTargetId, user.id);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
    loadDocuments();
  }

  async function handleCreateFolder() {
    const user = getCurrentUser();
    if (!user) return;
    const result = await createFolderDB(newFolderName, '#6366f1', user.id);
    if (result.success) {
      setShowNewFolderModal(false);
      setNewFolderName('');
      loadFolders();
    }
  }

  async function handleDeleteFolder(folderId: string) {
    const user = getCurrentUser();
    if (!user) return;
    await deleteFolderDB(folderId, user.id);
    loadFolders();
  }

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState('');

  async function handleSendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const history = messages.slice(-6);
      const stored = localStorage.getItem('supportai_current_user');
      const userId = stored ? JSON.parse(stored).id : undefined;
      const result = await sendMessage(userMessage, history, userId);
      
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <>
      <Sidebar>
        <div className="flex min-h-screen">
          {/* Document Sidebar */}
          <aside className="w-72 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col hidden md:flex">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold gradient-text">Documents</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {documents.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm p-4 text-center">
                  No documents yet. Upload your first document.
                </p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => {
                    const folder = folders.find(f => f.id === doc.folder_id);
                    return (
                      <li 
                        key={doc.id}
                        className="group p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium truncate">{doc.title}</p>
                              {folder && (
                                <span 
                                  className="px-1 py-0.5 rounded text-[10px] text-white"
                                  style={{ backgroundColor: folder.color }}
                                >
                                  {folder.name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id, doc.title);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 p-1 rounded transition-all"
                            title="Delete document"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            <div className="p-3 border-t border-[var(--border)]">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full py-2 px-4 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Document
              </button>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-xl font-semibold gradient-text">SupportAI</Link>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/upload"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Manage Knowledge Base
                </a>
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
      </Sidebar>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocument}
        folders={folders}
      />

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] w-full max-w-md">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold">Manage Folders</h2>
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-[var(--text-secondary)]">Create New Folder</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="flex-1 p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[var(--text-secondary)]">Existing Folders</label>
                <div className="space-y-1">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="text-sm">{folder.name}</span>
                        {folder.id === 'general' && (
                          <span className="text-xs text-[var(--text-muted)]">(default)</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFolder(folder.id)}
                        disabled={!folder.id}
                        className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete folder"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] w-full max-w-md">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-red-500">Confirm Delete</h2>
            </div>
            <div className="p-6">
              <p className="text-[var(--text-secondary)]">
                Are you sure you want to delete "<strong>{deleteTargetTitle}</strong>"? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
