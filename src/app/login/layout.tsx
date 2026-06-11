import { Suspense } from 'react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<p className="p-6 text-lg">Yükleniyor...</p>}>{children}</Suspense>;
}
