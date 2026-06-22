'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthButton from '@/components/auth/AuthButton';
import { LIST_TYPES } from '@/lib/list-config';

export default function Step5ListeGuide() {
  const [stats, setStats] = useState({ published: 0, draft: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/items?scope=shared').then((r) => r.json()),
      fetch('/api/items?scope=personal&recommendations=true').then((r) => r.json()),
    ]).then(([shared, personal]) => {
      const sharedItems = shared.items || [];
      const published = sharedItems.filter((i: { is_published: boolean }) => i.is_published).length;
      const draft = sharedItems.filter((i: { is_published: boolean }) => !i.is_published).length;
      setStats({ published, draft });
      void personal;
    });
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-forest-100 bg-forest-50 p-4">
        <p className="text-sm font-semibold text-forest-900">Önerilen sıra</p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-forest-700">
          <li>Tüm kişileri ve çadırları kaydedin (liste kişi sayısına göre hesaplanır)</li>
          <li>Menüyü tamamlayın (veya önceki adımda atladıysanız sonra dönün)</li>
          <li>Menü sayfasında AI sihirbazı ile eksiksiz kamp listesi oluşturun</li>
          <li>Kişisel ve çadır listelerini kontrol edin</li>
          <li>Kamp listesini inceleyip yayınlayın</li>
        </ol>
      </div>

      {(stats.published > 0 || stats.draft > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-800">{stats.published}</p>
            <p className="text-xs text-emerald-700">Yayınlanan malzeme</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-800">{stats.draft}</p>
            <p className="text-xs text-amber-700">Taslak malzeme</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/admin/listeler/kamp">
          <AuthButton type="button" className="w-full sm:w-auto">
            Kamp listesini düzenle →
          </AuthButton>
        </Link>
        <Link href="/admin/listeler/kamp">
          <AuthButton type="button" variant="secondary" className="w-full sm:w-auto">
            AI listesini incele →
          </AuthButton>
        </Link>
      </div>

      <ul className="space-y-2 text-sm text-forest-600">
        {LIST_TYPES.map((l) => (
          <li key={l.slug}>
            <Link href={l.href} className="font-semibold text-forest-800 underline">
              {l.order}. {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
