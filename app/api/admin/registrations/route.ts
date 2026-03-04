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
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let query = admin
    .from('registrations')
    .select('*, promo_codes(code)', { count: 'exact' });

  // Filter by status
  if (status && status !== 'all') {
    query = query.eq('payment_status', status);
  }

  // Search by name or email
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  // Sort
  const ascending = order === 'asc';
  query = query.order(sort, { ascending });

  // Paginate
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data: registrations, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten promo code join
  const formatted = (registrations || []).map((r: any) => ({
    ...r,
    promo_code: r.promo_codes?.code || null,
    promo_codes: undefined,
  }));

  return NextResponse.json({
    registrations: formatted,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
