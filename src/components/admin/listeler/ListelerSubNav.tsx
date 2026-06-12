'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LIST_TYPES } from '@/lib/list-config';

export default function ListelerSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto border-b border-forest-100 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/admin/listeler"
        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
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
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap ${
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
