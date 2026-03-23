'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  revenue: number;
  averagePrice: number;
  shirtSizes: Record<string, number>;
  genderBreakdown: Record<string, number>;
  registrationsByDay: { date: string; count: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-stardust/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Registrations',
      value: stats.total,
      icon: Users,
      color: 'text-moonlight',
    },
    {
      label: 'Confirmed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-400',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-400',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      label: 'Avg. Ticket',
      value: `$${stats.averagePrice.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-stardust',
    },
    {
      label: 'Failed / Refunded',
      value: `${stats.failed} / ${stats.refunded}`,
      icon: XCircle,
      color: 'text-red-400/70',
    },
  ];

  // Simple bar chart max
  const maxDayCount = Math.max(...stats.registrationsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <card.icon size={14} className="text-stardust/40" />
              <span className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
                {card.label}
              </span>
            </div>
            <p className={`font-mono text-2xl font-light ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Registration trend + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily registrations chart */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stardust/40 mb-4">
            Registrations (Last 30 Days)
          </p>
          {stats.registrationsByDay.length === 0 ? (
            <p className="text-sm text-stardust/30 py-8 text-center">
              No confirmed registrations yet
            </p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {stats.registrationsByDay.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                >
                  <div
                    className="w-full bg-midnight-400/60 rounded-t-sm min-h-[2px] transition-all hover:bg-midnight-400"
                    style={{
                      height: `${(day.count / maxDayCount) * 100}%`,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-midnight-800 border border-lunar-400/10 rounded-lg px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                    <p className="text-[10px] text-moonlight font-mono">
                      {day.count} on {day.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shirt sizes */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stardust/40 mb-4">
            Shirt Sizes (Confirmed)
          </p>
          {Object.keys(stats.shirtSizes).length === 0 ? (
            <p className="text-sm text-stardust/30 py-8 text-center">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.shirtSizes)
                .sort(([a], [b]) => {
                  const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Not selected'];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([size, count]) => {
                  const total = Object.values(stats.shirtSizes).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={size} className="flex items-center gap-3">
                      <span className="text-xs text-stardust/100 w-20 font-mono">
                        {size}
                      </span>
                      <div className="flex-1 h-2 bg-midnight-900/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-midnight-400/70 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-stardust/40 font-mono w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Promo codes now managed in Stripe */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-stardust/40">
            Promo Codes
          </p>
          <Link
            href="/admin/promo-codes"
            className="text-xs text-stardust/40 hover:text-moonlight transition-colors"
          >
            Details →
          </Link>
        </div>
        <p className="text-xs text-stardust/40">
          Discounts and promotion codes are now configured directly in your Stripe Dashboard
          and applied through the Payment Link.
        </p>
      </div>

      {/* Quick links */}
      <div className="flex gap-4">
        <Link href="/admin/registrations" className="btn-primary !text-xs">
          View All Registrations
        </Link>
        <a
          href="/api/admin/registrations/export?status=all"
          className="btn-secondary !text-xs"
        >
          Export All (CSV)
        </a>
      </div>
    </div>
  );
}
