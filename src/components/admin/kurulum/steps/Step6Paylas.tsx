'use client';

import { useEffect, useState } from 'react';
import TentsManager, { copyLoginInfo } from '@/components/admin/TentsManager';
import { SITE } from '@/lib/site-config';
import type { SafeUser } from '@/types';
import { markCredentialsShared } from '@/components/admin/SetupChecklist';
import AuthButton from '@/components/auth/AuthButton';

export default function Step6Paylas() {
  const [users, setUsers] = useState<SafeUser[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }, []);

  function copyAll() {
    const lines = [
      `${SITE.name} — Kamp girişi`,
      `Adres: ${SITE.url}/login`,
      '',
      ...users.map((u) => `• ${u.name}: kullanıcı adı "${u.username}"`),
      '',
      'Şifrelerinizi organizatörünüzden alın.',
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      markCredentialsShared();
      alert('Tüm giriş bilgisi panoya kopyalandı.');
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-forest-600">
        Katılımcılara giriş adresini ve kendi kullanıcı adlarını WhatsApp veya SMS ile gönderin.
        Şifreleri siz belirlediniz — güvenli bir kanaldan iletin.
      </p>
      <AuthButton type="button" onClick={copyAll}>
        Tüm giriş metnini kopyala
      </AuthButton>
      <div className="rounded-xl border border-forest-100 bg-forest-50 p-4 text-sm text-forest-800">
        <p className="font-semibold">Giriş adresi</p>
        <p className="mt-1 font-mono text-xs">{SITE.url}/login</p>
      </div>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-2 rounded-lg border border-forest-100 bg-white px-4 py-3">
            <span className="text-sm font-medium">{u.name} — @{u.username}</span>
            <button
              type="button"
              onClick={() => copyLoginInfo(u.username)}
              className="shrink-0 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Kopyala
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
