'use client';

import { useEffect, useState } from 'react';
import type { CampDutyWithRelations, SafeUser, Tent } from '@/types';

export default function AdminDutiesPage() {
  const [duties, setDuties] = useState<CampDutyWithRelations[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [dRes, tRes, uRes] = await Promise.all([
      fetch('/api/duties'),
      fetch('/api/tents'),
      fetch('/api/users'),
    ]);
    const d = await dRes.json();
    const t = await tRes.json();
    const u = await uRes.json();
    setDuties(d.duties || []);
    setTents(t.tents || []);
    setUsers(u.users || []);
  }

  useEffect(() => { load(); }, []);

  async function generatePlan() {
    setMessage('');
    const res = await fetch('/api/duties', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Oluşturulamadı');
      return;
    }
    setMessage(`${data.count} görev slotu oluşturuldu.`);
    load();
  }

  async function assignDuty(dutyId: string, tentId: string) {
    const tent = tents.find((t) => t.id === tentId);
    const tentUsers = users.filter((u) => u.tent_id === tentId);
    const user = tentUsers[0];

    setDuties((prev) =>
      prev.map((d) =>
        d.id === dutyId
          ? {
              ...d,
              assigned_tent_id: tentId,
              assigned_user_id: user?.id || null,
              assigned_tent: tent ? { id: tent.id, name: tent.name } : null,
              assigned_user: user ? { id: user.id, name: user.name, role: user.role } : null,
            }
          : d
      )
    );

    const res = await fetch(`/api/duties/${dutyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin_assign',
        tent_id: tentId,
        user_id: user?.id || null,
      }),
    });
    if (!res.ok) load();
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Kamp Planı Yönetimi</h2>
      <p className="text-base text-gray-600">
        Varış günü akşamdan başlar, ayrılış günü sabah kahvaltısıyla biter.
      </p>

      <button
        onClick={generatePlan}
        className="min-h-[52px] rounded-xl bg-emerald-600 text-lg font-semibold text-white"
      >
        Nöbet Planını Oluştur / Yenile
      </button>

      {message && <p className="rounded-lg bg-blue-100 p-3 text-lg text-blue-800">{message}</p>}

      {duties.map((d) => (
        <div key={d.id} className="rounded-xl border-2 p-3">
          <p className="text-lg font-medium">{d.title}</p>
          <p className="text-sm text-gray-500">{d.slot_date}</p>
          {d.assigned_tent ? (
            <p className="mt-1 text-base">Atanan: {d.assigned_tent.name}</p>
          ) : (
            <select
              className="mt-2 w-full rounded-lg border-2 px-3 py-2 text-lg"
              value=""
              onChange={(e) => {
                if (e.target.value) assignDuty(d.id, e.target.value);
              }}
            >
              <option value="">Çadıra ata...</option>
              {tents.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
