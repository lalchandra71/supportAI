'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { uploadDocument, getDocumentList, deleteDocument, updateDocument, getFolders, createFolder as createFolderDB, deleteFolder as deleteFolderDB, updateDocumentFolder, Folder } from '../../actions';
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

export default function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingFolder, setEditingFolder] = useState<string>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  function renderDeleteModal() {
    return (
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
    );
  }

  const getCurrentUser = () => {
    const stored = localStorage.getItem('supportai_current_user');
    return stored ? JSON.parse(stored) : null;
  };

async function loadFolders() {
    const user = getCurrentUser();
    const folderList = await getFolders(user?.id);
    setFolders(folderList);
  }

  async function loadDocuments() {
    const user = getCurrentUser();
    const docs = await getDocumentList(user?.id);
    setDocuments(docs);
  }

  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, []);

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
    if (filterFolder === folderId) setFilterFolder('all');
  }

  async function handleChangeDocFolder(docId: string, newFolderId: string) {
    const user = getCurrentUser();
    if (!user) return;
    const folderId = newFolderId === 'none' ? null : newFolderId;
    await updateDocumentFolder(docId, folderId, user.id);
    loadDocuments();
  }

  async function handleUpload(content: string, title: string, folderId?: string) {
    const user = getCurrentUser();
    if (!user) throw new Error('Authentication required');
    const result = await uploadDocument(content, title, user.id, folderId);
    if (!result.success || !result.id) throw new Error(result.error || 'Upload failed');
    loadDocuments();
  }

  async function handleUpdate(content: string, title: string, folderId?: string) {
    if (!editingId) throw new Error('No document to update');
    const user = getCurrentUser();
    if (!user) throw new Error('Authentication required');
    const result = await updateDocument(editingId, title, content, user.id, folderId);
    if (!result.success) throw new Error(result.error || 'Update failed');
    setEditingId(null);
    loadDocuments();
  }

  async function handleDelete(id: string, title: string) {
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

  function handleEdit(doc: Document) {
    setEditingId(doc.id);
    setEditingTitle(doc.title);
    setEditingContent(doc.content);
    setEditingFolder(doc.folder_id || 'none');
    setShowUploadModal(true);
  }

  // Filter and sort documents
  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = filterFolder === 'all' || doc.folder_id === filterFolder;
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

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                </select>

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
                const folder = folders.find(f => f.id === doc.folder_id);
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
                        <p className="text-sm text-[var(--text-muted)] truncate">{doc.content.substring(0, 100)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-red-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Upload Modal */}
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setEditingId(null);
          }}
          onUpload={handleUpload}
          folders={folders}
          isEditing={!!editingId}
          onUpdate={handleUpdate}
          initialTitle={editingTitle}
          initialContent={editingContent}
        />

        {/* Delete Modal */}
        {showDeleteModal && renderDeleteModal()}
      </Sidebar>
    );
  }