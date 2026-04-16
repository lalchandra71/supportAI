'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('My Company');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');
  const [allowedDomains, setAllowedDomains] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('supportai_company', companyName);
    localStorage.setItem('supportai_color', primaryColor);
    localStorage.setItem('supportai_position', widgetPosition);
    localStorage.setItem('supportai_domains', allowedDomains);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Sidebar>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-8">Settings</h2>

        {/* Branding */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Widget Settings */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Widget</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Position</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWidgetPosition('bottom-right')}
                  className={`p-3 rounded-lg border ${widgetPosition === 'bottom-right' ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]' : 'border-[var(--border)]'} text-sm`}
                >
                  Bottom Right
                </button>
                <button
                  onClick={() => setWidgetPosition('bottom-left')}
                  className={`p-3 rounded-lg border ${widgetPosition === 'bottom-left' ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]' : 'border-[var(--border)]'} text-sm`}
                >
                  Bottom Left
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security - Allowed Domains */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Security</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Allowed Domains</label>
              <p className="text-xs text-[var(--text-muted)] mb-2">Restrict widget to specific domains (comma separated)</p>
              <textarea
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="example.com, www.example.com"
                rows={2}
                className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-3">Add this to your website:</p>
          <pre className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] overflow-x-auto text-sm font-mono">
{`<script src="https://yourapp.com/widget.js"></script>`}
          </pre>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="py-3 px-6 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Sidebar>
  );
}