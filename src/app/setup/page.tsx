'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SupportAILogo from '@/components/SupportAILogo';

export default function SetupPage() {
  const [companyName, setCompanyName] = useState('My Company');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('supportai_company');
    const color = localStorage.getItem('supportai_color');
    const position = localStorage.getItem('supportai_position');
    if (saved) setCompanyName(saved);
    if (color) setPrimaryColor(color);
    if (position) setWidgetPosition(position);
  }, []);

  const widgetCode = `<!-- SupportAI Widget -->
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"></script>

<!-- Or use iframe -->
<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed" style="border:none;position:fixed;${widgetPosition.includes('left') ? 'left' : 'right'}:20px;bottom:20px;width:380px;height:500px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.3);"></iframe>`;

  async function copyCode() {
    await navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Widget Setup</h1>
          <p className="text-[var(--text-secondary)]">Copy and paste this code into your website to add the AI Support widget.</p>
        </div>

        {/* Preview */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="h-64 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <p className="text-sm text-[var(--text-muted)] mb-4">Widget Preview</p>
              <div className="inline-flex flex-col items-center gap-3">
                <SupportAILogo size={48} showText={false} />
                <div className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                  {companyName} Support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Embed Code</h3>
            <button
              onClick={copyCode}
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] overflow-x-auto text-sm font-mono whitespace-pre-wrap">
{`<!-- SupportAI Widget -->
${widgetCode}

<!-- Or use this iframe -->
<!-- <iframe src="https://supportai.com/embed?company=${encodeURIComponent(companyName)}&color=${encodeURIComponent(primaryColor)}" style="border:none;position:fixed;bottom:20px;right:20px;width:400px;height:500px;"></iframe> -->`}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Installation Instructions</h3>
          <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
              Copy the embed code above
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
              Paste it before the closing <code className="text-[var(--accent-primary)]">&lt;/body&gt;</code> tag on your website
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
              The widget will appear on your site. Test it by clicking the chat bubble
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">4</span>
              Go to <Link href="/settings" className="text-[var(--accent-primary)]">Settings</Link> to customize colors and position
            </li>
          </ol>
        </div>

        {/* Test Link */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="text-lg font-semibold mb-4">Test Your Widget</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Add your domain to allowed domains in Settings, then test the widget on your site.
          </p>
          <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configure Allowed Domains
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}