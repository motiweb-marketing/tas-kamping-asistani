import Image from 'next/image';
import Link from 'next/link';
import { Tent } from 'lucide-react';
import { SITE } from '@/lib/site-config';

interface AuthShellProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  variant?: 'default' | 'wide';
}

export default function AuthShell({
  children,
  backHref = '/',
  backLabel = 'Ana sayfaya dön',
  variant = 'default',
}: AuthShellProps) {
  const maxW = variant === 'wide' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="min-h-screen bg-sand-50 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden bg-forest-950 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0">
          <Image
            src="/landing/camping-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-forest-950/90 via-forest-900/80 to-forest-800/70" />
        </div>

        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sand-100 backdrop-blur-sm">
              <Tent className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">{SITE.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-forest-300">{SITE.tagline}</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 p-10 pb-12">
          <blockquote className="max-w-sm">
            <p className="font-display text-2xl font-medium leading-snug text-sand-100">
              &ldquo;Liste, nöbet, harcama — hepsi tek yerde.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-forest-300">Kamp organizasyonu için tasarlandı</footer>
          </blockquote>
          <ul className="space-y-2 text-sm text-forest-200">
            <li>✓ Mobil öncelikli, büyük dokunma alanları</li>
            <li>✓ Deneme: 1 çadır, 2 kişi — kart gerekmez</li>
            <li>✓ PWA — ana ekrana ekleyin</li>
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col">
        <div className="border-b border-forest-100 bg-white/80 px-6 py-4 backdrop-blur-sm lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white">
              <Tent className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-forest-950">{SITE.name}</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
          <div className={`mx-auto w-full ${maxW}`}>
            {backHref && (
              <Link
                href={backHref}
                className="mb-8 inline-flex items-center gap-1 text-sm font-semibold text-forest-600 transition-colors hover:text-forest-900"
              >
                ← {backLabel}
              </Link>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
