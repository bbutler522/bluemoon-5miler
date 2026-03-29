import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import { RACE_INFO, SHIRT_PREORDER_PRICE, RACE_CAPACITY } from '@/lib/constants';
import { resolvePromo } from '@/app/api/validate-promo/route';

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

    if (shirt_preorder && !shirt_size) {
      return NextResponse.json(
        { error: 'Please select a shirt size to add the pre-order.' },
        { status: 400 }
      );
    }

    // Resolve promo code — supports multiple codes with different discount tiers
    const promo = resolvePromo(typeof promo_code === 'string' ? promo_code : '');
    const entryPrice = Math.max(0, RACE_INFO.price - promo.discount);
    const shirtTotal = shirt_preorder ? SHIRT_PREORDER_PRICE : 0;
    const total = entryPrice + shirtTotal;

    // Check for existing registration by this user
    const { data: existingReg } = await admin
      .from('registrations')
      .select('id, payment_status, waitlisted')
      .eq('user_id', user.id)
      .in('payment_status', ['pending', 'completed'])
      .maybeSingle();

    if (existingReg?.payment_status === 'completed') {
      return NextResponse.json(
        { error: 'You are already registered for this race' },
        { status: 400 }
      );
    }

    if (existingReg?.waitlisted) {
      return NextResponse.json(
        { error: "You're already on the waitlist. We'll be in touch if a spot opens up." },
        { status: 400 }
      );
    }

    // Count confirmed registrations to check capacity
    const { count: confirmedCount } = await admin
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'completed')
      .eq('waitlisted', false);

    const isFull = (confirmedCount ?? 0) >= RACE_CAPACITY;

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
      waitlisted: isFull,
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

    // === WAITLIST PATH ===
    if (isFull) {
      return NextResponse.json({ waitlisted: true });
    }

    // === FREE PATH — total is $0, skip Stripe entirely ===
    // This happens when a club member uses the free code and doesn't add a shirt.
    const completeForFree = async () => {
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
          bib_number: nextBib,
          amount_paid: 0,
        })
        .eq('id', registrationId);
    };

    // === DEMO MODE ===
    if (isDemo) {
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
          bib_number: nextBib,
          amount_paid: total,
        })
        .eq('id', registrationId);

      return NextResponse.json({ demo: true, redirect: '/dashboard?payment=success' });
    }

    if (total === 0) {
      await completeForFree();
      return NextResponse.json({ free: true, redirect: '/dashboard?payment=success' });
    }

    // === LIVE MODE — create a Stripe Checkout Session ===
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured.' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';

    const lineItems: any[] = [];

    // Only add race entry line item if it has a cost
    if (entryPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Blue Moon 5 Miler — Race Entry',
            description: `Sunday, May 31st · Prospect Park · 8:00 PM${promo.valid ? ' (promo applied)' : ''}`,
          },
          unit_amount: Math.round(entryPrice * 100),
        },
        quantity: 1,
      });
    }

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
      // Only show Stripe promo code field if no code was applied on our form
      allow_promotion_codes: !promo.valid,
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/register?cancelled=true`,
      metadata: {
        registration_id: registrationId,
        shirt_preorder: shirt_preorder ? 'true' : 'false',
        promo_applied: promo.valid ? 'true' : 'false',
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
