import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Stripe is only needed for webhook verification now
// In demo mode, we don't need it at all
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

export const PAYMENT_LINK_URL =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || '';
