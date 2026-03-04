import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Demo mode — no webhooks needed
  if (!stripe) {
    return NextResponse.json({ received: true });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Payment Links use client_reference_id (not metadata)
        const registrationId = session.client_reference_id;

        if (!registrationId) {
          console.warn('No client_reference_id on session', session.id);
          break;
        }

        // Get the actual amount paid (accounts for promo codes)
        const amountPaid = (session.amount_total || 5000) / 100;

        // Assign next bib number
        const { data: maxBib } = await admin
          .from('registrations')
          .select('bib_number')
          .order('bib_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextBib = (maxBib?.bib_number || 100) + 1;

        await admin
          .from('registrations')
          .update({
            payment_status: 'completed',
            amount_paid: amountPaid,
            bib_number: nextBib,
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', registrationId);

        console.log(`✅ Registration ${registrationId} confirmed — bib #${nextBib}`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const registrationId = session.client_reference_id;

        if (registrationId) {
          await admin
            .from('registrations')
            .update({ payment_status: 'failed' })
            .eq('id', registrationId);

          console.log(`❌ Registration ${registrationId} expired`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          await admin
            .from('registrations')
            .update({ payment_status: 'refunded' })
            .eq('stripe_payment_intent_id', paymentIntentId);

          console.log(`↩️ Refund processed for PI ${paymentIntentId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
