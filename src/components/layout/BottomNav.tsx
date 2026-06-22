'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, Tent, Wallet } from 'lucide-react';

const tabs = [
  { href: '/home', label: 'Ana Sayfa', icon: Home },
  { href: '/items', label: 'Liste', icon: ListChecks },
  { href: '/my-tent', label: 'Sorumluluk', icon: Tent },
  { href: '/budget', label: 'Harcama', icon: Wallet },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg md:max-w-3xl lg:max-w-5xl">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== '/home' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                active ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-emerald-600" />
              )}
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                  active ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
