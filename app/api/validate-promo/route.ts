import { NextRequest, NextResponse } from 'next/server';
import { PROMO_DISCOUNT } from '@/lib/constants';

// The actual promo code string lives in an env var so it never ships in the client bundle.
const VALID_PROMO_CODE = process.env.PROMO_CODE || '';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false });
  }

  const valid =
    VALID_PROMO_CODE.length > 0 &&
    code.trim().toUpperCase() === VALID_PROMO_CODE.toUpperCase();

  return NextResponse.json({ valid, discount: valid ? PROMO_DISCOUNT : 0 });
}
