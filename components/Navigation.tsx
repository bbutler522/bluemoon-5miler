'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { isAdmin } from '@/lib/admin';
import { Menu, X, Shield } from 'lucide-react';

export function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();
  const isAdminUser = isAdmin(user?.email);

  // Is this an admin or dashboard page? Use different bg behavior
  const isDarkPage = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const publicLinks = [
    { href: '/#about', label: 'About' },
    { href: '/#details', label: 'Details' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || isDarkPage
          ? 'bg-midnight-950/90 backdrop-blur-lg border-b border-lunar-400/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg text-moonlight tracking-wide hover:text-white transition-colors"
        >
          Blue Moon 5 Miler - Commonwealth Running
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-body text-stardust/70 hover:text-moonlight tracking-wide uppercase transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={`text-sm font-body tracking-wide uppercase transition-colors duration-200 ${
                  pathname.startsWith('/dashboard')
                    ? 'text-moonlight'
                    : 'text-stardust/70 hover:text-moonlight'
                }`}
              >
                Dashboard
              </Link>

              {isAdminUser && (
                <Link
                  href="/admin"
                  className={`text-sm font-body tracking-wide uppercase transition-colors duration-200 flex items-center gap-1 ${
                    pathname.startsWith('/admin')
                      ? 'text-moonlight'
                      : 'text-stardust/70 hover:text-moonlight'
                  }`}
                >
                  <Shield size={12} />
                  Admin
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="text-sm font-body text-stardust/100 hover:text-moonlight tracking-wide uppercase transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/register" className="btn-primary !py-2 !px-5 !text-xs">
                Register
              </Link>
              <Link href="/login" className="btn-secondary !py-2 !px-5 !text-xs">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-moonlight/70 hover:text-moonlight transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-midnight-950/95 backdrop-blur-lg border-t border-lunar-400/10 px-6 py-6 space-y-4">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-body text-stardust/70 hover:text-moonlight tracking-wide uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="block text-sm font-body text-stardust/70 hover:text-moonlight tracking-wide uppercase transition-colors"
              >
                Dashboard
              </Link>
              {isAdminUser && (
                <Link
                  href="/admin"
                  className="block text-sm font-body text-stardust/70 hover:text-moonlight tracking-wide uppercase transition-colors flex items-center gap-1"
                >
                  <Shield size={12} />
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="block text-sm font-body text-stardust/100 hover:text-moonlight tracking-wide uppercase transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-3">
              <Link href="/register" className="btn-primary !py-2 !px-5 !text-xs text-center">
                Register
              </Link>
              <Link href="/login" className="btn-secondary !py-2 !px-5 !text-xs text-center">
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
