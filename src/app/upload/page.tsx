'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { uploadDocument, getDocumentList, deleteDocument, updateDocument } from '../actions';
import { extractPdfTextClient } from '@/lib/pdf-client';
import Sidebar from '@/components/Sidebar';

interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  embedding: number[];
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
}

const FOLDERS_KEY = 'supportai_folders';
const DOC_FOLDER_MAP_KEY = 'supportai_doc_folders';

export default function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [docFolderMap, setDocFolderMap] = useState<Record<string, string>>({});
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<string>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load folders and document mappings from localStorage
  useEffect(() => {
    const savedFolders = localStorage.getItem(FOLDERS_KEY);
    const savedMap = localStorage.getItem(DOC_FOLDER_MAP_KEY);
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    } else {
      // Default folders
      const defaults: Folder[] = [
        { id: 'general', name: 'General', color: '#6366f1' },
        { id: 'faq', name: 'FAQs', color: '#22c55e' },
        { id: 'policies', name: 'Policies', color: '#f59e0b' },
      ];
      setFolders(defaults);
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(defaults));
    }
    if (savedMap) {
      setDocFolderMap(JSON.parse(savedMap));
    }
  }, []);

  async function loadDocuments() {
    const docs = await getDocumentList();
    setDocuments(docs);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function saveFolders(newFolders: Folder[]) {
    setFolders(newFolders);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(newFolders));
  }

  function saveDocFolderMap(map: Record<string, string>) {
    setDocFolderMap(map);
    localStorage.setItem(DOC_FOLDER_MAP_KEY, JSON.stringify(map));
  }

  function createFolder(name: string, color: string) {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color
    };
    saveFolders([...folders, newFolder]);
    setShowNewFolderModal(false);
    setNewFolderName('');
  }

  function deleteFolder(folderId: string) {
    if (folderId === 'general') return; // Can't delete default
    const newMap = { ...docFolderMap };
    delete newMap[folderId];
    saveDocFolderMap(newMap);
    saveFolders(folders.filter(f => f.id !== folderId));
    if (filterFolder === folderId) setFilterFolder('all');
  }

  function assignToFolder(docId: string, folderId: string | null) {
    const newMap = { ...docFolderMap };
    if (folderId === null || folderId === 'all') {
      delete newMap[docId];
    } else {
      newMap[docId] = folderId;
    }
    saveDocFolderMap(newMap);
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
      if (result.success && result.id) {
        // Assign folder if selected
        if (uploadFolder && uploadFolder !== 'none') {
          assignToFolder(result.id, uploadFolder);
        }
        setTitle('');
        setContent('');
        setFileName('');
        setUploadFolder('none');
        setShowUploadModal(false);
        loadDocuments();
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    }
    
    setIsLoading(false);
  }

  async function handleUpdate() {
    if (!editingId || !title.trim() || !content.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await updateDocument(editingId, title, content);
      if (result.success) {
        // Update folder assignment
        const folderToAssign = uploadFolder === 'none' ? null : uploadFolder;
        assignToFolder(editingId, folderToAssign);
        setTitle('');
        setContent('');
        setFileName('');
        setUploadFolder('none');
        setEditingId(null);
        setShowUploadModal(false);
        loadDocuments();
      } else {
        setError(result.error || 'Update failed');
      }
    } catch (err) {
      setError('Update failed');
    }
    
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await deleteDocument(id);
    loadDocuments();
    const newMap = { ...docFolderMap };
    delete newMap[id];
    saveDocFolderMap(newMap);
  }

  function handleEdit(doc: Document) {
    setEditingId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setFileName('');
    setUploadFolder(docFolderMap[doc.id] || 'none');
    setError('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setFileName('');
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const text = await extractPdfTextClient(file);
      setContent(text);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setContent(e.target?.result as string || '');
      reader.readAsText(file);
    }
  }

  // Filter and sort documents
  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = filterFolder === 'all' || docFolderMap[doc.id] === filterFolder;
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Knowledge Base</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setContent('');
            setFileName('');
            setUploadFolder('none');
            setError('');
            setShowUploadModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Upload Document
        </button>
      </div>

      {/* Document List */}
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Documents ({filteredDocs.length})</h3>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm hover:border-[var(--accent-primary)] transition-colors"
              >
                + New Folder
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* Folder filter */}
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
              >
                <option value="all">All Folders</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors w-48"
              />
            </div>
          </div>
        </div>

        {/* Document Cards */}
        <div className="divide-y divide-[var(--border)]">
            {filteredDocs.length === 0 ? (
              <p className="p-8 text-[var(--text-muted)] text-sm text-center">
                {searchQuery || filterFolder !== 'all' 
                  ? 'No documents match your filters.' 
                  : 'No documents yet. Click "Upload Document" to add your first document.'}
              </p>
          ) : (
            filteredDocs.map((doc) => {
              const folderId = docFolderMap[doc.id];
              const folder = folders.find(f => f.id === folderId);
              return (
                <div key={doc.id} className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{doc.title}</p>
                        {folder && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                            style={{ backgroundColor: folder.color }}
                          >
                            {folder.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        Added {new Date(doc.created_at).toLocaleDateString()} • {doc.content.length} characters
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Folder assignment dropdown */}
                      <select
                        value={folderId || 'none'}
                        onChange={(e) => assignToFolder(doc.id, e.target.value === 'none' ? null : e.target.value)}
                        className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border)] text-xs focus:border-[var(--accent-primary)] outline-none"
                      >
                        <option value="none">No Folder</option>
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setEditingId(doc.id);
                          setTitle(doc.title);
                          setContent(doc.content);
                          setFileName('');
                          setError('');
                          setShowUploadModal(true);
                        }}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Document' : 'Add New Document'}
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                  setFileName('');
                  setUploadFolder('none');
                  setError('');
                }}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                >
                  <option value="none">No Folder</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  rows={8}
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors resize-none font-mono text-sm"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {content.length} characters
                </p>
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
                      Click to upload .txt, .md, .pdf, .json, .html, .css, .js, .ts files
                    </span>
                  )}
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  PDF files will have text extracted automatically. Text files are read directly.
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingId ? handleUpdate : handleUpload}
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="flex-1 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : (editingId ? 'Update Document' : 'Upload Document')}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setEditingId(null);
                    setTitle('');
                    setContent('');
                    setFileName('');
                    setUploadFolder('none');
                    setError('');
                  }}
                  className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {/* Create new folder */}
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
                    onClick={() => createFolder(newFolderName, '#6366f1')}
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Existing folders list */}
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
                        onClick={() => deleteFolder(folder.id)}
                        disabled={folder.id === 'general'}
                        className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={folder.id === 'general' ? 'Cannot delete default folder' : 'Delete folder'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {folders.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)] text-center py-2">
                      No folders yet. Create one above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}