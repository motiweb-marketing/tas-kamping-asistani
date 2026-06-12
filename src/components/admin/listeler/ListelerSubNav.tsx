'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LIST_TYPES } from '@/lib/list-config';

export default function ListelerSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-forest-100 pb-4">
      <Link
        href="/admin/listeler"
        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
          pathname === '/admin/listeler'
            ? 'bg-forest-800 text-white'
            : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
        }`}
      >
        Genel bakış
      </Link>
      {LIST_TYPES.map((list) => {
        const active = pathname === list.href || pathname.startsWith(`${list.href}/`);
        return (
          <Link
            key={list.slug}
            href={list.href}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              active
                ? 'bg-forest-800 text-white'
                : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
            }`}
          >
            {list.order}. {list.shortTitle}
          </Link>
        );
      })}
    </nav>
  );
}
