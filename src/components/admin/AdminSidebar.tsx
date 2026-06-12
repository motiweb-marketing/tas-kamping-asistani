'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Settings,
  Share2,
  Tent,
  Users,
  Wallet,
  Wand2,
} from 'lucide-react';
import PlanStatusChip from '@/components/admin/PlanStatusChip';
import LogoutButton from '@/components/layout/LogoutButton';
import { SITE } from '@/lib/site-config';

const NAV = [
  { href: '/admin/kurulum', label: 'Kurulum sihirbazı', icon: Wand2, highlight: true },
  { href: '/admin', label: 'Genel bakış', icon: LayoutDashboard },
  { type: 'divider' as const, label: 'Düzenle' },
  { href: '/admin/kamp', label: 'Kamp bilgileri', icon: Calendar },
  { href: '/admin/cadirlar', label: 'Çadırlar & kişiler', icon: Users },
  { href: '/admin/ucret', label: 'Konaklama ücreti', icon: Wallet },
  { href: '/admin/menu-duzenle', label: 'Menü', icon: ClipboardList },
  { href: '/admin/liste', label: 'Alışveriş listesi', icon: ListChecks },
  { href: '/admin/hazir-listeler', label: 'Hazır listeler', icon: Tent },
  { type: 'divider' as const, label: 'Sistem' },
  { href: '/admin/ayarlar', label: 'Ayarlar (AI)', icon: Settings },
  { href: '/admin/paylas', label: 'Giriş bilgisi paylaş', icon: Share2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-forest-100 bg-white lg:flex">
        <div className="border-b border-forest-100 p-5">
          <Link href="/admin" className="block">
            <p className="font-display text-lg font-bold text-forest-950">{SITE.name}</p>
            <p className="text-xs text-forest-500">Yönetim paneli</p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {NAV.map((item, i) => {
              if ('type' in item) {
                return (
                  <li key={i} className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-forest-400">
                    {item.label}
                  </li>
                );
              }
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-forest-800 text-white'
                        : item.highlight
                          ? 'text-forest-800 hover:bg-forest-50'
                          : 'text-forest-700 hover:bg-forest-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-forest-100 p-4">
          <PlanStatusChip />
          <Link
            href="/items"
            className="flex w-full items-center justify-center rounded-lg border border-forest-200 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50"
          >
            Kampa git →
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar + quick nav */}
      <header className="border-b border-forest-100 bg-white lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Link href="/admin/kurulum" className="font-display font-bold text-forest-950">
            {SITE.name}
          </Link>
          <PlanStatusChip className="hidden min-w-[88px] sm:block lg:hidden" />
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/items" className="text-sm font-medium text-forest-700">
              Kampa git
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV.filter((item): item is Extract<typeof item, { href: string }> => 'href' in item).map(
            (item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active ? 'bg-forest-800 text-white' : 'bg-forest-50 text-forest-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            }
          )}
        </nav>
      </header>
    </>
  );
}
