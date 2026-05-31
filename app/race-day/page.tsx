import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  MapPin,
  ClipboardList,
  Route,
  Shirt,
  PartyPopper,
  Mail,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { RACE_INFO } from '@/lib/constants';

const SIGN_IN_MAP_URL = 'https://maps.app.goo.gl/1qAVrWsK2q648y67A';
const CONTACT_EMAIL = 'Jazzelinger@gmail.com';
const INSTAGRAM_URL = 'https://instagram.com/commonwealth_running';

export default function RaceDayPage() {
  return (
    <section className="relative min-h-screen px-6 pt-24 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="label-field mb-3">Race Day</p>
          <h1 className="font-display text-3xl sm:text-4xl text-moonlight mb-4 leading-tight">
            Under the Blue Moon
          </h1>
          <p className="text-sm sm:text-base text-stardust/90 max-w-xl mx-auto leading-relaxed">
            Hello Runners, Walkers, Dogs, and Friends! Race day is here — we&apos;re
            running under a real Blue Moon this Sunday. Here&apos;s everything you need
            to know.
          </p>
        </div>

        <div className="space-y-10">
          {/* Time */}
          <article className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-stardust/100" />
              </div>
              <h2 className="font-display text-xl text-moonlight pt-1">Time</h2>
            </div>
            <ul className="space-y-3 text-sm text-stardust/90 leading-relaxed pl-[52px]">
              <li>
                <span className="font-semibold text-moonlight">6:30 PM</span> — Check-in
                / Bib pick-up opens
              </li>
              <li>
                <span className="font-semibold text-moonlight">7:30 PM</span> — Race
                starts
              </li>
            </ul>
          </article>

          {/* Sign In Location */}
          <article className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-stardust/100" />
              </div>
              <h2 className="font-display text-xl text-moonlight pt-1">
                Sign In Location
              </h2>
            </div>
            <div className="pl-[52px] space-y-5">
              <p className="text-sm text-stardust/90 leading-relaxed">
                Find us on the western side of Center Drive in Prospect Park. See the
                blue oval on the map below — that&apos;s exactly where to check in.
              </p>
              <a
                href={SIGN_IN_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-moonlight hover:text-stardust transition-colors"
              >
                Open in Google Maps
                <ExternalLink size={14} />
              </a>
              <div className="rounded-xl overflow-hidden border border-lunar-400/10 bg-midnight-950/40">
                <Image
                  src="/sign-in-location.png"
                  alt="Sign-in location on the western side of Center Drive in Prospect Park, marked with a blue oval"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </article>

          {/* Check-in / Bib Pick-up */}
          <article className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={16} className="text-stardust/100" />
              </div>
              <h2 className="font-display text-xl text-moonlight pt-1">
                Check-in / Bib Pick-up
              </h2>
            </div>
            <div className="pl-[52px] space-y-4 text-sm text-stardust/90 leading-relaxed">
              <p>
                Head to the check-in table to grab your bib and safety pins. At the
                bottom of your bib is a small tag — fill it out with your name before
                you run. When you cross the finish line, that tag will be collected
                and placed on the finishing board. That&apos;s how we track your finish,
                so don&apos;t forget to fill it out!
              </p>
              <p className="text-stardust/80 border-l-2 border-lunar-400/20 pl-4">
                If you know someone who would like to run and has not signed up, they
                can register at check-in. Entry fee will be ${RACE_INFO.price}. We can
                accept Venmo, Zelle, or cash.
              </p>
            </div>
          </article>

          {/* The Route */}
          <article className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                <Route size={16} className="text-stardust/100" />
              </div>
              <h2 className="font-display text-xl text-moonlight pt-1">The Route</h2>
            </div>
            <div className="pl-[52px] space-y-5">
              <div className="space-y-4 text-sm text-stardust/90 leading-relaxed">
                <p>
                  We start on the western side of Center Drive and finish on the eastern
                  side of Center Drive. Along the way, you&apos;ll pass both entrances to
                  Center Drive once before crossing the finish line on the eastern side.
                </p>
                <p>
                  Don&apos;t worry about getting lost — there will be flags and volunteers
                  posted along the course to keep you on track.
                </p>
                <p>
                  Walking the race? We encourage walkers to take the 2-mile route —
                  simply enter Center Drive on your first approach and that&apos;s your
                  finish. And yes, top placing walkers are eligible for prizes.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-lunar-400/10 bg-midnight-950/40">
                <Image
                  src="/blue-moon-5-miler-route.png"
                  alt="Blue Moon 5 Miler course map — 5.02 miles around Prospect Park"
                  width={1664}
                  height={2048}
                  className="w-full h-auto max-h-[480px] object-contain object-top"
                />
              </div>
            </div>
          </article>

          {/* T-Shirts & Merch */}
          <article className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                <Shirt size={16} className="text-stardust/100" />
              </div>
              <h2 className="font-display text-xl text-moonlight pt-1">
                T-Shirts &amp; Merch
              </h2>
            </div>
            <p className="text-sm text-stardust/90 leading-relaxed pl-[52px]">
              If you purchased a t-shirt, pick it up before or after your race at the
              check-in table. We&apos;ll also have a few extra shirts available for
              purchase, along with Commonwealth hats and socks for sale.
            </p>
          </article>

          {/* After the Race */}
          <article className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-midnight-800/80 border border-lunar-400/10 flex items-center justify-center flex-shrink-0">
                <PartyPopper size={16} className="text-stardust/100" />
              </div>
              <h2 className="font-display text-xl text-moonlight pt-1">
                After the Race
              </h2>
            </div>
            <div className="pl-[52px] space-y-4 text-sm text-stardust/90 leading-relaxed">
              <p>
                The finish line is just the beginning! Once you&apos;re across, stick
                around and celebrate with us under the Blue Moon. Runners and
                spectators are all welcome — we&apos;ll have N/A Blue Moon flowing,
                prizes from our amazing local partners, and a special award category
                for our dog-running crew.
              </p>
              <p>
                If you&apos;re racing with your pup, look for the dog runner sign-in at
                check-in — you&apos;ll start from a designated separate spot. Please tell
                your dogs there will be extra treats at the finish line. Top placing dog
                might even win a... Lambie?!?
              </p>
              <p className="text-moonlight font-medium">
                See you out there Sunday. Run well and enjoy the moon.
              </p>
            </div>
          </article>

          {/* Questions */}
          <article className="card p-6 sm:p-8 text-center">
            <p className="label-field mb-4">Questions?</p>
            <p className="text-sm text-stardust/90 mb-6">Reach out anytime.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="btn-secondary inline-flex items-center justify-center gap-2 !py-3 !px-6 !text-xs"
              >
                <Mail size={14} />
                {CONTACT_EMAIL}
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center gap-2 !py-3 !px-6 !text-xs"
              >
                <Instagram size={14} />
                @commonwealth_running
              </a>
            </div>
          </article>
        </div>

        <div className="mt-12 text-center">
          <Link href="/register" className="btn-primary">
            Register Now — ${RACE_INFO.price}
          </Link>
        </div>
      </div>
    </section>
  );
}
