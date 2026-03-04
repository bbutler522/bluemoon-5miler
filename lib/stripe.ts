import Stripe from 'stripe';

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const RACE_PRICE_CENTS = parseInt(
  process.env.NEXT_PUBLIC_RACE_PRICE_CENTS || '5000',
  10
);

// Only initialize Stripe if not in demo mode and key exists
let stripeInstance: Stripe | null = null;

if (!DEMO_MODE && process.env.STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
    typescript: true,
  });
}

export const stripe = stripeInstance;

export async function createPaymentIntent(
  amountCents: number,
  metadata: Record<string, string>
) {
  if (!stripe) throw new Error('Stripe is not configured');
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  if (!stripe) throw new Error('Stripe is not configured');
  return stripe.paymentIntents.retrieve(paymentIntentId);
}
