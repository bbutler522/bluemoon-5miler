'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Moon } from '@/components/Moon';
import MagicLinkForm from '@/components/MagicLinkForm';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/register';
  const [authLinkMessage, setAuthLinkMessage] = useState('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authErr = params.get('auth_error');
      if (authErr === 'missing_code') {
        setAuthLinkMessage(
          'That sign-in link was incomplete or expired. Request a new magic link below.'
        );
      } else if (authErr === 'exchange') {
        setAuthLinkMessage(
          'We could not finish signing you in. Open the magic link in the same browser where you entered your email, or request a fresh link.'
        );
      }
      if (authErr) {
        const clean = new URL(window.location.href);
        clean.searchParams.delete('auth_error');
        window.history.replaceState({}, '', clean.pathname + clean.search);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-20">
      <div className="w-full max-w-sm">
        {/* Moon icon */}
        <div className="mx-auto w-16 h-16 mb-8">
          <Moon />
        </div>

        {authLinkMessage && (
          <p className="text-xs text-amber-300/90 bg-amber-400/10 border border-amber-400/25 rounded-lg px-3 py-2 mb-4">
            {authLinkMessage}
          </p>
        )}
        <MagicLinkForm
          redirectTo={redirect}
          subtitle="Enter your email and we&apos;ll send you a secure link to register for the Blue Moon 5 Miler and access your dashboard."
        />

        <p className="text-center text-[11px] text-stardust/40 mt-6">
          No passwords, no accounts to remember — just a secure link sent to your inbox.
        </p>
      </div>
    </section>
  );
}