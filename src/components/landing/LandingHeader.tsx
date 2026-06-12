import Link from 'next/link';
import { SITE } from '@/lib/site-config';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-800">
          <span aria-hidden>⛺</span>
          {SITE.name}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/setup"
            className="hidden rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white sm:inline-flex"
          >
            Ücretsiz Dene
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Giriş
          </Link>
          <Link
            href="/login/admin"
            className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800"
          >
            Organizatör
          </Link>
        </nav>
      </div>
    </header>
  );
}
