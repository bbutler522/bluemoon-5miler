import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminSupabase();

  const { data, error } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promoCodes: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminSupabase();
  const body = await request.json();

  const { code, discount_type, discount_value, max_uses, valid_from, valid_until } = body;

  if (!code || !discount_type || discount_value === undefined) {
    return NextResponse.json(
      { error: 'Code, discount_type, and discount_value are required' },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from('promo_codes')
    .insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value,
      max_uses: max_uses || null,
      valid_from: valid_from || null,
      valid_until: valid_until || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A code with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promoCode: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminSupabase();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Promo code ID is required' }, { status: 400 });
  }

  const allowedFields = ['is_active', 'max_uses', 'valid_from', 'valid_until', 'discount_value'];
  const filtered: Record<string, any> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }

  const { data, error } = await admin
    .from('promo_codes')
    .update(filtered)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promoCode: data });
}
