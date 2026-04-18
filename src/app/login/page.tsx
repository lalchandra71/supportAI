'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { signUp, signIn } from '../actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        
        if (!result.success || !result.user) {
          setError(result.error || 'Invalid email or password');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('supportai_current_user', JSON.stringify(result.user));
      } else {
        const result = await signUp(email, password, fullName);
        
        if (!result.success || !result.user) {
          setError(result.error || 'Failed to create account');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('supportai_current_user', JSON.stringify(result.user));
      }

      router.push('/admin');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 inline-block">
          ← Back to home
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">SupportAI</h1>
          <p className="text-[var(--text-secondary)]">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                />
              </div>
            )}
            
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

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
              />
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-sm text-[var(--accent-primary)] hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm text-[var(--text-secondary)] mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[var(--accent-primary)] hover:underline ml-1"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          After signing up, you'll have access to Dashboard, Upload, Chat, and Settings
        </p>
      </div>
    </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}