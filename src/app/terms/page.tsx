'use client';

import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)]">
          <p className="text-sm text-[var(--text-muted)]">Last updated: April 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">1. Agreement</h2>
            <p>By using SupportAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">2. Description of Service</h2>
            <p>SupportAI provides an AI-powered customer support platform that helps businesses answer customer questions using their own documents and knowledge base. The service includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Document upload and embedding</li>
              <li>AI-powered chat responses</li>
              <li>Widget for website integration</li>
              <li>Conversation history and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">3. Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate information when signing up</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 18 years old</li>
              <li>One account per person or business</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Acceptable Use</h2>
            <p>You agree NOT to use the service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload illegal or harmful content</li>
              <li>Generate content that violates third-party rights</li>
              <li>Attempt to hack or disrupt the service</li>
              <li>Use the service for illegal purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">5. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of content you upload</li>
              <li>We retain ownership of the platform and technology</li>
              <li>You may not copy or reverse engineer our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">6. Payment & Billing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free plan includes limited usage</li>
              <li>Pro plans are billed monthly or annually</li>
              <li>You can cancel anytime from Settings</li>
              <li>Refunds available within 30 days for technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">7. Disclaimers</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE AI WILL ALWAYS PROVIDE ACCURATE ANSWERS. YOU ARE RESPONSIBLE FOR REVIEWING AND VALIDATING THE AI'S RESPONSES BEFORE MAKING THEM AVAILABLE TO CUSTOMERS.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">8. Limitation of Liability</h2>
            <p>WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. YOUR SOLE REMEDY IS TO STOP USING THE SERVICE.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">9. Termination</h2>
            <p>We may terminate your account if you violate these terms. You may delete your account at any time from Settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">10. Contact</h2>
            <p>For questions about these terms:</p>
            <p className="mt-2">
              <Link href="mailto:legal@supportai.com" className="text-[var(--accent-primary)] hover:underline">legal@supportai.com</Link>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link href="/" className="text-[var(--accent-primary)] hover:underline">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}