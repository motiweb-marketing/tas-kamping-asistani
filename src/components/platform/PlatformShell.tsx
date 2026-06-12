'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function PlatformShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/platform/auth/logout', { method: 'POST' });
    router.push('/platform/login');
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Platform</p>
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/platform"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === '/platform' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tüm kamplar
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Çıkış
          </button>
        </nav>
      </header>
      {children}
    </div>
  );
}
