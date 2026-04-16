'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-secondary)]/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="text-xl font-semibold gradient-text">SupportAI</Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">Home</Link>
          <Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">Pricing</Link>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
          <p className="text-[var(--text-secondary)]">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-[var(--text-secondary)]">hello@supportai.com</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Location</h3>
            <p className="text-sm text-[var(--text-secondary)]">San Francisco, CA</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Response Time</h3>
            <p className="text-sm text-[var(--text-secondary)]">Within 24 hours</p>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Message Sent!</h2>
              <p className="text-[var(--text-secondary)]">We'll get back to you as soon as possible.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-[var(--accent-primary)] hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Question</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--text-secondary)]">
            For immediate help, check our <Link href="/demo" className="text-[var(--accent-primary)] hover:underline">demo</Link> or <Link href="/pricing" className="text-[var(--accent-primary)] hover:underline">pricing page</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}