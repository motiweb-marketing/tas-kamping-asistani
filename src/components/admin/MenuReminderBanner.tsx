'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isMenuSkipped } from '@/lib/menu-reminder';

export default function MenuReminderBanner() {
  const [show, setShow] = useState(false);
  const [menuCount, setMenuCount] = useState(0);

  useEffect(() => {
    fetch('/api/menus')
      .then((r) => r.json())
      .then((d) => {
        const count = (d.menus || []).filter((m: { description?: string }) => m.description?.trim()).length;
        setMenuCount(count);
        setShow(count === 0 && isMenuSkipped());
      });
  }, []);

  if (!show) return null;

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
      <p className="font-semibold text-amber-900">Menü henüz tamamlanmadı</p>
      <p className="mt-1 text-sm text-amber-800">
        Kurulum sırasında menü adımını atladınız. Alışveriş listesi için menüyü tamamlamanız önerilir.
      </p>
      <Link
        href="/admin/menu-duzenle"
        className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-amber-600 px-4 text-sm font-bold text-white"
      >
        Menüyü tamamla →
      </Link>
    </div>
  );
}
