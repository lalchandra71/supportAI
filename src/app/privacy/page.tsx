'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto p-6 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)]">
          <p className="text-sm text-[var(--text-muted)]">Last updated: April 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">1. Introduction</h2>
            <p>SupportAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI customer support platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, company name when you sign up</li>
              <li><strong>Documents:</strong> Content you upload for the AI to learn from (knowledge base)</li>
              <li><strong>Chat History:</strong> Conversations between your customers and the AI agent</li>
              <li><strong>Usage Data:</strong> How you interact with the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve our AI support services</li>
              <li>To process your documents and generate embeddings</li>
              <li>To answer customer questions using your knowledge base</li>
              <li>To analyze usage and improve user experience</li>
              <li>To communicate with you about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored on secure servers. We use industry-standard encryption and security measures to protect your information. Your documents and chat history are stored in your private account space and are not accessed by third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">5. Data Sharing</h2>
            <p>We do <strong>not</strong> sell, trade, or transfer your personal information to third parties. We only share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Supabase (our database provider) for storage</li>
              <li>OpenAI (for AI processing via their API)</li>
              <li>When required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Object to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at:</p>
            <p className="mt-2">
              <Link href="mailto:privacy@supportai.com" className="text-[var(--accent-primary)] hover:underline">privacy@supportai.com</Link>
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