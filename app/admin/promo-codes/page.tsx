'use client';

import Link from 'next/link';
import { Tag } from 'lucide-react';

export default function AdminPromoCodes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-moonlight">Promo Codes</h2>
          <p className="text-xs text-stardust/40 mt-1">
            Promo codes are now managed directly in Stripe.
          </p>
        </div>
      </div>

      <div className="card p-8 text-center space-y-4">
        <Tag size={28} className="text-stardust/20 mx-auto mb-2" />
        <p className="text-sm text-stardust/40 max-w-md mx-auto">
          Create and manage coupons and promotion codes from your Stripe Dashboard.
          This keeps all discounts in one place and works seamlessly with your Payment Link.
        </p>
        <Link
          href="https://dashboard.stripe.com/coupons"
          target="_blank"
          rel="noreferrer"
          className="btn-primary !text-xs inline-flex items-center justify-center"
        >
          Open Stripe Coupons
        </Link>
      </div>
    </div>
  );
}
