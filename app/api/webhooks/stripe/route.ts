import { NextRequest, NextResponse } from 'next/server';
import { stripe, DEMO_MODE } from '@/lib/stripe';
import { createAdminSupabase } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // In demo mode, webhooks aren't used
  if (DEMO_MODE || !stripe) {
    return NextResponse.json({ received: true, demo: true });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe!.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const admin = createAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { registration_id, promo_code_id } = session.metadata || {};

        if (!registration_id) {
          console.error('No registration_id in session metadata');
          break;
        }

        // Update registration to completed
        const { error: updateError } = await admin
          .from('registrations')
          .update({
            payment_status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: (session.amount_total || 0) / 100,
          })
          .eq('id', registration_id);

        if (updateError) {
          console.error('Failed to update registration:', updateError);
          throw updateError;
        }

        // Increment promo code usage
        if (promo_code_id) {
          await admin.rpc('increment_promo_usage', {
            promo_id: promo_code_id,
          });

          // Fallback if RPC doesn't exist yet: manual increment
          const { data: promo } = await admin
            .from('promo_codes')
            .select('current_uses')
            .eq('id', promo_code_id)
            .single();

          if (promo) {
            await admin
              .from('promo_codes')
              .update({ current_uses: (promo.current_uses || 0) + 1 })
              .eq('id', promo_code_id);
          }
        }

        console.log(`✅ Registration ${registration_id} confirmed`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { registration_id } = session.metadata || {};

        if (registration_id) {
          await admin
            .from('registrations')
            .update({ payment_status: 'failed' })
            .eq('id', registration_id);

          console.log(`❌ Registration ${registration_id} expired`);
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
