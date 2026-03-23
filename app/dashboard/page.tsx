import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { RACE_INFO } from '@/lib/constants';
import { Moon } from '@/components/Moon';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Shirt,
  Hash,
  CreditCard,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: 'Confirmed',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    desc: "You're all set for race day!",
  },
  pending: {
    icon: Clock,
    label: 'Payment Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
    desc: 'Complete your payment to confirm your spot.',
  },
  failed: {
    icon: XCircle,
    label: 'Payment Failed',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    desc: 'Your payment could not be processed. Please try again.',
  },
  refunded: {
    icon: XCircle,
    label: 'Refunded',
    color: 'text-stardust/100',
    bg: 'bg-stardust/5 border-stardust/10',
    desc: 'Your registration has been refunded.',
  },
};

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard');

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const reg = registrations?.[0];
  const userName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'Runner';
  const firstName = userName.split(' ')[0];

  return (
    <section className="min-h-screen px-6 pt-24 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="label-field mb-2">Dashboard</p>
            <h1 className="font-display text-3xl text-moonlight">
              Hey, {firstName}
            </h1>
            <p className="text-xs text-stardust/40 mt-1">{user.email}</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="btn-secondary !py-2 !px-4 !text-xs flex items-center gap-1.5"
          >
            <Settings size={14} />
            Profile
          </Link>
        </div>

        {reg ? (
          <div className="space-y-6">
            {/* Status banner */}
            {(() => {
              const status =
                statusConfig[reg.payment_status as keyof typeof statusConfig] ||
                statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div
                  className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${status.bg}`}
                >
                  <StatusIcon size={20} className={status.color} />
                  <div>
                    <p className={`text-sm font-semibold ${status.color}`}>
                      {status.label}
                    </p>
                    <p className="text-xs text-stardust/40 mt-0.5">
                      {status.desc}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Bib + Name header card */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="label-field mb-1">Registered Runner</p>
                  <p className="font-display text-2xl text-moonlight">
                    {reg.first_name} {reg.last_name}
                  </p>
                  <p className="text-xs text-stardust/40 mt-1">{reg.email}</p>
                </div>
                {reg.bib_number && (
                  <div className="text-right">
                    <p className="label-field mb-1">Bib Number</p>
                    <p className="font-mono text-4xl text-moonlight font-light leading-none">
                      #{reg.bib_number}
                    </p>
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Calendar, label: 'Race Date', value: RACE_INFO.date },
                  { icon: Clock, label: 'Start Time', value: RACE_INFO.time },
                  { icon: MapPin, label: 'Location', value: 'Prospect Park, Brooklyn' },
                  {
                    icon: Shirt,
                    label: 'Shirt Size',
                    value: reg.shirt_size || 'Not selected',
                  },
                  {
                    icon: CreditCard,
                    label: 'Amount Paid',
                    value: `$${Number(reg.amount_paid).toFixed(2)}`,
                  },
                  {
                    icon: Hash,
                    label: 'Bib',
                    value: reg.bib_number
                      ? `#${reg.bib_number}`
                      : 'Assigned after payment',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-midnight-900/40 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon size={12} className="text-stardust/30" />
                      <p className="text-[10px] uppercase tracking-widest text-stardust/30">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-sm text-moonlight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency contact */}
            {(reg.emergency_contact_name || reg.emergency_contact_phone) && (
              <div className="card p-6">
                <p className="label-field mb-3">Emergency Contact</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-stardust/30">Name</p>
                    <p className="text-sm text-moonlight mt-0.5">
                      {reg.emergency_contact_name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stardust/30">Phone</p>
                    <p className="text-sm text-moonlight mt-0.5">
                      {reg.emergency_contact_phone || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Race day info */}
            <div className="card p-6 sm:p-8">
              <p className="label-field mb-4">Race Day Checklist</p>
              <div className="space-y-4">
                {[
                  {
                    time: '7:30 PM',
                    title: 'Arrive + check in',
                    desc: 'Arrive by 7:30 PM. Start location is marked on the course map (green dot).',
                  },
                  {
                    time: '7:55 PM',
                    title: 'Line up',
                    desc: 'Get to the start and get ready. The race is self-timed.',
                  },
                  {
                    time: '8:00 PM',
                    title: 'Race starts',
                    desc: "The gun goes off and you're running under the Blue Moon. Enjoy every mile.",
                  },
                  {
                    time: '~9:00 PM',
                    title: 'Post-race hang',
                    desc: 'We’ll have Blue Moon’s new non-alcoholic beer line at the finish. Hang out, cool down, and stick around.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-midnight-400/70 mt-1.5" />
                      {i < 3 && (
                        <div className="w-px flex-1 bg-lunar-400/10 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-[10px] font-mono text-stardust/40">
                        {item.time}
                      </p>
                      <p className="text-sm font-semibold text-moonlight mt-0.5">
                        {item.title}
                      </p>
                      <p className="text-xs text-stardust/100 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit profile link */}
            <Link
              href="/dashboard/profile"
              className="card p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <User size={16} className="text-stardust/40" />
                <div>
                  <p className="text-sm text-moonlight">Edit Registration</p>
                  <p className="text-xs text-stardust/40">
                    Update your shirt size, emergency contact, or personal info
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-stardust/20 group-hover:text-stardust/100 transition-colors"
              />
            </Link>
          </div>
        ) : (
          /* No registration */
          <div className="card p-10 text-center">
            <div className="mx-auto w-16 h-16 mb-6 opacity-40">
              <Moon />
            </div>
            <h2 className="font-display text-xl text-moonlight mb-2">
              No registration yet
            </h2>
            <p className="text-sm text-stardust/100 mb-6">
              You haven&apos;t registered for the Blue Moon 5 Miler yet.
            </p>
            <a href="/register" className="btn-primary inline-block">
              Register Now — ${RACE_INFO.price}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
