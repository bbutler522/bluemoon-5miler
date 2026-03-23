import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-lunar-400/10 bg-midnight-950/50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <p className="font-display text-xl text-moonlight mb-3">
              <span className="text-stardust/100 text-sm mr-1">☾</span>{' '}
              Commonwealth
            </p>
            <p className="text-sm text-stardust/100 leading-relaxed max-w-xs">
              Brooklyn&apos;s community running club. Est. 2023.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="label-field mb-4">Race</p>
            <div className="space-y-2">
              <Link
                href="/#about"
                className="block text-sm text-stardust/100 hover:text-moonlight transition-colors"
              >
                About the Race
              </Link>
              <Link
                href="/#details"
                className="block text-sm text-stardust/100 hover:text-moonlight transition-colors"
              >
                Race Details
              </Link>
              <Link
                href="/register"
                className="block text-sm text-stardust/100 hover:text-moonlight transition-colors"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="label-field mb-4">Connect</p>
            <div className="space-y-2">
              <a
                href="https://instagram.com/commonwealthrunclub"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-stardust/100 hover:text-moonlight transition-colors"
              >
                Instagram
              </a>
              <a
                href="mailto:race@commonwealthrunclub.com"
                className="block text-sm text-stardust/100 hover:text-moonlight transition-colors"
              >
                race@commonwealthrunclub.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-lunar-400/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stardust/30">
            &copy; {new Date().getFullYear()} Commonwealth Running Club. All rights reserved.
          </p>
          <p className="text-xs text-stardust/30">
            Prospect Park, Brooklyn, NY
          </p>
        </div>
      </div>
    </footer>
  );
}
