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

        // We correlate Stripe → registration using either:
        // - `client_reference_id` (set when we create Checkout Sessions)
        // - `metadata.registration_id` (more reliable across Stripe flows, incl Payment Links)
        const registrationId =
          session.client_reference_id || session.metadata?.registration_id;

        if (!registrationId) {
          console.warn(
            'No registration id on session (client_reference_id or metadata.registration_id)',
            session.id
          );
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

        const { data: updatedRows, error: updateError } = await admin
          .from('registrations')
          .update({
            payment_status: 'completed',
            amount_paid: amountPaid,
            bib_number: nextBib,
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', registrationId);

        if (updateError) throw updateError;

        // If we didn't match a row, something is wrong with our correlation key.
        if (!updatedRows || updatedRows.length === 0) {
          console.error(
            'Webhook could not find registration to update',
            JSON.stringify(
              {
                registrationId,
                sessionId: session.id,
                client_reference_id: session.client_reference_id,
                metadata_registration_id: session.metadata?.registration_id,
              },
              null,
              2
            )
          );
        }

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
