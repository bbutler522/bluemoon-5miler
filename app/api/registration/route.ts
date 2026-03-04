import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { PAYMENT_LINK_URL } from '@/lib/stripe';

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
    } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

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

    // Build registration data (no more promo code logic — Stripe handles it)
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

      await admin
        .from('registrations')
        .update({
          payment_status: 'completed',
          bib_number: nextBib,
          amount_paid: 50,
        })
        .eq('id', registrationId);

      return NextResponse.json({ demo: true, redirect: '/dashboard?payment=success' });
    }

    // === LIVE MODE — just return the Payment Link URL ===
    // client_reference_id ties the Stripe payment back to our registration
    const checkoutUrl = `${PAYMENT_LINK_URL}?client_reference_id=${registrationId}&prefilled_email=${encodeURIComponent(email)}`;

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
