'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  Share2,
  Tent,
  User,
  Users,
  Wallet,
  Wand2,
  X,
} from 'lucide-react';
import PlanStatusChip from '@/components/admin/PlanStatusChip';
import LogoutButton from '@/components/layout/LogoutButton';
import { SITE } from '@/lib/site-config';

type NavLinkItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
};

type NavItem = NavLinkItem | { type: 'divider'; label: string };

function isNavLink(item: NavItem): item is NavLinkItem {
  return 'href' in item;
}

const NAV: NavItem[] = [
  { href: '/admin/kurulum', label: 'Program tanıtımı', icon: Wand2, highlight: true },
  { href: '/admin', label: 'Genel bakış', icon: LayoutDashboard },
  { type: 'divider', label: 'Düzenle' },
  { href: '/admin/kamp', label: 'Kamp bilgileri', icon: Calendar },
  { href: '/admin/cadirlar', label: 'Çadırlar & kişiler', icon: Users },
  { href: '/admin/ucret', label: 'Konaklama ücreti', icon: Wallet },
  { href: '/admin/menu-duzenle', label: 'Menü', icon: ClipboardList },
  { type: 'divider', label: 'Listeler' },
  { href: '/admin/listeler/kisisel', label: 'Kişisel ihtiyaçlar', icon: User },
  { href: '/admin/listeler/cadir', label: 'Çadır ihtiyaçları', icon: Tent },
  { href: '/admin/listeler/kamp', label: 'Kamp ihtiyaçları', icon: ListChecks },
  { type: 'divider', label: 'Sistem' },
  { href: '/admin/ayarlar', label: 'Ayarlar (AI)', icon: Settings },
  { href: '/admin/paylas', label: 'Giriş bilgisi paylaş', icon: Share2 },
];

function useIsActive(pathname: string) {
  return (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href.startsWith('/admin/listeler/')) {
      return pathname === href || pathname.startsWith(`${href}/`);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

function NavLinks({
  pathname,
  onNavigate,
  className = '',
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const isActive = useIsActive(pathname);

  return (
    <ul className={`space-y-0.5 ${className}`}>
      {NAV.map((item, i) => {
        if (!isNavLink(item)) {
          return (
            <li
              key={i}
              className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-forest-400"
            >
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
              onClick={onNavigate}
              className={`flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-forest-100 bg-white lg:flex">
        <div className="border-b border-forest-100 p-5">
          <Link href="/admin" className="block">
            <p className="font-display text-lg font-bold text-forest-950">{SITE.name}</p>
            <p className="text-xs text-forest-500">Yönetim paneli</p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="space-y-2 border-t border-forest-100 p-4">
          <PlanStatusChip />
          <Link
            href="/items"
            className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-forest-200 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50"
          >
            Kampa git →
          </Link>
          <LogoutButton className="w-full" />
        </div>
      </aside>

      {/* Mobile header — full width */}
      <div className="w-full shrink-0 border-b border-forest-100 bg-white lg:hidden">
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-forest-200 text-forest-800"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="min-w-0 flex-1 truncate font-display font-bold text-forest-950">
            {SITE.name}
          </Link>
          <Link
            href="/items"
            className="shrink-0 rounded-lg bg-forest-100 px-2.5 py-2 text-xs font-semibold text-forest-800"
          >
            Kampa
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-950/40"
            aria-label="Menüyü kapat"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 top-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-forest-100 px-4 py-3">
              <div>
                <p className="font-display font-bold text-forest-950">{SITE.name}</p>
                <p className="text-xs text-forest-500">Yönetim paneli</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-forest-600 hover:bg-forest-50"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </nav>

            <div className="space-y-2 border-t border-forest-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <PlanStatusChip />
              <Link
                href="/items"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-forest-200 py-2 text-sm font-semibold text-forest-800"
              >
                Kampa git →
              </Link>
              <LogoutButton className="w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
