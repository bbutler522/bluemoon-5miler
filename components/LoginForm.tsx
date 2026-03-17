'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Moon } from '@/components/Moon';
import MagicLinkForm from '@/components/MagicLinkForm';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/register';

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-20">
      <div className="w-full max-w-sm">
        {/* Moon icon */}
        <div className="mx-auto w-16 h-16 mb-8">
          <Moon />
        </div>

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