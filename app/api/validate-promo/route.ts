import { NextRequest, NextResponse } from 'next/server';
import { resolvePromo } from '@/lib/promo';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, discount: 0, free: false });
  }

  return NextResponse.json(resolvePromo(code));
}
