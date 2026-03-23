'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';

// This page only works in development. In production, notFound() is called
// server-side via a separate check — but as a safety net we also guard client-side.
export default function DevLoginPage() {
  // Extra client-side guard (the API route also blocks in production)
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [email, setEmail] = useState('bbutler522@gmail.com');
  const [redirect, setRedirect] = useState('/dashboard');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLink('');
    setError('');

    const res = await fetch('/api/dev-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirect }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
    } else {
      setLink(data.link);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md card p-8">
        {/* Banner */}
        <div className="mb-6 px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-center">
          <p className="text-xs font-mono text-yellow-300 font-semibold">DEV MODE — LOCAL ONLY</p>
          <p className="text-xs text-yellow-300/70 mt-0.5">Generates a magic link without sending email</p>
        </div>

        <h2 className="font-display text-2xl text-moonlight text-center mb-6">Dev Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="label-field">Redirect after login</label>
            <input
              type="text"
              value={redirect}
              onChange={(e) => setRedirect(e.target.value)}
              className="input-field"
              placeholder="/dashboard"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating…' : 'Generate magic link'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {link && (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-stardust/60 text-center">Click the link below to sign in:</p>
            <a
              href={link}
              className="block text-center btn-primary"
            >
              Sign in as {email} →
            </a>
            <details className="text-xs text-stardust/40">
              <summary className="cursor-pointer hover:text-stardust/60 transition-colors">
                Show raw link
              </summary>
              <p className="mt-2 break-all font-mono text-[10px] bg-midnight-900/60 p-2 rounded-lg border border-lunar-400/10">
                {link}
              </p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
