'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';

function isRateLimitedOtp(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 429) return true;
  const m = (e.message || '').toLowerCase();
  return m.includes('rate') || m.includes('too many') || m.includes('429');
}

function otpFriendlyMessage(err: unknown): string {
  if (isRateLimitedOtp(err)) {
    return 'Too many sign-in emails were sent from this browser or for this address. Please wait a few minutes before trying again, and check your spam or promotions folder for a link you may already have.';
  }
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Something went wrong';
}

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
  const [resendCooldown, setResendCooldown] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (resendCooldown > 0) return;
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
    } catch (err: unknown) {
      setError(otpFriendlyMessage(err));
      if (isRateLimitedOtp(err)) {
        setResendCooldown(90);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <h2 className="font-display text-2xl text-moonlight text-center mb-2">
        {title}
      </h2>
      <p className="text-sm text-stardust/100 text-center mb-6">{subtitle}</p>

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
          disabled={loading || resendCooldown > 0}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={16} className="animate-spin mr-2" />}
          {resendCooldown > 0 ? `Wait ${resendCooldown}s to resend` : 'Send magic link'}
        </button>
      </form>
    </div>
  );
}
