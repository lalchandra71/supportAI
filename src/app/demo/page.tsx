'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { sendMessage, Message } from '../actions';

const DEMO_KNOWLEDGE = [
  { q: 'What is your refund policy?', a: 'We offer a 30-day money-back guarantee. If you are not satisfied, contact support within 30 days for a full refund.' },
  { q: 'How do I reset my password?', a: 'Go to Settings → Security → Reset Password. You will receive an email to confirm the change.' },
  { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, and PayPal. All payments are processed securely.' },
  { q: 'How do I upgrade my plan?', a: 'Go to Settings → Subscription → Choose Plan. Pro starts at $29/month with unlimited everything.' },
  { q: 'Do you offer enterprise plans?', a: 'Yes! Contact sales@supportai.com for custom enterprise pricing with SSO, dedicated support, and custom integrations.' },
];

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I\'m the SupportAI demo. Try asking me about:\n\n• Refund policy\n• Password reset\n• Payment methods\n• Upgrading your plan\n\nOr type anything to test the AI!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function findAnswer(question: string): string | null {
    const lower = question.toLowerCase();
    for (const item of DEMO_KNOWLEDGE) {
      if (lower.includes(item.q.toLowerCase().split(' ')[0]) || item.q.toLowerCase().split(' ').some(w => lower.includes(w))) {
        return item.a;
      }
    }
    return null;
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const result = await sendMessage(userMessage, messages.slice(-4));
      
      if (result.error) {
        const demoAnswer = findAnswer(userMessage);
        if (demoAnswer) {
          setMessages(prev => [...prev, { role: 'assistant', content: demoAnswer + '\n\n💡 This is a demo answer from our knowledge base.' }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'In full mode, I would search your knowledge base. Try asking about refund policy, password reset, or pricing.' }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      }
    } catch {
      const demoAnswer = findAnswer(userMessage);
      if (demoAnswer) {
        setMessages(prev => [...prev, { role: 'assistant', content: demoAnswer + '\n\n💡 This is a demo answer.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Demo mode: Connect your API and knowledge base for full AI responses.\n\nTry asking about "refund", "password", or "upgrade".' }]);
      }
    }
    
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header />
      <div className="max-w-2xl mx-auto p-6 flex-1">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Demo</h1>
          <p className="text-[var(--text-secondary)]">Test the AI support agent without signing up</p>
        </div>

        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden card-shadow">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-[var(--text-muted)] ml-2">SupportAI Demo</span>
          </div>
          
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-sm whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-[var(--user-bubble)] text-white' : 'bg-[var(--ai-bubble)]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--ai-bubble)] rounded-xl p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-dot"></span>
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-dot" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-dot" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
            
            <div className="p-3 border-t border-[var(--border)] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-4 rounded-xl bg-[var(--accent-primary)] text-white disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[var(--text-secondary)] text-sm">
            Like what you see?{' '}
            <Link href="/login" className="text-[var(--accent-primary)] hover:underline">Create free account</Link>
            {' '}to set up your own AI support agent
          </p>
        </div>
      </div>
    </div>
  );
}