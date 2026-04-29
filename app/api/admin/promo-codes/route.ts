import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  return createAdminSupabase();
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: promoCodes, error } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: regs, error: regError } = await admin
    .from('registrations')
    .select('promo_code_used, payment_status')
    .not('promo_code_used', 'is', null);

  if (regError) {
    return NextResponse.json({ error: regError.message }, { status: 500 });
  }

  const usageMap: Record<string, number> = {};
  (regs || []).forEach((r) => {
    if (!r.promo_code_used || r.payment_status !== 'completed') return;
    const key = String(r.promo_code_used).toUpperCase();
    usageMap[key] = (usageMap[key] || 0) + 1;
  });

  const rows = (promoCodes || []).map((promo) => ({
    ...promo,
    current_uses: usageMap[promo.code] || 0,
  }));

  return NextResponse.json({ promoCodes: rows });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const code = typeof body.code === 'string' ? normalizeCode(body.code) : '';
  const discountType = body.discount_type === 'percentage' ? 'percentage' : 'fixed';
  const discountValue = Number(body.discount_value);
  const maxUses =
    body.max_uses === null || body.max_uses === undefined || body.max_uses === ''
      ? null
      : Number(body.max_uses);
  const isActive = body.is_active !== false;
  const validFrom = body.valid_from ? String(body.valid_from) : null;
  const validUntil = body.valid_until ? String(body.valid_until) : null;

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
  }
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
    return NextResponse.json({ error: 'Max uses must be a positive whole number' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('promo_codes')
    .insert({
      code,
      discount_type: discountType,
      discount_value: discountValue,
      max_uses: maxUses,
      is_active: isActive,
      valid_from: validFrom,
      valid_until: validUntil,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promoCode: { ...data, current_uses: 0 } });
}
