import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Blue Moon 5 Miler — Commonwealth Running Club',
  description:
    'Run under the full moon at Prospect Park. Brooklyn\'s Commonwealth Running Club presents the Blue Moon 5 Miler on May 31, 2026.',
  keywords: ['running', 'race', 'Brooklyn', 'Prospect Park', '5 mile', 'Blue Moon', 'Commonwealth'],
  openGraph: {
    title: 'Blue Moon 5 Miler',
    description: 'Run under the full moon at Prospect Park. May 31, 2026.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="min-h-screen font-body antialiased">
        <div className="starfield" aria-hidden="true" />
        {isDemoMode && (
          <div className="fixed bottom-4 right-4 z-[60] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm">
            Demo Mode
          </div>
        )}
        <Navigation />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
