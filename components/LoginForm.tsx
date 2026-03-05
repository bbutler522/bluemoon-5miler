'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Moon } from '@/components/Moon';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/register';
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
          emailRedirectTo: `${window.location.origin}${redirect}`,
        },
      });

      if (otpError) throw otpError;

      setMessage(
        'Check your email for a magic link. It will log you in and take you to your registration.'
      );
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-20">
      <div className="w-full max-w-sm">
        {/* Moon icon */}
        <div className="mx-auto w-16 h-16 mb-8">
          <Moon />
        </div>

        <h1 className="font-display text-2xl text-moonlight text-center mb-1">
          Get a magic link
        </h1>
        <p className="text-xs text-stardust/40 text-center mb-8">
          Enter your email and we&apos;ll send you a secure link to register for the Blue Moon 5 Miler and access your dashboard.
        </p>

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

        <p className="text-center text-[11px] text-stardust/40 mt-6">
          No passwords, no accounts to remember — just a secure link sent to your inbox.
        </p>
      </div>
    </section>
  );
}