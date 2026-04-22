'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SupportAILogo from '@/components/SupportAILogo';
import { getWidgetSettingsAction, saveWidgetSettingsAction } from '@/app/actions';

interface StoredUser {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
}

export default function SetupPage() {
  const [companyName, setCompanyName] = useState('My Company');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [messageTextColor, setMessageTextColor] = useState('#ffffff');
  const [logoColor, setLogoColor] = useState('#ffffff');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const userJson = localStorage.getItem('supportai_current_user');
        let userId: string | null = null;
        
        if (userJson) {
          const user: StoredUser = JSON.parse(userJson);
          userId = user.id;
          setCurrentUserId(userId);
          
          if (user.full_name || user.email) {
            setCompanyName(user.full_name || user.email?.split('@')[0] || 'My Company');
          }
        }
        
        const savedName = localStorage.getItem('supportai_company');
        const savedColor = localStorage.getItem('supportai_color');
        const savedTextColor = localStorage.getItem('supportai_text_color');
        const savedLogoColor = localStorage.getItem('supportai_logo_color');
        const savedPosition = localStorage.getItem('supportai_position');
        if (savedName) setCompanyName(savedName);
        if (savedColor) setPrimaryColor(savedColor);
        if (savedTextColor) setMessageTextColor(savedTextColor);
        if (savedLogoColor) setLogoColor(savedLogoColor);
        if (savedPosition) setWidgetPosition(savedPosition);
        
        if (userId) {
          const result = await getWidgetSettingsAction(userId);
          if (result.success && result.settings) {
            const db = result.settings;
            setCompanyName(db.company_name || companyName);
            setPrimaryColor(db.primary_color || primaryColor);
            setMessageTextColor(db.message_text_color || messageTextColor);
            setLogoColor(db.logo_color || logoColor);
            setWidgetPosition(db.position || widgetPosition);
            
            localStorage.setItem('supportai_company', db.company_name || '');
            localStorage.setItem('supportai_color', db.primary_color || '');
            localStorage.setItem('supportai_text_color', db.message_text_color || '');
            localStorage.setItem('supportai_logo_color', db.logo_color || '');
            localStorage.setItem('supportai_position', db.position || '');
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
      
      setMounted(true);
    }
    
    loadSettings();
  }, []);

  const widgetCode = useMemo(() => {
    if (!mounted) return '';
    const origin = window.location.origin;
    if (currentUserId) {
      return `<script>window.supportai_user_id = "${currentUserId}";window.supportai_server_url = "${origin}";</script><script src="${origin}/supportai.js"></script>`;
    }
    return `<script>window.supportai_server_url = "${origin}";</script><script src="${origin}/supportai.js"></script>`;
  }, [mounted, currentUserId]);

  const darkerColor = useMemo(() => {
    const hex = primaryColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 30);
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 30);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, [primaryColor]);

  async function copyCode() {
    if (!widgetCode) return;
    await navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveSettings() {
    if (!currentUserId) return;
    
    setSaving(true);
    const result = await saveWidgetSettingsAction(
      currentUserId,
      companyName,
      primaryColor,
      messageTextColor,
      logoColor,
      widgetPosition
    );
    setSaving(false);
    
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <Sidebar>
      <div className="max-w-full mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Widget Setup</h1>
          <p className="text-[var(--text-secondary)]">Configure and preview your widget, then copy the embed code.</p>
        </div>

        {/* Settings and Preview side by side */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Settings */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="text-lg font-semibold mb-4">Widget Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    localStorage.setItem('supportai_company', e.target.value);
                  }}
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:glow outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Primary Color</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    localStorage.setItem('supportai_color', e.target.value);
                  }}
                  className="w-full h-12 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Message Text Color</label>
                <input
                  type="color"
                  value={messageTextColor}
                  onChange={(e) => {
                    setMessageTextColor(e.target.value);
                    localStorage.setItem('supportai_text_color', e.target.value);
                  }}
                  className="w-full h-12 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Widget Logo Color</label>
                <input
                  type="color"
                  value={logoColor}
                  onChange={(e) => {
                    setLogoColor(e.target.value);
                    localStorage.setItem('supportai_logo_color', e.target.value);
                  }}
                  className="w-full h-12 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Position</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setWidgetPosition('bottom-right');
                      localStorage.setItem('supportai_position', 'bottom-right');
                    }}
                    className={`p-3 rounded-lg border ${widgetPosition === 'bottom-right' ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]' : 'border-[var(--border)]'} text-sm`}
                  >
                    Bottom Right
                  </button>
                  <button
                    onClick={() => {
                      setWidgetPosition('bottom-left');
                      localStorage.setItem('supportai_position', 'bottom-left');
                    }}
                    className={`p-3 rounded-lg border ${widgetPosition === 'bottom-left' ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]' : 'border-[var(--border)]'} text-sm`}
                  >
                    Bottom Left
                  </button>
                </div>
              </div>
              <button
                onClick={saveSettings}
                disabled={saving || !currentUserId}
                className="w-full py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="h-72 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col">
                {/* Simulated website background */}
                <div className="flex-1 bg-white p-4">
                  <div className="h-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Your Website Content
                  </div>
                </div>
                
                {/* Widget Button */}
                <div 
                  className={`absolute ${widgetPosition === 'bottom-right' ? 'right-4' : 'left-4'}`}
                  style={{ bottom: '16px', right: widgetPosition === 'bottom-right' ? '16px' : 'auto', left: widgetPosition === 'bottom-left' ? '16px' : 'auto' }}
                >
                  <button
                    onClick={() => setWidgetOpen(!widgetOpen)}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                      <path d="M8 8C8 8 8 14 8 18.5C8 22.5 10 25.5 13 25.5C13 25.5 17.5 27 17.5 27L32 32V18C32 8.5 21 4 13 4C8.5 4 5 6.5 4.5 10L8 8Z" fill={logoColor}/>
                      <path d="M20 13L20.5 15L22 15.5L21 17L21.5 19L20 18L18.5 19L19 17L18 15.5L19.5 15L20 13Z" fill={primaryColor}/>
                    </svg>
                  </button>
                </div>
                
                {/* Widget Chat Box */}
                {widgetOpen && (
                  <div 
                    className={`absolute rounded-xl shadow-2xl overflow-hidden`}
                    style={{ 
                      width: '240px',
                      bottom: '60px',
                      right: widgetPosition === 'bottom-right' ? '16px' : 'auto',
                      left: widgetPosition === 'bottom-left' ? '16px' : 'auto',
                      backgroundColor: primaryColor 
                    }}
                  >
                    <div className="p-2 border-b border-black/20 flex items-center gap-2" style={{ backgroundColor: darkerColor }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: messageTextColor }}></div>
                      <span className="font-semibold text-xs" style={{ color: messageTextColor }}>{companyName} Support AI</span>
                    </div>
                    <div className="p-2 space-y-2 min-h-[80px]" style={{ backgroundColor: primaryColor }}>
                      <div className="rounded-lg p-2 text-xs max-w-[90%]" style={{ color: messageTextColor }}>
                        Hi! How can I help you today?
                      </div>
                    </div>
                    <div className="p-2 bg-black/10">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="w-full p-2 rounded text-xs bg-white text-gray-800 border-0"
                        readOnly
                      />
                    </div>
                  </div>
                )}
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
              disabled={!mounted}
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          {mounted ? (
            <pre className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] overflow-x-auto text-sm font-mono whitespace-pre-wrap">
{`<!-- SupportAI Widget -->
${widgetCode}`}
            </pre>
          ) : (
            <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] h-20 flex items-center justify-center text-[var(--text-muted)]">
              Loading embed code...
            </div>
          )}
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
              Test the widget using the settings above
            </li>
          </ol>
        </div>
      </div>
    </Sidebar>
  );
}