'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import PlatformShell from '@/components/platform/PlatformShell';
import type { PlatformCampaignSummary } from '@/lib/platform-campaigns';

interface Stats {
  total: number;
  trial: number;
  paid: number;
  total_users: number;
  platform_ai: number;
  platform_ai_available: boolean;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function PlatformDashboardPage() {
  const [campaigns, setCampaigns] = useState<PlatformCampaignSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<'all' | 'trial' | 'paid'>('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/platform/campaigns');
    const data = await res.json();
    if (res.ok) {
      setCampaigns(data.campaigns || []);
      setStats(data.stats || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteCampaign(c: PlatformCampaignSummary) {
    if (
      !confirm(
        `"${c.name}" kampı ve TÜM verileri (çadırlar, kişiler, listeler) kalıcı silinecek. Emin misiniz?`
      )
    ) {
      return;
    }
    setDeletingId(c.id);
    const res = await fetch(`/api/platform/campaigns/${c.id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Silinemedi');
      return;
    }
    load();
  }

  const filtered = campaigns.filter((c) => {
    if (filter === 'trial') return c.plan_tier === 'trial';
    if (filter === 'paid') return c.plan_tier === 'paid';
    return true;
  });

  return (
    <PlatformShell title="Müşteri kampları">
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Toplam kamp', value: stats.total },
            { label: 'Deneme', value: stats.trial },
            { label: 'Pro', value: stats.paid },
            { label: 'Toplam kişi', value: stats.total_users },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <p className="mb-6 text-sm text-slate-400">
          Pro kamplarda AI liste ve menü özelliği otomatik dahildir.
          {stats.platform_ai_available ? '' : ' · PLATFORM_OPENROUTER_API_KEY eksik — AI çalışmaz'}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'trial', 'paid'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {f === 'all' ? 'Tümü' : f === 'trial' ? 'Deneme' : 'Pro'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
          Henüz kayıtlı kamp yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Kamp</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Çadır / kişi</th>
                <th className="px-4 py-3">Organizatör</th>
                <th className="px-4 py-3">Son giriş</th>
                <th className="px-4 py-3">AI</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-slate-500">{formatDate(c.created_at)} kayıt</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.plan_tier === 'paid'
                          ? 'bg-emerald-900/50 text-emerald-300'
                          : 'bg-amber-900/40 text-amber-300'
                      }`}
                    >
                      {c.plan_tier === 'paid' ? 'Pro' : 'Deneme'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {c.tents_count}/{c.max_tents} çadır · {c.users_count}/{c.max_users} kişi
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {c.admin_name || '—'}
                    {c.admin_username && (
                      <span className="block text-xs text-slate-500">@{c.admin_username}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(c.last_login_at)}</td>
                  <td className="px-4 py-3">
                    {c.plan_tier === 'paid' ? (
                      <span className="text-emerald-400">Dahil</span>
                    ) : (
                      <span className="text-slate-600">Pro gerekli</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/platform/campaigns/${c.id}`}
                        className="font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Yönet →
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === c.id}
                        onClick={() => deleteCampaign(c)}
                        className="font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === c.id ? '...' : 'Sil'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlatformShell>
  );
}
