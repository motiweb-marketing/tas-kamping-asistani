'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SECTION_LABELS } from '@/lib/camp-slots';
import type { CampaignSettings } from '@/types';

interface DayCard {
  camp_day_number: number;
  date: string;
  title: string;
  is_arrival: boolean;
  is_departure: boolean;
  show_breakfast: boolean;
  show_meal: boolean;
  show_snack: boolean;
  breakfast: string;
  meal: string;
  snack: string;
}

type SectionKey = 'breakfast' | 'meal' | 'snack';

export default function CampSettingsPage() {
  const [campaign, setCampaign] = useState<{
    name: string;
    location: string;
    start_date: string;
    end_date: string;
  } | null>(null);
  const [dates, setDates] = useState({ start_date: '', end_date: '' });
  const [days, setDays] = useState<DayCard[]>([]);
  const [apiSettings, setApiSettings] = useState<CampaignSettings | null>(null);
  const [savingDates, setSavingDates] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [campRes, daysRes, settingsRes] = await Promise.all([
      fetch('/api/campaign', { cache: 'no-store' }),
      fetch('/api/menus/day', { cache: 'no-store' }),
      fetch('/api/admin/settings'),
    ]);
    const campData = await campRes.json();
    const daysData = await daysRes.json();
    const settingsData = await settingsRes.json();

    if (campRes.ok && campData.campaign) {
      setCampaign(campData.campaign);
      setDates({
        start_date: campData.campaign.start_date,
        end_date: campData.campaign.end_date,
      });
    }
    setDays(daysData.days || []);
    if (settingsRes.ok) setApiSettings(settingsData);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  async function saveDates(e: React.FormEvent) {
    e.preventDefault();
    setSavingDates(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/admin/campaign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dates),
    });
    const data = await res.json();
    setSavingDates(false);

    if (!res.ok) {
      setError(data.error || 'Tarihler kaydedilemedi');
      return;
    }

    setCampaign(data.campaign);
    setMessage(
      `Kamp tarihleri güncellendi. Nöbet planı yenilendi (${data.duties_regenerated} slot).`
    );
    load();
  }

  async function saveDay(card: DayCard) {
    setError('');
    const res = await fetch('/api/menus/day', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
    }
  }

  function updateField(date: string, field: SectionKey, value: string) {
    setDays((prev) =>
      prev.map((d) => (d.date === date ? { ...d, [field]: value } : d))
    );
  }

  function handleBlur(date: string) {
    setDays((prev) => {
      const card = prev.find((d) => d.date === date);
      if (card) void saveDay(card);
      return prev;
    });
  }

  async function generateList() {
    setGenerating(true);
    setMessage('');
    const res = await fetch('/api/ai/generate-items', { method: 'POST' });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) {
      setMessage(data.error || 'Hata oluştu');
      return;
    }
    setMessage(`${data.count} malzeme oluşturuldu. Review ekranından kontrol edin.`);
  }

  const hasMenuContent = days.some(
    (d) => d.breakfast.trim() || d.meal.trim() || d.snack.trim()
  );

  const sections: { key: SectionKey; show: keyof DayCard; label: string }[] = [
    { key: 'breakfast', show: 'show_breakfast', label: SECTION_LABELS.breakfast },
    { key: 'meal', show: 'show_meal', label: SECTION_LABELS.meal },
    { key: 'snack', show: 'show_snack', label: SECTION_LABELS.snack },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Kamp Ayarları</h2>
        <p className="mt-1 text-base text-gray-600">
          Her gün için kahvaltı, akşam yemeği ve ara öğün planını girin. Varış gününde
          yalnızca akşam, ayrılış gününde yalnızca kahvaltı vardır.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-blue-100 p-3 text-lg text-blue-800">{message}</p>
      )}

      <form
        onSubmit={saveDates}
        className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4"
      >
        <h3 className="mb-3 text-lg font-semibold text-emerald-900">Kamp Tarihleri</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Varış (ilk akşam yemeği)</label>
            <input
              type="date"
              value={dates.start_date}
              onChange={(e) => setDates({ ...dates, start_date: e.target.value })}
              className="w-full rounded-xl border-2 px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ayrılış (son kahvaltı)</label>
            <input
              type="date"
              value={dates.end_date}
              onChange={(e) => setDates({ ...dates, end_date: e.target.value })}
              className="w-full rounded-xl border-2 px-4 py-3 text-lg"
              required
            />
          </div>
        </div>
        {campaign && (
          <p className="mt-2 text-sm text-emerald-800">
            {campaign.name} — {campaign.location}
          </p>
        )}
        <button
          type="submit"
          disabled={savingDates}
          className="mt-4 min-h-[48px] w-full rounded-xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {savingDates ? 'Kaydediliyor...' : 'Tarihleri Kaydet'}
        </button>
      </form>

      {days.length === 0 ? (
        <p className="text-gray-500">Geçerli kamp tarihi girin ve kaydedin.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {days.map((card) => (
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

              <div className="mt-4 flex flex-col gap-4">
                {sections.map(({ key, show, label }) =>
                  card[show] ? (
                    <div key={key}>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        {label}
                      </label>
                      <textarea
                        value={card[key]}
                        onChange={(e) => updateField(card.date, key, e.target.value)}
                        onBlur={() => handleBlur(card.date)}
                        placeholder={`${label} tarifi / menü...`}
                        rows={3}
                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ) : null
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {!apiSettings?.configured && (
        <div className="rounded-xl bg-amber-100 p-4 text-lg text-amber-900">
          AI listesi için OpenRouter API anahtarını girin.{' '}
          <Link href="/admin/settings" className="font-semibold underline">
            Ayarlar →
          </Link>
        </div>
      )}

      <button
        onClick={generateList}
        disabled={generating || !hasMenuContent || !apiSettings?.configured}
        className="min-h-[52px] rounded-xl bg-blue-600 text-lg font-semibold text-white disabled:opacity-50"
      >
        {generating ? 'AI Listesi Oluşturuluyor...' : 'Listeyi Oluştur (AI)'}
      </button>
    </div>
  );
}
