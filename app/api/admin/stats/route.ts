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

  // Fetch all registrations
  const { data: registrations, error } = await admin
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const regs = registrations || [];

  // Compute stats
  const completed = regs.filter((r) => r.payment_status === 'completed');
  const pending = regs.filter((r) => r.payment_status === 'pending');
  const failed = regs.filter((r) => r.payment_status === 'failed');
  const refunded = regs.filter((r) => r.payment_status === 'refunded');

  const revenue = completed.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);

  // Shirt sizes breakdown (completed only)
  const shirtSizes: Record<string, number> = {};
  completed.forEach((r) => {
    const size = r.shirt_size || 'Not selected';
    shirtSizes[size] = (shirtSizes[size] || 0) + 1;
  });

  // Gender breakdown (completed only)
  const genderBreakdown: Record<string, number> = {};
  completed.forEach((r) => {
    const g = r.gender || 'Not specified';
    genderBreakdown[g] = (genderBreakdown[g] || 0) + 1;
  });

  // Registrations by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dayMap: Record<string, number> = {};
  regs
    .filter((r) => r.payment_status === 'completed')
    .forEach((r) => {
      const day = new Date(r.created_at).toISOString().split('T')[0];
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

  const registrationsByDay = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  // Promo code usage
  const { data: promoCodes } = await admin
    .from('promo_codes')
    .select('*')
    .order('current_uses', { ascending: false });

  return NextResponse.json({
    stats: {
      total: regs.length,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      revenue,
      averagePrice: completed.length > 0 ? revenue / completed.length : 0,
      shirtSizes,
      genderBreakdown,
      registrationsByDay,
    },
    promoCodes: promoCodes || [],
  });
}
