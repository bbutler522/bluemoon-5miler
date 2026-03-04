import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabase();

  const { data: registration } = await admin
    .from('registrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
    },
    registration,
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabase();
  const body = await request.json();

  // Allow updating limited registration fields
  const allowedFields = [
    'first_name',
    'last_name',
    'phone',
    'emergency_contact_name',
    'emergency_contact_phone',
    'shirt_size',
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
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also update Supabase user metadata if name changed
  if (body.first_name || body.last_name) {
    const fullName = `${body.first_name || data.first_name} ${body.last_name || data.last_name}`;
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
  }

  return NextResponse.json({ registration: data });
}
