'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function BannerInner() {
  const searchParams = useSearchParams();
  if (searchParams.get('generated') !== '1') return null;

  return (
    <div className="mb-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <p className="font-semibold">AI alışveriş listeniz hazır</p>
      <p className="mt-1 text-blue-800">
        Malzemeler kategorilere ayrıldı. Kontrol edip düzenledikten sonra yayınlayabilirsiniz.
      </p>
    </div>
  );
}

export default function AiListReadyBanner() {
  return (
    <Suspense fallback={null}>
      <BannerInner />
    </Suspense>
  );
}
