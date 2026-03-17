import Link from 'next/link';
import Image from 'next/image';
import { Countdown } from '@/components/Countdown';
import { MapPin, Calendar, Clock, Route, Users, Trophy } from 'lucide-react';
import { RACE_INFO } from '@/lib/constants';

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        {/* Moon glow background wash */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-lunar-300/8 via-midnight-700/5 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="mx-auto w-[1000px] sm:w-[600px] mb-8">
            <Image
              src="/blue-moon-run-logo.png"
              alt="Blue Moon 5 Miler logo"
              width={1028}
              height={1028}
              priority
              className="w-full h-auto"
            />
          </div>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-stardust/50 max-w-lg mx-auto leading-relaxed mb-4">
            {RACE_INFO.date} · Prospect Park · 8:00 PM Start
          </p>
          <p className="font-body text-sm text-stardust/50 max-w-xl mx-auto leading-relaxed">
            A blue moon only comes around once every three years. We’re running it.
          </p>

          {/* Countdown */}
          <div className="mt-10 mb-12">
            <Countdown />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">
              Register Now — ${RACE_INFO.price}
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
                No frills.
                <br />
                Just a solid run.
              </h2>
              <div className="space-y-4 text-sm text-stardust/60 leading-relaxed">
                <p>
                  Join us for a 5-mile night race in Prospect Park. No frills—just a
                  solid course, good people, and a reason to get out there.
                </p>
                <p>
                  Run it how you want. Just don’t miss it.
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Calendar,
                  title: 'Sunday, May 31st',
                  desc: 'Prospect Park · night race',
                },
                {
                  icon: Clock,
                  title: '8:00 PM Start',
                  desc: 'Arrive by 7:30 PM for check-in',
                },
                {
                  icon: Route,
                  title: '5 Miles',
                  desc: 'Format: self-timed',
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
            <p className="label-field mb-4">Race Details</p>
            <h2 className="font-display text-3xl sm:text-4xl text-moonlight leading-tight">
              Everything you need to know
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🕗',
                title: 'Start + Check-in',
                desc: 'Start Time: 8:00 PM. Check-in: arrive by 7:30 PM.',
              },
              {
                icon: '🗺️',
                title: 'Course',
                desc: 'Start location is marked on the course map (green dot).',
              },
              {
                icon: '⏱️',
                title: 'Format',
                desc: 'Self-timed. Run it how you want.',
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
              $18
            </h2>
            <p className="text-sm text-stardust/50 mb-8">
              $18 standard entry. $15 if you completed the pre-survey (discount code sent via email).
            </p>
            <Link href="/register" className="btn-primary">
              Register Now
            </Link>
            <p className="text-xs text-stardust/30 mt-6">
              Register by Sunday, May 3rd. Spots are limited.
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
                q: 'How does the discount work?',
                a: 'If you completed the pre-survey, you should have received a discount code by email. You can apply it during checkout on Stripe.',
              },
              {
                q: 'Is there a shirt?',
                a: 'T-shirt pre-order is $22 (optional) and available during registration.',
              },
              {
                q: 'What’s at the finish?',
                a: 'We’ll have Blue Moon’s new non-alcoholic beer line at the finish. Hang out, cool down, and stick around.',
              },
              {
                q: 'Is it chip-timed?',
                a: 'No — the race is self-timed.',
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
