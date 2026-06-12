'use client';

import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  compact?: boolean;
}

export default function LogoutButton({ className = '', compact = false }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`min-h-[40px] rounded-lg border-2 border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 active:bg-red-100 disabled:opacity-50 ${className}`}
    >
      {loading ? '...' : compact ? 'Çıkış' : 'Çıkış Yap'}
    </button>
  );
}
