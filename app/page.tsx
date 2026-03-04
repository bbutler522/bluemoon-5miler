import Link from 'next/link';
import { Moon } from '@/components/Moon';
import { Countdown } from '@/components/Countdown';
import { MapPin, Calendar, Clock, Route, Users, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Moon glow background wash */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-lunar-300/8 via-midnight-700/5 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Moon */}
          <div className="mx-auto w-28 h-28 sm:w-36 sm:h-36 mb-10 animate-float">
            <Moon />
          </div>

          {/* Tag */}
          <p className="inline-block text-[10px] sm:text-xs font-body font-semibold uppercase tracking-[0.3em] text-stardust/50 mb-6 border border-lunar-400/10 rounded-full px-4 py-1.5">
            Commonwealth Running Club presents
          </p>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-moonlight leading-[0.95] mb-6">
            Blue Moon
            <br />
            <span className="text-stardust/70">5 Miler</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-stardust/50 max-w-lg mx-auto leading-relaxed mb-4">
            Run under the full moon at Prospect Park.
            <br className="hidden sm:block" />
            May 31, 2026 — Brooklyn, NY
          </p>

          {/* Countdown */}
          <div className="mt-10 mb-12">
            <Countdown />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">
              Register Now — $50
            </Link>
            <Link href="/#about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="label-field mb-4">About the Race</p>
              <h2 className="font-display text-3xl sm:text-4xl text-moonlight leading-tight mb-6">
                A rare night under
                <br />a rare moon.
              </h2>
              <div className="space-y-4 text-sm text-stardust/60 leading-relaxed">
                <p>
                  On May 31st, 2026, a Blue Moon rises over Brooklyn. Commonwealth
                  Running Club invites you to lace up for our inaugural 5-mile race
                  through the winding roads of Prospect Park — starting at dusk,
                  finishing under a full moon.
                </p>
                <p>
                  This is a community event
                  built by runners, for runners. We&apos;ve been building Commonwealth
                  for three years in Brooklyn, and this is our first official race. We
                  want it to feel special.
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Calendar,
                  title: 'May 31, 2026',
                  desc: 'Saturday evening — Blue Moon night',
                },
                {
                  icon: Clock,
                  title: '7:30 PM Start',
                  desc: 'Check-in opens at 6:00 PM',
                },
                {
                  icon: Route,
                  title: '5 Miles',
                  desc: 'One scenic loop through Prospect Park',
                },
                {
                  icon: MapPin,
                  title: 'Prospect Park',
                  desc: 'Brooklyn, New York',
                },
              ].map((item) => (
                <div key={item.title} className="card px-6 py-5 flex items-start gap-4">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-stardust/60" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-semibold text-moonlight">
                      {item.title}
                    </p>
                    <p className="text-xs text-stardust/40 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DETAILS ===== */}
      <section id="details" className="relative py-32 px-6">
        <div className="absolute inset-0 bg-moon-glow pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="label-field mb-4">What You Get</p>
            <h2 className="font-display text-3xl sm:text-4xl text-moonlight leading-tight">
              Race day details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🏃',
                title: 'Self Timed Race',
                desc: 'Start your race with Strava at the start and end with us at the finish line!',
              },
              {
                icon: '👕',
                title: 'Race Shirt',
                desc: 'Custom Blue Moon 5 Miler tee. Available in XS–XXL.',
              },
              {
                icon: '🍺',
                title: 'Post-Race Party',
                desc: 'Complimentary drinks, snacks, and community vibes after the race.',
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <p className="text-sm font-body font-semibold text-moonlight mb-2">
                  {item.title}
                </p>
                <p className="text-xs text-stardust/50 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING CTA ===== */}
      <section className="relative py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-10 sm:p-14 animate-pulse-glow">
            <p className="label-field mb-4">Registration</p>
            <h2 className="font-display text-4xl sm:text-5xl text-moonlight mb-3">
              $50
            </h2>
            <p className="text-sm text-stardust/50 mb-8">
              Includes race entry, shirt, bib, post-race refreshments, and a night you
              won&apos;t forget.
            </p>
            <Link href="/register" className="btn-primary">
              Register Now
            </Link>
            <p className="text-xs text-stardust/30 mt-6">
              Limited to ~200 runners. Early bird promo codes available.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="label-field mb-4">FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl text-moonlight leading-tight">
              Common questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Is the course flat?',
                a: 'Prospect Park has gentle rolling hills. The course follows the main park drive loop — nothing extreme, but not pancake-flat either.',
              },
              {
                q: 'Can I walk?',
                a: 'Absolutely. All paces are welcome. Walk, jog, run — just come out and enjoy the moon.',
              },
              {
                q: 'What about parking?',
                a: 'Street parking is available around Prospect Park. We recommend taking the subway (B/Q to Prospect Park, or 2/3 to Grand Army Plaza).',
              },
              {
                q: 'Are refunds available?',
                a: 'Full refunds are available up to 14 days before race day. After that, registrations can be transferred to another runner.',
              },
            ].map((item) => (
              <div key={item.q} className="card px-6 py-5">
                <p className="text-sm font-body font-semibold text-moonlight mb-2">
                  {item.q}
                </p>
                <p className="text-xs text-stardust/50 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
