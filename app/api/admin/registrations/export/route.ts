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

  let query = admin
    .from('registrations')
    .select('*, promo_codes(code)')
    .order('created_at', { ascending: true });

  if (status && status !== 'all') {
    query = query.eq('payment_status', status);
  }

  const { data: registrations, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build CSV
  const headers = [
    'Bib',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Gender',
    'Date of Birth',
    'Shirt Size',
    'Emergency Contact',
    'Emergency Phone',
    'Payment Status',
    'Amount Paid',
    'Promo Code',
    'Registered At',
  ];

  const rows = (registrations || []).map((r: any) => [
    r.bib_number || '',
    r.first_name,
    r.last_name,
    r.email,
    r.phone || '',
    r.gender || '',
    r.date_of_birth || '',
    r.shirt_size || '',
    r.emergency_contact_name || '',
    r.emergency_contact_phone || '',
    r.payment_status,
    r.amount_paid,
    r.promo_codes?.code || '',
    new Date(r.created_at).toISOString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="bluemoon-registrations-${
        new Date().toISOString().split('T')[0]
      }.csv"`,
    },
  });
}
