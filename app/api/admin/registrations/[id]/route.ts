import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminSupabase();

  const { data: registration, error } = await admin
    .from('registrations')
    .select('*, promo_codes(code, discount_type, discount_value)')
    .eq('id', params.id)
    .single();

  if (error || !registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  return NextResponse.json({ registration });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const admin = createAdminSupabase();
  const body = await request.json();

  // Only allow updating certain fields
  const allowedFields = [
    'payment_status',
    'bib_number',
    'shirt_size',
    'first_name',
    'last_name',
    'email',
    'phone',
    'emergency_contact_name',
    'emergency_contact_phone',
  ];

  const updates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('registrations')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ registration: data });
}
