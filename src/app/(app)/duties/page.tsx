'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CampDutyWithRelations, SessionUser } from '@/types';

export default function DutiesPage() {
  const [duties, setDuties] = useState<CampDutyWithRelations[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [dRes, meRes] = await Promise.all([fetch('/api/duties'), fetch('/api/auth/me')]);
    const dData = await dRes.json();
    const meData = await meRes.json();
    setDuties(dData.duties || []);
    setUser(meData.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function dutyAction(id: string, action: string, extra?: Record<string, string>) {
    setError('');
    const res = await fetch(`/api/duties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'İşlem başarısız');
      return;
    }
    load();
  }

  if (loading) return <p className="text-lg text-gray-500">Yükleniyor...</p>;

  const pendingReleases = duties.filter((d) => d.release_requested);
  const isAdmin = user?.role === 'admin';

  const grouped = duties.reduce<Record<string, CampDutyWithRelations[]>>((acc, d) => {
    const key = `${d.slot_date}-${d.period}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Kamp Görevleri & Plan</h2>

      {isAdmin && duties.length === 0 && (
        <div className="rounded-xl bg-amber-100 p-4">
          <p className="text-lg text-amber-900">Henüz görev planı oluşturulmadı.</p>
          <button
            onClick={async () => {
              const res = await fetch('/api/duties', { method: 'POST' });
              if (res.ok) load();
              else {
                const d = await res.json();
                setError(d.error);
              }
            }}
            className="mt-3 min-h-[48px] w-full rounded-xl bg-emerald-600 text-lg font-semibold text-white"
          >
            Nöbet Planını Oluştur
          </button>
        </div>
      )}

      {isAdmin && pendingReleases.length > 0 && (
        <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
          <h3 className="mb-2 text-lg font-bold text-orange-800">Bırakma İstekleri</h3>
          {pendingReleases.map((d) => (
            <div key={d.id} className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-base">{d.title}</span>
              <button
                onClick={() => dutyAction(d.id, 'approve_release')}
                className="min-h-[44px] rounded-lg bg-emerald-600 px-4 font-semibold text-white"
              >
                Onayla (Boşalt)
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>}

      {duties.length === 0 && !isAdmin ? (
        <p className="text-lg text-gray-500">Admin henüz nöbet planını oluşturmadı.</p>
      ) : (
        Object.entries(grouped).map(([key, group]) => (
          <section key={key} className="rounded-xl border-2 border-gray-200 p-3">
            <h3 className="mb-3 text-lg font-semibold text-emerald-800">
              {group[0].slot_date} — {group[0].period === 'breakfast' ? '☀️ Sabah' : '🌙 Akşam'}
              {group[0].is_departure && ' (Ayrılış)'}
            </h3>
            <div className="flex flex-col gap-3">
              {group.map((d) => {
                const isMine =
                  d.assigned_tent_id === user?.tent_id || d.assigned_user_id === user?.id;
                const isTaken = !!d.assigned_tent_id;
                const bg = isTaken
                  ? isMine
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-gray-50 border-gray-200'
                  : 'bg-amber-50 border-amber-300';

                return (
                  <div key={d.id} className={`rounded-xl border-2 p-3 ${bg}`}>
                    <p className="text-lg font-medium">{d.title}</p>
                    {isTaken && d.assigned_tent && (
                      <p className="mt-1 text-base text-gray-700">
                        → {d.assigned_tent.name}
                        {d.assigned_user?.role === 'admin' && (
                          <span className="ml-2 rounded-full bg-emerald-200 px-2 py-0.5 text-sm font-semibold text-emerald-900">
                            Admin
                          </span>
                        )}
                      </p>
                    )}
                    {d.release_requested && (
                      <p className="mt-1 text-sm font-medium text-orange-700">Bırakma isteği bekliyor</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!isTaken && user?.tent_id && (
                        <button
                          onClick={() => dutyAction(d.id, 'take')}
                          className="min-h-[44px] flex-1 rounded-lg bg-emerald-600 px-3 text-base font-semibold text-white"
                        >
                          Görevi Al
                        </button>
                      )}
                      {isMine && !d.release_requested && (
                        <button
                          onClick={() => dutyAction(d.id, 'request_release')}
                          className="min-h-[44px] flex-1 rounded-lg bg-orange-500 px-3 text-base font-semibold text-white"
                        >
                          Bırakma İste
                        </button>
                      )}
                      {isAdmin && isTaken && (
                        <button
                          onClick={() => dutyAction(d.id, 'admin_unassign')}
                          className="min-h-[44px] rounded-lg bg-red-100 px-3 text-base font-medium text-red-700"
                        >
                          Admin: Boşalt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
