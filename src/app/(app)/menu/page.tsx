'use client';

import { useCallback, useEffect, useState } from 'react';
import { SECTION_LABELS } from '@/lib/camp-slots';

interface DayCard {
  date: string;
  title: string;
  is_departure: boolean;
  is_arrival: boolean;
  show_breakfast: boolean;
  show_meal: boolean;
  show_snack: boolean;
  breakfast: string;
  meal: string;
  snack: string;
}

export default function MenuPage() {
  const [days, setDays] = useState<DayCard[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [campRes, daysRes] = await Promise.all([
      fetch('/api/campaign', { cache: 'no-store' }),
      fetch('/api/menus/day', { cache: 'no-store' }),
    ]);
    const campData = await campRes.json();
    const daysData = await daysRes.json();

    if (campRes.ok && campData.campaign) {
      setCampaignName(campData.campaign.name);
    }
    setDays(daysData.days || []);
    setIsPublished(!!daysData.is_published);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  const hasContent = days.some(
    (d) => d.breakfast.trim() || d.meal.trim() || d.snack.trim()
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Kamp Menüsü</h2>
        {campaignName && (
          <p className="text-base text-gray-600">{campaignName}</p>
        )}
      </div>

      {days.length === 0 ? (
        <p className="rounded-xl bg-yellow-100 p-4 text-lg text-yellow-800">
          Admin henüz kamp tarihlerini ayarlamadı.
        </p>
      ) : !hasContent ? (
        <p className="text-lg text-gray-500">
          {isPublished
            ? 'Henüz menü girilmedi.'
            : 'Organizatör henüz menüyü paylaşmadı.'}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {days.map((card) => {
            const items = [
              card.show_breakfast && card.breakfast.trim()
                ? { label: SECTION_LABELS.breakfast, text: card.breakfast }
                : null,
              card.show_meal && card.meal.trim()
                ? { label: SECTION_LABELS.meal, text: card.meal }
                : null,
              card.show_snack && card.snack.trim()
                ? { label: SECTION_LABELS.snack, text: card.snack }
                : null,
            ].filter(Boolean) as { label: string; text: string }[];

            if (items.length === 0) return null;

            return (
              <section
                key={card.date}
                className={`rounded-xl border-2 p-4 ${
                  card.is_departure
                    ? 'border-amber-300 bg-amber-50'
                    : card.is_arrival
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold text-emerald-900">{card.title}</h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {items.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="text-sm font-medium text-emerald-700">{item.label}</p>
                      <p className="mt-1 whitespace-pre-wrap text-base text-gray-800">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
