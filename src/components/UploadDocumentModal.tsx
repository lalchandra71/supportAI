'use client';

import { useState, useRef, useEffect } from 'react';
import { Folder } from '@/app/actions';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (content: string, title: string, folderId?: string) => Promise<void>;
  folders: Folder[];
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
  onUpdate?: (content: string, title: string, folderId?: string) => Promise<void>;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onUpload,
  folders,
  initialTitle = '',
  initialContent = '',
  isEditing = false,
  onUpdate
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [uploadFolder, setUploadFolder] = useState<string>('none');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'sample'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [isOpen, initialTitle, initialContent]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (e) => setContent(e.target?.result as string || '');
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const folderId = uploadFolder && uploadFolder !== 'none' ? uploadFolder : undefined;
      if (isEditing && onUpdate) {
        await onUpdate(content, title, folderId);
      } else {
        await onUpload(content, title, folderId);
      }
      handleClose();
    } catch (err) {
      setError('Upload failed');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setFileName('');
    setUploadFolder('none');
    setError('');
    setActiveTab('upload');
    onClose();
  };

  if (!isOpen) return null;

  const renderSampleFormat = () => (
    <div className="p-6 space-y-4">
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Here are examples of recommended formats for your knowledge base documents:
      </p>
      
      <div className="space-y-6">
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
          <h4 className="font-medium text-[var(--text-primary)] mb-2">Q and A Format</h4>
          <div className="text-sm text-[var(--text-muted)] font-mono whitespace-pre-wrap">
Q: How do I reset my password?<br/>
A: To reset your password, click on Forgot Password on the login page, enter your email address, and follow the instructions sent to your inbox.<br/>
Q: What payment methods do you accept?<br/>
A: We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.<br/>
          </div>
        </div>

        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
          <h4 className="font-medium text-[var(--text-primary)] mb-2">Clear Sentences Format</h4>
          <div className="text-sm text-[var(--text-muted)] font-mono whitespace-pre-wrap">
Our business hours are Monday to Friday, 9 AM to 6 PM EST.
We offer free shipping on orders over 50 dollars. Orders below 50 dollars have a flat 5.99 dollar shipping fee.
Returns can be initiated within 30 days of purchase. Visit our Returns page to start the process.
All products come with a 1-year manufacturer warranty covering defects in materials and workmanship.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Upload Document
            </button>
            <button
              onClick={() => setActiveTab('sample')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sample'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Sample Format
            </button>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {activeTab === 'upload' ? (
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
              <p className="text-xs text-[var(--accent-primary)] mt-2 bg-[var(--accent-primary)]/10 px-3 py-2 rounded-lg">
                Tip: For best results, use clear sentences or Q&A format. Please check sample document
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
                accept=".txt"
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
                    Click to upload .txt files
                  </span>
                )}
              </button>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Only plain text (.txt) files are supported
              </p>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="flex-1 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Uploading...' : isEditing ? 'Update Document' : 'Upload Document'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          renderSampleFormat()
        )}
      </div>
    </div>
  );
}
