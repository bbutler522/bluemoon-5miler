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
  const waitlisted = regs.filter((r) => r.waitlisted);
  const completed = regs.filter((r) => r.payment_status === 'completed' && !r.waitlisted);
  const pending = regs.filter((r) => r.payment_status === 'pending' && !r.waitlisted);
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
  const promoMap: Record<string, number> = {};
  regs.forEach((r) => {
    if (r.promo_code_used) {
      promoMap[r.promo_code_used] = (promoMap[r.promo_code_used] || 0) + 1;
    }
  });
  const promoUsage = Object.entries(promoMap)
    .sort(([, a], [, b]) => b - a)
    .map(([code, count]) => ({ code, count }));

  // Referral leaderboard
  const referralMap: Record<string, number> = {};
  regs.forEach((r) => {
    if (r.referred_by?.trim()) {
      const key = r.referred_by.trim();
      referralMap[key] = (referralMap[key] || 0) + 1;
    }
  });
  const referralLeaderboard = Object.entries(referralMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));

  // Run club breakdown
  const runClubs: Record<string, number> = {};
  regs.forEach((r) => {
    if (r.run_club?.trim()) {
      const key = r.run_club.trim();
      runClubs[key] = (runClubs[key] || 0) + 1;
    }
  });

  return NextResponse.json({
    stats: {
      total: regs.length,
      completed: completed.length,
      waitlisted: waitlisted.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      revenue,
      averagePrice: completed.length > 0 ? revenue / completed.length : 0,
      shirtSizes,
      genderBreakdown,
      registrationsByDay,
      promoUsage,
      referralLeaderboard,
      runClubs,
    },
  });
}
