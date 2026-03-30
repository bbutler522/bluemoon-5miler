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

        const { data: currentRegistration, error: currentError } = await admin
          .from('registrations')
          .select('id, payment_status, bib_number, stripe_payment_intent_id')
          .eq('id', registrationId)
          .maybeSingle();

        if (currentError) throw currentError;
        if (!currentRegistration) {
          throw new Error(
            `No registration row found for completed checkout session. ` +
              `registrationId=${registrationId} sessionId=${session.id}`
          );
        }

        const paymentIntentId = session.payment_intent as string | null;

        // Idempotency: Stripe may retry/replay the same event.
        if (
          currentRegistration.payment_status === 'completed' &&
          (!paymentIntentId ||
            currentRegistration.stripe_payment_intent_id === paymentIntentId)
        ) {
          console.log(`↪️ Registration ${registrationId} already completed, skipping`);
          break;
        }

        let bibToSet = currentRegistration.bib_number;

        // Only allocate a new bib if this runner doesn't have one yet.
        if (!bibToSet) {
          const { data: maxBib, error: maxBibError } = await admin
            .from('registrations')
            .select('bib_number')
            .order('bib_number', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (maxBibError) throw maxBibError;
          bibToSet = (maxBib?.bib_number || 100) + 1;
        }

        const { data: updatedRegistration, error: updateError } = await admin
          .from('registrations')
          .update({
            payment_status: 'completed',
            amount_paid: amountPaid,
            bib_number: bibToSet,
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq('id', registrationId)
          .select('id, bib_number')
          .maybeSingle();

        if (updateError) throw updateError;
        if (!updatedRegistration) {
          throw new Error(
            `Registration update returned no row. registrationId=${registrationId} sessionId=${session.id}`
          );
        }

        console.log(
          `✅ Registration ${registrationId} confirmed — bib #${updatedRegistration.bib_number}`
        );
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const registrationId =
          session.client_reference_id || session.metadata?.registration_id;

        if (registrationId) {
          const { data: updatedRegistration, error: updateError } = await admin
            .from('registrations')
            .update({ payment_status: 'failed' })
            .eq('id', registrationId)
            .select('id')
            .maybeSingle();

          if (updateError) throw updateError;
          if (!updatedRegistration) {
            throw new Error(
              `No registration row found for expired checkout session. ` +
                `registrationId=${registrationId} sessionId=${session.id}`
            );
          }

          console.log(`❌ Registration ${registrationId} expired`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          const { error: updateError } = await admin
            .from('registrations')
            .update({ payment_status: 'refunded' })
            .eq('stripe_payment_intent_id', paymentIntentId);

          if (updateError) throw updateError;

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
      {
        error: 'Webhook processing failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
