'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { updateUserPlan, getPlans, Plan } from '@/app/actions';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  created_at: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [companyName, setCompanyName] = useState('My Company');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');
  const [allowedDomains, setAllowedDomains] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('supportai_current_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    // Load plans
    getPlans().then(setPlans);
  }, []);

  const handleSave = async (plan?: string) => {
    if (!user) {
      setMessage({ text: 'You must be logged in', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const selectedPlan = (plan || user.plan) as 'free' | 'basic' | 'pro' | 'enterprise';
      const result = await updateUserPlan(user.id, selectedPlan);
      if (result.success) {
        if (plan) {
          const updatedUser = { ...user, plan };
          setUser(updatedUser);
          localStorage.setItem('supportai_current_user', JSON.stringify(updatedUser));
        }
        setMessage({ text: plan ? `Upgraded to ${plan} plan successfully!` : 'Settings saved!', type: 'success' });
      } else {
        setMessage({ text: result.error || 'Failed to update', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleBrandingSave = () => {
    localStorage.setItem('supportai_company', companyName);
    localStorage.setItem('supportai_color', primaryColor);
    localStorage.setItem('supportai_position', widgetPosition);
    localStorage.setItem('supportai_domains', allowedDomains);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getPlanButton = (plan: Plan) => {
    const isCurrent = user?.plan === plan.name;
    const isEnterprise = plan.is_enterprise;
    const isPro = plan.name === 'pro';

    if (isCurrent) {
      return (
        <button disabled className="w-full py-2 rounded-lg bg-green-900/30 text-green-400 text-sm cursor-default">
          Current Plan
        </button>
      );
    }

    if (isEnterprise) {
      return (
        <button
          onClick={() => handleSave('enterprise')}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50"
        >
          {user?.plan === 'pro' ? 'Upgrade to Enterprise' : 'Contact Sales'}
        </button>
      );
    }

    return (
      <button
        onClick={() => handleSave(plan.name)}
        disabled={loading || (isEnterprise && user?.plan !== 'enterprise')}
        className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          isPro
            ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-primary)]'
        }`}
      >
        {user?.plan === 'enterprise' ? 'Downgrade' : 'Upgrade'} to {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
      </button>
    );
  };

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto p-6">
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
{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget.js"></script>`}
          </pre>
        </div>

        {/* Subscription Plans */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Subscription Plan</h3>
          {plans.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No plans available</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = user?.plan === plan.name;
                return (
                  <div
                    key={plan.name}
                    className={`p-6 rounded-2xl border ${
                      isCurrent ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]' : 'border-[var(--border)]'
                    } ${plan.name === 'pro' && !isCurrent ? 'relative' : ''}`}
                  >
                    {plan.name === 'pro' && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--accent-primary)] text-white text-xs rounded-full">
                        Popular
                      </div>
                    )}
                    <h4 className="text-lg font-semibold mb-2 capitalize">{plan.name}</h4>
                    {plan.price !== null ? (
                      <>
                        <p className="text-3xl font-bold mb-1">${plan.price}</p>
                        <p className="text-sm text-[var(--text-muted)] mb-4">per {plan.interval}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold mb-1">Custom</p>
                        <p className="text-sm text-[var(--text-muted)] mb-4">contact sales</p>
                      </>
                    )}
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)] mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {getPlanButton(plan)}
                  </div>
                );
              })}
            </div>
          )}
          {message && (
            <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
          {user?.plan === 'enterprise' && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              For Enterprise custom pricing, contact sales@supportai.com
            </p>
          )}
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBrandingSave}
            className="py-3 px-6 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Sidebar>
  );
}