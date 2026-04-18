'use client';

import { useState, useEffect } from 'react';
import { getStats, getConversationList, Stats, Conversation } from '../../actions';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalConversations: 0, conversationsToday: 0, unresolved: 0, resolvedCount: 0 });
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    async function loadData() {
      const [statsData, convs] = await Promise.all([
        getStats(),
        getConversationList()
      ]);
      setStats(statsData);
      setConversations(convs);
    }
    loadData();
  }, []);

  return (
    <Sidebar>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">Total Conversations</p>
          <p className="text-3xl font-bold mt-1">{stats.totalConversations}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">Today</p>
          <p className="text-3xl font-bold mt-1">{stats.conversationsToday}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">Open</p>
          <p className="text-3xl font-bold mt-1 text-[var(--error)]">{stats.unresolved}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">Resolved</p>
          <p className="text-3xl font-bold mt-1 text-green-500">{stats.resolvedCount}</p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Recent Conversations</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {conversations.length === 0 ? (
            <p className="p-4 text-[var(--text-muted)]">No conversations yet</p>
          ) : (
            conversations.slice(0, 10).map((conv) => (
              <a 
                key={conv.id} 
                href="/admin/conversations"
                className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors block"
              >
                <div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {new Date(conv.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm truncate max-w-md">{conv.message || 'No message'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${conv.resolved ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {conv.resolved ? 'Resolved' : 'Open'}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </Sidebar>
  );
}