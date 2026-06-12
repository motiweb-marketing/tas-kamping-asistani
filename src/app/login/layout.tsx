import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Giriş',
  description: `${SITE.name} — çadır veya organizatör girişi.`,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<p className="p-6 text-lg">Yükleniyor...</p>}>{children}</Suspense>;
}
