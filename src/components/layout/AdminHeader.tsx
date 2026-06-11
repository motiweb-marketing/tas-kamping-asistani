'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';

const links = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/tents', label: 'Çadırlar & Kişiler' },
  { href: '/admin/camp-settings', label: 'Kamp Ayarları' },
  { href: '/admin/duties', label: 'Kamp Planı' },
  { href: '/admin/checklists', label: 'Önerilen Listeler' },
  { href: '/admin/items-review', label: 'Ortak Liste' },
  { href: '/admin/settings', label: 'Ayarlar' },
];

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-emerald-800">Admin Paneli</h1>
        <div className="flex items-center gap-2">
          <Link href="/items" className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
            Uygulama
          </Link>
          <LogoutButton />
        </div>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
