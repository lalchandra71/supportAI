'use client';

import { useState } from 'react';
import Link from 'next/link';
import SupportAILogo from '@/components/SupportAILogo';
import Header from '@/components/Header';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/login?email=${encodeURIComponent(email)}`;
    } else {
      window.location.href = '/login';
    }
  };

  const handleGetEmbedCode = () => {
    const user = localStorage.getItem('supportai_current_user');
    if (user) {
      window.location.href = '/setup';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <SupportAILogo size={80} />
          </div>
          <div className="inline-block px-4 py-1 rounded-full bg-[var(--accent-glow)] border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-sm mb-6">
            AI Support Agent for SaaS
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Instant Answers from Your{' '}
            <span className="gradient-text">Knowledge Base</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Reduce support tickets by 80%. AI that answers customer questions using your documents, PDFs, and help center content.
          </p>
           <div className="flex gap-4 justify-center flex-col sm:flex-row">
             <form onSubmit={handleGetStarted} className="flex gap-2 flex-wrap justify-center">
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter your email"
                 className="w-64 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
               />
               <button type="submit" className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors">
                 Get Started
               </button>
             </form>
             <Link href="/demo" className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
               Try Demo
             </Link>
           </div>
           <p className="text-[var(--text-muted)] text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Demo Preview - Eye-catching CTA */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a24 0%, #0a0a0f 100%)' }}>
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', transform: 'translate(-30%, 50%)' }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-primary)] text-white text-sm font-medium mb-4 shadow-lg shadow-[var(--accent-primary)]/30">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Live Demo - No Signup Required
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white">
              See the <span className="gradient-text">AI Support Agent</span> in action
            </h3>
            <p className="text-[var(--text-secondary)] mt-3 text-lg">Ask anything about your product • Get instant answers with citations</p>
          </div>
          
          {/* Mini Chat Preview */}
          <div className="bg-[#12121a] rounded-xl border border-[var(--accent-primary)]/30 overflow-hidden card-shadow max-w-lg mx-auto shadow-2xl shadow-[var(--accent-primary)]/10">
            <div className="p-3 border-b border-[var(--border)] flex items-center gap-2 bg-[#0a0a0f]">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-[var(--text-muted)] ml-2">SupportAI Demo</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-start">
                <div className="bg-[var(--ai-bubble)] rounded-xl p-3 text-sm max-w-[85%] border border-[var(--accent-primary)]/20">
                  👋 Hi! I'm your AI support assistant. Ask me about refund policy, password reset, or how to upgrade.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[var(--user-bubble)] rounded-xl p-3 text-sm max-w-[85%]">
                  How do I reset my password?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[var(--ai-bubble)] rounded-xl p-3 text-sm max-w-[85%] border border-[var(--accent-primary)]/20">
                  Go to <strong>Settings → Security → Reset Password</strong>. You'll receive a confirmation email to complete the change.
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/demo" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-lg hover:bg-[var(--accent-hover)] transition-all transform hover:scale-105 shadow-lg shadow-[var(--accent-primary)]/40">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Try the Full Demo
            </Link>
            <p className="text-[var(--text-muted)] text-sm mt-3">Takes 30 seconds • No account needed</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-center mb-16">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">1. Upload Documents</h4>
              <p className="text-[var(--text-secondary)] text-sm">Paste text or upload PDFs. We automatically chunk and embed your content.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">2. AI Searches</h4>
              <p className="text-[var(--text-secondary)] text-sm">When users ask questions, our AI finds the most relevant content using vector search.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">3. Get Answers</h4>
              <p className="text-[var(--text-secondary)] text-sm">GPT-4o generates accurate answers with citations from your documents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--bg-secondary)] text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-semibold mb-4">Ready to reduce support tickets?</h3>
          <p className="text-[var(--text-secondary)] mb-8">Start with a 14-day free trial. No credit card required.</p>
          <Link href="/login" className="inline-block px-8 py-4 rounded-xl bg-[var(--accent-primary)] text-white font-medium text-lg hover:bg-[var(--accent-hover)] transition-colors">
            Get Started
          </Link>
        </div>
       </section>

      {/* Embed Preview */}
      <section className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold mb-4">Embed on Any Website</h3>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Add a single line of code to your site. The SupportAI widget appears as a floating chat button in the bottom-right corner, ready to assist your visitors.
            </p>
          </div>
          
          {/* Iframe showing widget on example site */}
          <div className="relative rounded-xl overflow-hidden border border-[var(--border)] h-[600px]">
            <iframe 
              src="/embed-example.html"
              className="w-full h-full border-none"
              title="SupportAI widget embedded example"
            />
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={handleGetEmbedCode}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Get Embed Code
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--text-muted)] text-sm">© 2026 SupportAI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)]">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}