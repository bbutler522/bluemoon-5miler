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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.code !== undefined) {
    if (typeof body.code !== 'string' || !body.code.trim()) {
      return NextResponse.json({ error: 'Code must be a non-empty string' }, { status: 400 });
    }
    updates.code = normalizeCode(body.code);
  }
  if (body.discount_type !== undefined) {
    if (body.discount_type !== 'fixed' && body.discount_type !== 'percentage') {
      return NextResponse.json({ error: 'Invalid discount type' }, { status: 400 });
    }
    updates.discount_type = body.discount_type;
  }
  if (body.discount_value !== undefined) {
    const value = Number(body.discount_value);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }
    updates.discount_value = value;
  }
  if (body.max_uses !== undefined) {
    if (body.max_uses === null || body.max_uses === '') {
      updates.max_uses = null;
    } else {
      const maxUses = Number(body.max_uses);
      if (!Number.isInteger(maxUses) || maxUses <= 0) {
        return NextResponse.json(
          { error: 'Max uses must be a positive whole number or null' },
          { status: 400 }
        );
      }
      updates.max_uses = maxUses;
    }
  }
  if (body.is_active !== undefined) {
    updates.is_active = !!body.is_active;
  }
  if (body.valid_from !== undefined) {
    updates.valid_from = body.valid_from ? String(body.valid_from) : null;
  }
  if (body.valid_until !== undefined) {
    updates.valid_until = body.valid_until ? String(body.valid_until) : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('promo_codes')
    .update(updates)
    .eq('id', params.id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
  }

  return NextResponse.json({ promoCode: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { error } = await admin
    .from('promo_codes')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
