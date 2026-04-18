'use client';

import Link from 'next/link';
import SupportAILogo from '@/components/SupportAILogo';

export default function Header() {
  const handleGetStarted = () => {
    const userJson = localStorage.getItem('supportai_current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.id) {
          window.location.href = '/admin/dashboard';
          return;
        }
      } catch (err) {}
    }
    window.location.href = '/login';
  };

  return (
    <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-secondary)]/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <SupportAILogo size={36} showText={false} />
        <span className="text-xl font-semibold gradient-text">SupportAI</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/demo" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">Demo</Link>
        <Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">Pricing</Link>
        <button onClick={handleGetStarted} className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
          Get Started
        </button>
      </div>
    </header>
  );
}
