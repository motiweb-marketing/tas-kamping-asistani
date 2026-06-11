import Link from 'next/link';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            ⛺
          </span>
          <span className="text-lg font-bold text-emerald-800 sm:text-xl">
            Taş Kamping Asistanı
          </span>
        </Link>
        <Link
          href="/login/admin"
          className="text-sm text-gray-500 transition-colors hover:text-emerald-700 hover:underline"
        >
          admin girişi
        </Link>
      </div>
    </header>
  );
}
