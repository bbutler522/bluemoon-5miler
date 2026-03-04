import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { stripe, RACE_PRICE_CENTS, DEMO_MODE } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const admin = createAdminSupabase();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      date_of_birth,
      gender,
      shirt_size,
      promo_code,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check for existing registration
    const { data: existingReg } = await admin
      .from('registrations')
      .select('id, payment_status')
      .eq('user_id', user.id)
      .in('payment_status', ['pending', 'completed'])
      .maybeSingle();

    if (existingReg?.payment_status === 'completed') {
      return NextResponse.json(
        { error: 'You are already registered for this race' },
        { status: 400 }
      );
    }

    // Calculate price with promo code
    let amountCents = RACE_PRICE_CENTS;
    let promoCodeId = null;

    if (promo_code) {
      const { data: promo } = await admin
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (promo) {
        const now = new Date();
        const validFrom = promo.valid_from ? new Date(promo.valid_from) : null;
        const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;

        const isTimeValid =
          (!validFrom || now >= validFrom) &&
          (!validUntil || now <= validUntil);

        const hasUsesLeft =
          promo.max_uses === null || promo.current_uses < promo.max_uses;

        if (isTimeValid && hasUsesLeft) {
          promoCodeId = promo.id;

          if (promo.discount_type === 'percentage') {
            amountCents = Math.round(
              amountCents * (1 - promo.discount_value / 100)
            );
          } else {
            amountCents = Math.max(0, amountCents - promo.discount_value * 100);
          }
        }
      }
    }

    amountCents = Math.max(amountCents, 100);

    // ──────────────────────────────────────────────
    // DEMO MODE: skip Stripe, auto-confirm
    // ──────────────────────────────────────────────
    if (DEMO_MODE) {
      const registrationData = {
        user_id: user.id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        shirt_size: shirt_size || null,
        promo_code_id: promoCodeId,
        amount_paid: amountCents / 100,
        payment_status: 'completed',
        stripe_payment_intent_id: `demo_${Date.now()}`,
      };

      if (existingReg) {
        await admin
          .from('registrations')
          .update(registrationData)
          .eq('id', existingReg.id);
      } else {
        const { error: insertError } = await admin
          .from('registrations')
          .insert(registrationData);

        if (insertError) throw insertError;
      }

      // Increment promo code usage in demo mode too
      if (promoCodeId) {
        const { data: promo } = await admin
          .from('promo_codes')
          .select('current_uses')
          .eq('id', promoCodeId)
          .single();

        if (promo) {
          await admin
            .from('promo_codes')
            .update({ current_uses: (promo.current_uses || 0) + 1 })
            .eq('id', promoCodeId);
        }
      }

      // Return a flag so the frontend knows to redirect directly
      return NextResponse.json({ demo: true, redirect: '/dashboard?payment=success' });
    }

    // ──────────────────────────────────────────────
    // LIVE MODE: use Stripe Checkout
    // ──────────────────────────────────────────────
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Set STRIPE_SECRET_KEY or enable DEMO_MODE.' },
        { status: 500 }
      );
    }

    const registrationData = {
      user_id: user.id,
      first_name,
      last_name,
      email,
      phone: phone || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      shirt_size: shirt_size || null,
      promo_code_id: promoCodeId,
      amount_paid: amountCents / 100,
      payment_status: 'pending',
    };

    let registrationId: string;

    if (existingReg) {
      const { error: updateError } = await admin
        .from('registrations')
        .update(registrationData)
        .eq('id', existingReg.id);

      if (updateError) throw updateError;
      registrationId = existingReg.id;
    } else {
      const { data: newReg, error: insertError } = await admin
        .from('registrations')
        .insert(registrationData)
        .select('id')
        .single();

      if (insertError) throw insertError;
      registrationId = newReg.id;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Blue Moon 5 Miler — Race Entry',
              description: `Registration for ${first_name} ${last_name}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        registration_id: registrationId,
        user_id: user.id,
        promo_code_id: promoCodeId || '',
      },
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/register?payment=cancelled`,
    });

    await admin
      .from('registrations')
      .update({ stripe_payment_intent_id: session.id })
      .eq('id', registrationId);

    return NextResponse.json({ checkout_url: session.url });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
