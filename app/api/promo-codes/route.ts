import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-server';
import { RACE_PRICE_CENTS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Please enter a promo code' },
        { status: 400 }
      );
    }

    const admin = createAdminSupabase();

    const { data: promo, error } = await admin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !promo) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid promo code',
      });
    }

    // Check time validity
    const now = new Date();
    if (promo.valid_from && now < new Date(promo.valid_from)) {
      return NextResponse.json({
        valid: false,
        message: 'This code is not yet active',
      });
    }
    if (promo.valid_until && now > new Date(promo.valid_until)) {
      return NextResponse.json({
        valid: false,
        message: 'This code has expired',
      });
    }

    // Check usage limit
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({
        valid: false,
        message: 'This code has reached its usage limit',
      });
    }

    // Calculate discount
    const basePriceDollars = RACE_PRICE_CENTS / 100;
    let discountAmount: number;
    let finalPrice: number;

    if (promo.discount_type === 'percentage') {
      discountAmount = basePriceDollars * (promo.discount_value / 100);
      finalPrice = basePriceDollars - discountAmount;
    } else {
      discountAmount = promo.discount_value;
      finalPrice = Math.max(1, basePriceDollars - discountAmount);
    }

    const label =
      promo.discount_type === 'percentage'
        ? `${promo.discount_value}% off`
        : `$${promo.discount_value} off`;

    return NextResponse.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      final_price: Math.round(finalPrice * 100) / 100,
      message: `${label} applied! New price: $${finalPrice.toFixed(2)}`,
    });
  } catch (error: any) {
    console.error('Promo code error:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to validate code' },
      { status: 500 }
    );
  }
}
