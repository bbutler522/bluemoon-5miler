'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';

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
  title = 'Sign in to continue',
  subtitle = "Enter your email and we'll send you a 6-digit code.",
  className,
  onSent,
  initialEmail = '',
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Focus the code input when the code step appears
  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  async function sendCode(targetEmail: string) {
    const origin = window.location.origin;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        // Magic link in the email still works for non-incognito users
        emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (otpError) throw otpError;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendCode(email);
      setStep('code');
      setResendCountdown(60);
      onSent?.(email);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'email',
      });
      if (verifyError) throw verifyError;
      // Session is now set in this window — navigate to destination
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid code — please check and try again.');
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCountdown > 0) return;
    setError('');
    setCode('');
    try {
      await sendCode(email);
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Could not resend code');
    }
  }

  // ── Email step ─────────────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className={className}>
        <h2 className="font-display text-2xl text-moonlight text-center mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-stardust/80 text-center mb-6">{subtitle}</p>}

        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin mr-2" />}
            Send code
          </button>
        </form>
      </div>
    );
  }

  // ── Code step ──────────────────────────────────────────────────────────────
  return (
    <div className={className}>
      <div className="text-center mb-6">
        <div className="mx-auto w-10 h-10 rounded-full bg-lunar-400/10 flex items-center justify-center mb-3">
          <MailCheck size={18} className="text-moonlight" />
        </div>
        <h2 className="font-display text-2xl text-moonlight mb-1">Check your email</h2>
        <p className="text-sm text-stardust/70">
          We sent a 6-digit code to{' '}
          <span className="text-moonlight">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <label className="label-field">6-digit code</label>
          <input
            ref={codeInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input-field text-center font-mono text-xl tracking-[0.4em]"
            placeholder="——————"
            required
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={16} className="animate-spin mr-2" />}
          Verify code
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-stardust/40">
        <button
          type="button"
          onClick={() => { setStep('email'); setCode(''); setError(''); }}
          className="flex items-center gap-1 hover:text-stardust/70 transition-colors"
        >
          <ArrowLeft size={12} /> Change email
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0}
          className="hover:text-stardust/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
}
