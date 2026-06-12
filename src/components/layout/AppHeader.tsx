'use client';

import Link from 'next/link';
import AdminBadge from '@/components/ui/AdminBadge';
import LogoutButton from './LogoutButton';

interface AppHeaderProps {
  userName: string;
  isAdmin: boolean;
}

export default function AppHeader({ userName, isAdmin }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-emerald-800">Kamp Asistanı</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 sm:text-sm"
            >
              Admin
            </Link>
          )}
          <span className="hidden max-w-[120px] truncate items-center text-sm text-gray-600 md:flex">
            {userName}
            {isAdmin && <AdminBadge />}
          </span>
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}
