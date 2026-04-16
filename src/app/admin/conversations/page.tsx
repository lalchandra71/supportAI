'use client';

import { useState, useEffect } from 'react';
import { getConversationList } from '../../actions';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface Conversation {
  id: string;
  user_id: string;
  message: string;
  response: string;
  sources: string[];
  resolved: boolean;
  created_at: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const data = await getConversationList();
    setConversations(data);
  }

  return (
    <Sidebar>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-1/3 border-r border-[var(--border)] overflow-y-auto">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold">Conversations</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {conversations.length === 0 ? (
              <p className="p-4 text-[var(--text-muted)]">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-4 text-left hover:bg-[var(--bg-tertiary)] transition-colors ${
                    selectedConv?.id === conv.id ? 'bg-[var(--bg-tertiary)]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(conv.created_at).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      conv.resolved ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {conv.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <p className="text-sm truncate">{conv.message || 'No message'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-medium">Conversation</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl p-3 bg-[var(--user-bubble)] text-white">
                    <p className="whitespace-pre-wrap">{selectedConv.message}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-3 bg-[var(--ai-bubble)]">
                    <p className="whitespace-pre-wrap">{selectedConv.response}</p>
                    {selectedConv.sources.length > 0 && (
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        Sources: {selectedConv.sources.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
              Select a conversation to view
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}