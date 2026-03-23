'use client';

import * as React from 'react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';

type Props = {
  redirectTo: string;
  title?: string;
  subtitle?: string;
  className?: string;
  onSent?: (email: string) => void;
  initialEmail?: string;
};

export default function MagicLinkForm({
  redirectTo,
  title = 'Get a magic link',
  subtitle = "Enter your email and we'll send you a secure link.",
  className,
  onSent,
  initialEmail = '',
}: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
            redirectTo
          )}`,
        },
      });

      if (otpError) throw otpError;

      setMessage('Check your email for the magic link to continue.');
      onSent?.(email);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <h2 className="font-display text-2xl text-moonlight text-center mb-1">
        {title}
      </h2>
      <p className="text-xs text-stardust/80 text-center mb-6">{subtitle}</p>

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

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {message && (
          <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={16} className="animate-spin mr-2" />}
          Send magic link
        </button>
      </form>
    </div>
  );
}

