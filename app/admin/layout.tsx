'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Tag, Download, ChevronLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/registrations', label: 'Registrations', icon: Users },
  // { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Admin header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-stardust/40 hover:text-moonlight transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stardust/40">
                Admin
              </p>
              <h1 className="font-display text-xl text-moonlight">
                Race Management
              </h1>
            </div>
          </div>

          <a
            href="/api/admin/registrations/export?status=completed"
            className="btn-secondary !py-2 !px-4 !text-xs flex items-center gap-2"
          >
            <Download size={14} />
            Export CSV
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <nav className="lg:w-52 flex-shrink-0">
            <div className="flex lg:flex-col gap-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-midnight-800/80 text-moonlight border border-lunar-400/15'
                        : 'text-stardust/100 hover:text-moonlight hover:bg-midnight-900/40'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
