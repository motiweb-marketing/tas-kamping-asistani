'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TentsManager, { copyLoginInfo } from '@/components/admin/TentsManager';
import { SITE } from '@/lib/site-config';
import type { SafeUser } from '@/types';
import { markCredentialsShared } from '@/components/admin/SetupChecklist';
import AuthButton from '@/components/auth/AuthButton';

interface SetupSummary {
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  tentCount: number;
  userCount: number;
  menuCount: number;
  publishedItems: number;
}

export default function Step6Paylas() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [summary, setSummary] = useState<SetupSummary | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/campaign').then((r) => r.json()),
      fetch('/api/menus').then((r) => r.json()),
      fetch('/api/items?scope=shared').then((r) => r.json()),
    ]).then(([usersData, campaignData, menusData, itemsData]) => {
      setUsers(usersData.users || []);
      const campaign = campaignData.campaign;
      const menus = (menusData.menus || []).filter((m: { description?: string }) => m.description?.trim());
      const items = itemsData.items || [];
      if (campaign) {
        setSummary({
          name: campaign.name,
          location: campaign.location,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          tentCount: new Set((usersData.users || []).map((u: SafeUser) => u.tent_id).filter(Boolean)).size,
          userCount: (usersData.users || []).length,
          menuCount: menus.length,
          publishedItems: items.filter((i: { is_published: boolean }) => i.is_published).length,
        });
      }
    });
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
      {summary && (
        <div className="rounded-xl border border-forest-100 bg-forest-50 p-4">
          <p className="font-semibold text-forest-900">Kamp özeti</p>
          <p className="mt-1 text-sm text-forest-700">
            {summary.name} · {summary.location}
          </p>
          <p className="text-sm text-forest-600">
            {summary.start_date} — {summary.end_date}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-lg bg-white px-3 py-2 text-center">
              <p className="font-bold text-forest-800">{summary.tentCount}</p>
              <p className="text-xs text-forest-600">Çadır</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 text-center">
              <p className="font-bold text-forest-800">{summary.userCount}</p>
              <p className="text-xs text-forest-600">Kişi</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 text-center">
              <p className="font-bold text-forest-800">{summary.menuCount}</p>
              <p className="text-xs text-forest-600">Öğün</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 text-center">
              <p className="font-bold text-forest-800">{summary.publishedItems}</p>
              <p className="text-xs text-forest-600">Yayınlı malzeme</p>
            </div>
          </div>
          {summary.menuCount === 0 && (
            <p className="mt-3 text-sm text-amber-800">
              Menü henüz girilmedi —{' '}
              <Link href="/admin/menu-duzenle" className="font-semibold underline">
                menüyü tamamlayın
              </Link>
            </p>
          )}
          {summary.publishedItems === 0 && (
            <p className="mt-1 text-sm text-amber-800">
              Ortak liste henüz yayınlanmadı —{' '}
              <Link href="/admin/listeler/kamp" className="font-semibold underline">
                listeyi yayınlayın
              </Link>
            </p>
          )}
        </div>
      )}

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
          <li
            key={u.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-forest-100 bg-white px-4 py-3"
          >
            <span className="text-sm font-medium">
              {u.name} — @{u.username}
            </span>
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
