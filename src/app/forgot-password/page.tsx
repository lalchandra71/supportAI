'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { forgotPassword } from '@/app/actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSubmitted(true);
        if (result.resetUrl) {
          setResetUrl(result.resetUrl);
        }
      } else {
        setError(result.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 inline-block">
            ← Back to login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Reset Password</h1>
            <p className="text-[var(--text-secondary)]">
              {submitted
                ? 'Check your email for the reset link'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-8">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[var(--text-secondary)]">
                  We've created a password reset link for <strong>{email}</strong>.
                  The link is valid for 1 hour.
                </p>

                {resetUrl && (
                  <div className="mt-4 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Reset link (development mode):</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={resetUrl}
                        className="flex-1 p-2 rounded bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] border border-[var(--border)]"
                      />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(resetUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (err) {
                        // Fallback: select and copy
                        const input = document.querySelector('input[value="' + resetUrl + '"]') as HTMLInputElement;
                        input?.select();
                        document.execCommand('copy');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Copy
                  </button>
                  {copied && (
                    <p className="text-xs text-green-500 ml-2">Copied!</p>
                  )}
                    </div>
                  </div>
                )}

                <Link
                  href="/login"
                  className="block w-full py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-center"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Get Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
