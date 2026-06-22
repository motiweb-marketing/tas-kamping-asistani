'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface AppHeaderProps {
  userName: string;
  isAdmin: boolean;
}

export default function AppHeader({ userName, isAdmin }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <Link href="/home" className="text-lg font-bold text-emerald-800">
          Kamp Asistanı
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg"
            aria-label="Sohbet"
          >
            💬
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-xl bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 sm:text-sm"
            >
              Admin
            </Link>
          )}
          <span className="hidden max-w-[120px] truncate text-sm text-gray-600 md:inline">
            {userName}
          </span>
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}
