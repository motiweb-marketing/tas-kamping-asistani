'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthButton from '@/components/auth/AuthButton';
import { clearMenuSkipped, markMenuSkipped } from '@/lib/menu-reminder';

interface Step4MenuGuideProps {
  onSkipped?: () => void;
}

export default function Step4MenuGuide({ onSkipped }: Step4MenuGuideProps) {
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menus')
      .then((r) => r.json())
      .then((d) => {
        setMenuCount((d.menus || []).filter((m: { description?: string }) => m.description?.trim()).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleSkip() {
    markMenuSkipped();
    onSkipped?.();
  }

  function handleOpenMenu() {
    clearMenuSkipped();
  }

  if (loading) return <p className="text-sm text-forest-500">Yükleniyor...</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-forest-100 bg-forest-50 p-4 text-sm text-forest-800">
        <p className="font-semibold">Menü neden önemli?</p>
        <p className="mt-1">
          Menüden alışveriş listesi oluşturulur. Henüz hazır değilseniz bu adımı atlayıp sonra
          hatırlatıcı ile tamamlayabilirsiniz.
        </p>
        {menuCount > 0 && (
          <p className="mt-2 font-medium text-emerald-800">
            ✓ {menuCount} öğün kaydı mevcut — menüyü düzenlemeye devam edebilirsiniz.
          </p>
        )}
      </div>

      <Link href="/admin/menu-duzenle" onClick={handleOpenMenu}>
        <AuthButton type="button" className="w-full sm:w-auto">
          {menuCount > 0 ? 'Menüyü düzenle →' : 'Menü planlamaya başla →'}
        </AuthButton>
      </Link>

      {menuCount === 0 && (
        <button
          type="button"
          onClick={handleSkip}
          className="w-full rounded-xl border-2 border-dashed border-forest-200 py-3 text-sm font-semibold text-forest-600 hover:bg-forest-50"
        >
          Şimdi atla — sonra hatırlat
        </button>
      )}

      <p className="text-xs text-forest-500">
        Menü sayfasında günlük kartları doldurun; değişiklikler otomatik kaydedilir.
      </p>
    </div>
  );
}
