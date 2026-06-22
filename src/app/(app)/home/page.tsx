'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AlertBanner from '@/components/ui/AlertBanner';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import StatCard from '@/components/ui/StatCard';

interface DashboardData {
  campaign: {
    name: string;
    location: string;
    start_date: string;
    end_date: string;
  } | null;
  user: { name: string; tent_id: string | null };
  stats: {
    days_until_start: number | null;
    open_shared_items: number;
    my_shared_claims: number;
    my_personal_unchecked: number;
    my_tent_unchecked: number;
    my_duties: number;
    open_duties: number;
    expense_count: number;
    checklist_total: number;
    checklist_done: number;
  };
}

function daysLabel(days: number | null): string {
  if (days === null) return '—';
  if (days > 1) return `${days} gün kaldı`;
  if (days === 1) return 'Yarın başlıyor!';
  if (days === 0) return 'Bugün başlıyor!';
  return 'Kamp devam ediyor';
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  if (!data) {
    return <p className="text-lg text-gray-500">Özet yüklenemedi.</p>;
  }

  const { campaign, stats } = data;
  const checklistPct =
    stats.checklist_total > 0
      ? Math.round((stats.checklist_done / stats.checklist_total) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Merhaba, ${data.user.name.split(' ')[0]}!`}
        subtitle="Kampa hazırlık durumunuz ve yapılacaklar burada."
      />

      {campaign && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Sıradaki kamp</p>
          <h3 className="mt-1 text-xl font-bold text-gray-900">{campaign.name}</h3>
          <p className="text-sm text-gray-600">
            {campaign.location} · {campaign.start_date} — {campaign.end_date}
          </p>
          <p className="mt-3 text-2xl font-bold text-emerald-800">
            {daysLabel(stats.days_until_start)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Üstlendiğim malzeme"
          value={stats.my_shared_claims}
          tone={stats.my_shared_claims > 0 ? 'success' : 'default'}
        />
        <StatCard
          label="Hazırlık ilerlemesi"
          value={`%${checklistPct}`}
          hint={`${stats.checklist_done}/${stats.checklist_total} tamam`}
          tone={checklistPct === 100 ? 'success' : 'info'}
        />
        <StatCard
          label="Nöbetlerim"
          value={stats.my_duties}
          tone={stats.my_duties > 0 ? 'info' : 'default'}
        />
        <StatCard
          label="Harcama kaydı"
          value={stats.expense_count}
        />
      </div>

      {stats.open_shared_items > 0 && (
        <AlertBanner
          tone="warning"
          title="Henüz üstlenilmemiş malzemeler var"
          message={`Ortak listede ${stats.open_shared_items} malzeme eksik. Çadırınız adına üstlenebilirsiniz.`}
          href="/items"
          linkLabel="Listeye git →"
        />
      )}

      {stats.my_personal_unchecked + stats.my_tent_unchecked > 0 && (
        <AlertBanner
          tone="info"
          title="Hazırlık listenizde eksikler var"
          message={`${stats.my_personal_unchecked + stats.my_tent_unchecked} eşya henüz hazır değil.`}
          href="/my-tent"
          linkLabel="Sorumluluklarım →"
        />
      )}

      {stats.open_duties > 0 && (
        <AlertBanner
          tone="info"
          title="Boş nöbetler var"
          message={`${stats.open_duties} nöbet henüz alınmadı.`}
          href="/duties"
          linkLabel="Nöbet planına git →"
        />
      )}

      <SectionCard title="Hızlı işlemler" subtitle="Sık kullanılan sayfalar">
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/items', label: 'Kamp listesi', icon: '📋' },
            { href: '/my-tent', label: 'Sorumluluklarım', icon: '⛺' },
            { href: '/final-check', label: 'Yola çıkış kontrolü', icon: '🚗' },
            { href: '/budget', label: 'Harcama & bakiye', icon: '💰' },
            { href: '/menu', label: 'Menü', icon: '🍽️' },
            { href: '/chat', label: 'Sohbet', icon: '💬' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-gray-100 bg-gray-50 px-3 py-4 text-center transition-colors hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      <Link
        href="/final-check"
        className="flex min-h-[56px] items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-md active:bg-emerald-700"
      >
        🚗 Yola çıkış kontrolüne başla
      </Link>
    </div>
  );
}
