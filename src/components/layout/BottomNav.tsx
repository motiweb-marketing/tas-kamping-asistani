'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/items', label: 'Liste', icon: '📋' },
  { href: '/summary', label: 'Özet', icon: '📊' },
  { href: '/menu', label: 'Menü', icon: '🍽️' },
  { href: '/my-tent', label: 'Çadır', icon: '⛺' },
  { href: '/duties', label: 'Görev', icon: '📅' },
  { href: '/budget', label: 'Harcama', icon: '💰' },
  { href: '/chat', label: 'Chat', icon: '💬' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-lg md:max-w-3xl lg:max-w-5xl">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-sm font-medium transition-colors ${
                active ? 'text-emerald-700' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] sm:text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
