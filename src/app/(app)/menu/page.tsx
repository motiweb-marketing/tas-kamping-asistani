'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ENTRY_KIND_LABELS,
  generateCampMealSlots,
  slotKey,
  type CampMealSlot,
} from '@/lib/camp-slots';
import type { Menu } from '@/types';

export default function MenuPage() {
  const [slots, setSlots] = useState<CampMealSlot[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [campRes, menusRes] = await Promise.all([
      fetch('/api/campaign', { cache: 'no-store' }),
      fetch('/api/menus', { cache: 'no-store' }),
    ]);
    const campData = await campRes.json();
    const menusData = await menusRes.json();

    if (campRes.ok && campData.campaign) {
      setCampaignName(campData.campaign.name);
      setSlots(
        generateCampMealSlots(
          campData.campaign.start_date,
          campData.campaign.end_date
        )
      );
    }
    setMenus(menusData.menus || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  function entriesForSlot(slot: CampMealSlot) {
    return menus.filter(
      (m) =>
        m.day === slot.slot_date &&
        (m.period === slot.period ||
          (!m.period && m.meal_type === slot.period)) &&
        m.description?.trim()
    );
  }

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Kamp Menüsü</h2>
        {campaignName && (
          <p className="text-base text-gray-600">{campaignName}</p>
        )}
      </div>

      {slots.length === 0 ? (
        <p className="rounded-xl bg-yellow-100 p-4 text-lg text-yellow-800">
          Admin henüz kamp tarihlerini ayarlamadı.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {slots.map((slot) => {
            const entries = entriesForSlot(slot);
            if (entries.length === 0) return null;

            return (
              <section
                key={slotKey(slot.slot_date, slot.period)}
                className={`rounded-xl border-2 p-4 ${
                  slot.is_departure
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold text-emerald-900">{slot.title}</h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="text-sm font-medium text-emerald-700">
                        {ENTRY_KIND_LABELS[entry.entry_kind || 'meal']}
                      </p>
                      <p className="mt-1 text-base text-gray-800 whitespace-pre-wrap">
                        {entry.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {slots.length > 0 &&
        slots.every((s) => entriesForSlot(s).length === 0) && (
          <p className="text-lg text-gray-500">
            Henüz menü girilmedi. Organizatör Kamp Ayarlarından ekleyecek.
          </p>
        )}
    </div>
  );
}
