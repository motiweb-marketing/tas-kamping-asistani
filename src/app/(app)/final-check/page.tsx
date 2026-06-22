'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import { getPackedItems, setPackedItem } from '@/lib/final-check-storage';
import type { CampDutyWithRelations, ItemWithRelations, SessionUser } from '@/types';

export default function FinalCheckPage() {
  const [sharedItems, setSharedItems] = useState<ItemWithRelations[]>([]);
  const [tentItems, setTentItems] = useState<ItemWithRelations[]>([]);
  const [personalItems, setPersonalItems] = useState<ItemWithRelations[]>([]);
  const [duties, setDuties] = useState<CampDutyWithRelations[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [packed, setPacked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [meRes, sharedRes, tentRes, personalRes, dutiesRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/items?scope=shared'),
      fetch('/api/items?scope=tent&recommendations=true'),
      fetch('/api/items?scope=personal&recommendations=true'),
      fetch('/api/duties'),
    ]);

    const meData = await meRes.json();
    setUser(meData.user);
    const tentId = meData.user?.tent_id;
    if (meData.user?.id) {
      setPacked(getPackedItems(meData.user.id));
    }

    const sharedData = await sharedRes.json();
    setSharedItems(
      (sharedData.items || []).filter((i: ItemWithRelations) => (i.my_claim || 0) > 0)
    );

    const tentData = await tentRes.json();
    setTentItems(tentData.items || []);

    const personalData = await personalRes.json();
    setPersonalItems(personalData.items || []);

    const dutiesData = await dutiesRes.json();
    setDuties(
      (dutiesData.duties || []).filter(
        (d: CampDutyWithRelations) =>
          d.assigned_tent_id === tentId || d.assigned_user_id === meData.user?.id
      )
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCheck(itemId: string, checked: boolean) {
    const res = await fetch('/api/items/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, checked }),
    });
    if (res.ok) loadAll();
  }

  function handlePackToggle(itemId: string, checked: boolean) {
    if (!user?.id) return;
    setPackedItem(user.id, itemId, checked);
    setPacked(getPackedItems(user.id));
  }

  const sharedDone = sharedItems.filter((i) => packed[i.id]).length;
  const tentDone = tentItems.filter((i) => i.tent_checked).length;
  const personalDone = personalItems.filter((i) => i.checked).length;
  const doneCount = sharedDone + tentDone + personalDone;
  const totalCount = sharedItems.length + tentItems.length + personalItems.length;
  const allDone = totalCount > 0 && doneCount === totalCount;

  const progressPct = useMemo(
    () => (totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0),
    [doneCount, totalCount]
  );

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Yola çıkış kontrolü"
        subtitle="Arabaya binmeden önce tüm sorumluluklarınızı tek tek işaretleyin."
      />

      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
        <p className="text-sm font-medium text-blue-800">Hazırlık durumu</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {doneCount} / {totalCount}
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full transition-all ${allDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {allDone && (
          <p className="mt-3 text-lg font-bold text-emerald-700">
            Harika! Yola çıkmaya hazırsınız.
          </p>
        )}
      </div>

      {totalCount === 0 ? (
        <SectionCard title="Kontrol listesi boş">
          <p className="text-gray-700">
            Henüz üstlenilmiş malzeme veya hazırlık listesi yok.{' '}
            <Link href="/items" className="font-semibold text-emerald-700 underline">
              Kamp listesinden
            </Link>{' '}
            malzeme üstlenebilirsiniz.
          </p>
        </SectionCard>
      ) : (
        <>
          {sharedItems.length > 0 && (
            <SectionCard title="Ortak malzemeler" subtitle="Arabaya yükledim">
              <div className="flex flex-col gap-2">
                {sharedItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 ${
                      packed[item.id]
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!packed[item.id]}
                      onChange={(e) => handlePackToggle(item.id, e.target.checked)}
                      className="h-7 w-7 shrink-0 rounded-lg"
                    />
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${packed[item.id] ? 'text-emerald-800 line-through' : 'text-gray-900'}`}
                      >
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.my_claim} {item.unit_label || 'adet'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </SectionCard>
          )}

          {tentItems.length > 0 && (
            <SectionCard title="Çadır ekipmanı">
              <div className="flex flex-col gap-2">
                {tentItems.map((item) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    checked={!!item.tent_checked}
                    onToggle={handleCheck}
                    compact
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {personalItems.length > 0 && (
            <SectionCard title="Kişisel eşyalar">
              <div className="flex flex-col gap-2">
                {personalItems.map((item) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    checked={!!item.checked}
                    onToggle={handleCheck}
                    compact
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {duties.length > 0 && (
        <SectionCard title="Nöbetleriniz" subtitle="Kamp sırasında üstlendiğiniz görevler">
          <ul className="space-y-2">
            {duties.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{d.title}</span>
                <span className="text-gray-600">
                  {' '}
                  — {d.slot_date} ({d.period === 'breakfast' ? 'Sabah' : 'Akşam'})
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <Link href="/home" className="text-center text-sm font-semibold text-emerald-700 underline">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
