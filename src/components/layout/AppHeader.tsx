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
              className="hidden text-sm font-medium text-emerald-700 sm:inline hover:underline"
            >
              Admin
            </Link>
          )}
          <span className="hidden items-center text-sm text-gray-600 sm:flex">
            {userName}
            {isAdmin && <AdminBadge />}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
