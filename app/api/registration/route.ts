import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import { RACE_INFO, SHIRT_PREORDER_PRICE, PROMO_DISCOUNT } from '@/lib/constants';

const VALID_PROMO_CODE = process.env.PROMO_CODE || '';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const admin = createAdminSupabase();
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
      shirt_preorder,
      promo_code,
    } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // If shirt is pre-ordered, a size is required
    if (shirt_preorder && !shirt_size) {
      return NextResponse.json(
        { error: 'Please select a shirt size to add the pre-order.' },
        { status: 400 }
      );
    }

    // Validate promo code server-side
    const promoValid =
      VALID_PROMO_CODE.length > 0 &&
      typeof promo_code === 'string' &&
      promo_code.trim().toUpperCase() === VALID_PROMO_CODE.toUpperCase();
    const entryPrice = promoValid
      ? RACE_INFO.price - PROMO_DISCOUNT
      : RACE_INFO.price;

    // Check for existing completed registration
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
      shirt_size: shirt_preorder ? (shirt_size || null) : null,
      shirt_preorder: !!shirt_preorder,
      payment_status: 'pending',
    };

    let registrationId: string;

    if (existingReg) {
      await admin
        .from('registrations')
        .update(registrationData)
        .eq('id', existingReg.id);
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

    // === DEMO MODE ===
    if (isDemo) {
      const { data: maxBib } = await admin
        .from('registrations')
        .select('bib_number')
        .order('bib_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextBib = (maxBib?.bib_number || 100) + 1;
      const totalAmount = entryPrice + (shirt_preorder ? SHIRT_PREORDER_PRICE : 0);

      await admin
        .from('registrations')
        .update({
          payment_status: 'completed',
          bib_number: nextBib,
          amount_paid: totalAmount,
        })
        .eq('id', registrationId);

      return NextResponse.json({ demo: true, redirect: '/dashboard?payment=success' });
    }

    // === LIVE MODE — create a Stripe Checkout Session ===
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured.' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';

    const lineItems: any[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Blue Moon 5 Miler — Race Entry',
            description: `Sunday, May 31st · Prospect Park · 8:00 PM${promoValid ? ' (promo applied)' : ''}`,
          },
          unit_amount: Math.round(entryPrice * 100),
        },
        quantity: 1,
      },
    ];

    if (shirt_preorder) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Blue Moon 5 Miler — T-Shirt Pre-Order',
            description: `Size: ${shirt_size}`,
          },
          unit_amount: Math.round(SHIRT_PREORDER_PRICE * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      client_reference_id: registrationId,
      customer_email: email,
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/register?cancelled=true`,
      metadata: {
        registration_id: registrationId,
        shirt_preorder: shirt_preorder ? 'true' : 'false',
        promo_applied: promoValid ? 'true' : 'false',
      },
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
