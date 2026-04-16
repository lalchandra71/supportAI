'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { updateUserProfile, updateUserPassword } from '../actions';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('supportai_current_user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      setFullName(userData.full_name || '');
    }
  }, []);

  const handleProfileUpdate = async () => {
    if (!user) return;
    try {
      const result = await updateUserProfile(user.id, fullName);
      if (result.success) {
        const updatedUser = { ...user, full_name: fullName };
        localStorage.setItem('supportai_current_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage('Profile updated successfully!');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch {
      setMessage('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await updateUserPassword(user.id, currentPassword, newPassword);
      if (result.success) {
        setMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(result.error || 'Failed to update password');
      }
    } catch {
      setMessage('Failed to update password');
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <Sidebar>
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user.full_name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Member Since</label>
<p className="text-[var(--text-primary)]">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Plan</label>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent-primary)] font-medium capitalize">
                {user.plan || 'free'}
              </span>
              <Link href="/pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
                Upgrade →
              </Link>
            </div>
          </div>

          <button
              onClick={handleProfileUpdate}
            className="py-2 px-4 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            {saved ? 'Saved!' : 'Update Profile'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="py-2 px-4 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </div>
      </div>
    </Sidebar>
  );
}