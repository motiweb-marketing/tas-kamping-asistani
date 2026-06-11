'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDebouncedFn } from '@/hooks/use-debounced-fn';
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
    adult_accommodation_fee: number;
    child_accommodation_fee: number;
  } | null>(null);
  const [dates, setDates] = useState({ start_date: '', end_date: '' });
  const [accommodationFees, setAccommodationFees] = useState({
    adult_accommodation_fee: '',
    child_accommodation_fee: '',
  });
  const [savingFees, setSavingFees] = useState(false);
  const [days, setDays] = useState<DayCard[]>([]);
  const [publishedDays, setPublishedDays] = useState<DayCard[] | null>(null);
  const [menuAiPrompt, setMenuAiPrompt] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [apiSettings, setApiSettings] = useState<CampaignSettings | null>(null);
  const [savingDates, setSavingDates] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const editingCount = useRef(0);
  const daysRef = useRef(days);
  daysRef.current = days;

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
      if (editingCount.current === 0) {
        setDates({
          start_date: campData.campaign.start_date,
          end_date: campData.campaign.end_date,
        });
        setAccommodationFees({
          adult_accommodation_fee: String(campData.campaign.adult_accommodation_fee ?? 0),
          child_accommodation_fee: String(campData.campaign.child_accommodation_fee ?? 0),
        });
        if (daysData.menu_ai_prompt !== undefined) {
          setMenuAiPrompt(daysData.menu_ai_prompt || '');
        }
      }
    }
    if (editingCount.current === 0) {
      setDays(daysData.days || []);
      setPublishedDays(daysData.published_days || null);
      setIsPublished(!!daysData.is_published);
    }
    if (settingsRes.ok) setApiSettings(settingsData);
  }, []);

  useEffect(() => {
    load();
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

  async function saveAccommodationFees(e: React.FormEvent) {
    e.preventDefault();
    setSavingFees(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/admin/campaign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adult_accommodation_fee: Number(accommodationFees.adult_accommodation_fee),
        child_accommodation_fee: Number(accommodationFees.child_accommodation_fee),
      }),
    });
    const data = await res.json();
    setSavingFees(false);

    if (!res.ok) {
      setError(data.error || 'Konaklama ücretleri kaydedilemedi');
      return;
    }

    setCampaign(data.campaign);
    setMessage('Konaklama ücretleri kaydedildi. Bakiye hesabına yansır.');
  }

  async function saveAiPrompt() {
    setSavingPrompt(true);
    setError('');
    const res = await fetch('/api/admin/campaign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_ai_prompt: menuAiPrompt }),
    });
    setSavingPrompt(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Prompt kaydedilemedi');
      return;
    }
    setMessage('AI talimatı kaydedildi.');
  }

  async function saveDay(card: DayCard, showFeedback = false) {
    if (showFeedback) setSavingDay(card.date);
    const res = await fetch('/api/menus/day', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: card.date,
        camp_day_number: card.camp_day_number,
        is_arrival: card.is_arrival,
        is_departure: card.is_departure,
        breakfast: card.breakfast,
        meal: card.meal,
        snack: card.snack,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
    } else if (showFeedback) {
      setMessage(`${card.title} kaydedildi.`);
    }
    if (showFeedback) setSavingDay(null);
  }

  const debouncedSaveDay = useDebouncedFn((date: string) => {
    const card = daysRef.current.find((d) => d.date === date);
    if (card) void saveDay(card);
  }, 1000);

  function updateField(date: string, field: SectionKey, value: string) {
    setDays((prev) =>
      prev.map((d) => (d.date === date ? { ...d, [field]: value } : d))
    );
    debouncedSaveDay(date);
  }

  async function publishMenu() {
    setPublishing(true);
    setError('');
    setMessage('');
    const res = await fetch('/api/ai/publish-menu', { method: 'POST' });
    const data = await res.json();
    setPublishing(false);
    if (!res.ok) {
      setError(data.error || 'Menü yayınlanamadı');
      return;
    }
    setPublishedDays(data.days);
    setIsPublished(true);
    setMessage('Menü AI ile düzenlendi ve katılımcılara yayınlandı.');
  }

  async function generateList() {
    setGenerating(true);
    setMessage('');
    setError('');
    const res = await fetch('/api/ai/generate-items', { method: 'POST' });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) {
      setError(data.error || 'Hata oluştu');
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
          Ham menü notlarını girin, AI talimatı verin, ardından menüyü yayınlayın.
          Katılımcılar yayınlanmış menüyü görür.
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

      <form
        onSubmit={saveAccommodationFees}
        className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4"
      >
        <h3 className="mb-2 text-lg font-semibold text-blue-900">Tesis Konaklama Ücreti</h3>
        <p className="mb-3 text-sm text-blue-800">
          Çadır / tesis kişi başı konaklama bedeli. Yetişkin ve çocuk fiyatları ayrı girilir; bütçe
          bakiyesinde her çadırın üyelerine göre hesaplanır (15 yaş altı = çocuk).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Yetişkin (15+) — kişi başı (₺)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={accommodationFees.adult_accommodation_fee}
              onChange={(e) =>
                setAccommodationFees({
                  ...accommodationFees,
                  adult_accommodation_fee: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Çocuk (15 altı) — kişi başı (₺)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={accommodationFees.child_accommodation_fee}
              onChange={(e) =>
                setAccommodationFees({
                  ...accommodationFees,
                  child_accommodation_fee: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 px-4 py-3 text-lg"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingFees}
          className="mt-4 min-h-[48px] w-full rounded-xl bg-blue-600 text-lg font-semibold text-white disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {savingFees ? 'Kaydediliyor...' : 'Konaklama Ücretlerini Kaydet'}
        </button>
      </form>

      <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-purple-900">AI Menü Talimatı</h3>
        <p className="mb-3 text-sm text-purple-800">
          AI ham notlarınızı bu talimatlara göre düzenleyip katılımcılara sunar.
        </p>
        <textarea
          value={menuAiPrompt}
          onChange={(e) => setMenuAiPrompt(e.target.value)}
          onFocus={() => { editingCount.current += 1; }}
          onBlur={() => { editingCount.current = Math.max(0, editingCount.current - 1); }}
          placeholder="Örn: Menüleri aile dostu ve net yaz. Vejetaryen seçenekleri belirt. Porsiyonları 12 kişi için hesapla..."
          rows={4}
          className="w-full rounded-lg border-2 border-purple-200 px-3 py-2 text-base"
        />
        <button
          type="button"
          onClick={saveAiPrompt}
          disabled={savingPrompt}
          className="mt-3 min-h-[44px] rounded-lg bg-purple-600 px-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {savingPrompt ? 'Kaydediliyor...' : 'Talimatı Kaydet'}
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Ham Menü Notları</h3>
        <p className="mb-3 text-sm text-gray-500">
          Yazmayı bıraktıktan ~1 sn sonra otomatik kaydedilir. iPhone&apos;da emin olmak için gün kartındaki Kaydet&apos;e de basabilirsiniz.
        </p>
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
                <h4 className="text-lg font-semibold text-emerald-900">{card.title}</h4>
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
                          onFocus={() => { editingCount.current += 1; }}
                          onBlur={() => { editingCount.current = Math.max(0, editingCount.current - 1); }}
                          placeholder={`${label} notları...`}
                          rows={3}
                          className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    ) : null
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => saveDay(card, true)}
                  disabled={savingDay === card.date}
                  className="mt-4 min-h-[44px] w-full rounded-lg bg-emerald-600 text-base font-semibold text-white disabled:opacity-50"
                >
                  {savingDay === card.date ? 'Kaydediliyor...' : 'Bu Günü Kaydet'}
                </button>
              </section>
            ))}
          </div>
        )}
      </div>

      {!apiSettings?.configured && (
        <div className="rounded-xl bg-amber-100 p-4 text-lg text-amber-900">
          AI için OpenRouter API anahtarını girin.{' '}
          <Link href="/admin/settings" className="font-semibold underline">
            Ayarlar →
          </Link>
        </div>
      )}

      <button
        onClick={publishMenu}
        disabled={publishing || !hasMenuContent || !apiSettings?.configured}
        className="min-h-[52px] rounded-xl bg-purple-600 text-lg font-semibold text-white disabled:opacity-50"
      >
        {publishing ? 'AI Menüyü Düzenliyor...' : 'Menüyü AI ile Düzenle ve Yayınla'}
      </button>

      {isPublished && publishedDays && (
        <div>
          <h3 className="mb-2 text-lg font-semibold text-emerald-800">
            Yayınlanan Menü (katılımcıların gördüğü)
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {publishedDays.map((card) => (
              <section key={card.date} className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                <h4 className="font-semibold text-emerald-900">{card.title}</h4>
                <div className="mt-2 space-y-2 text-base text-gray-800">
                  {card.show_breakfast && card.breakfast.trim() && (
                    <p><strong>Kahvaltı:</strong> {card.breakfast}</p>
                  )}
                  {card.show_meal && card.meal.trim() && (
                    <p><strong>Yemek:</strong> {card.meal}</p>
                  )}
                  {card.show_snack && card.snack.trim() && (
                    <p><strong>Ara Öğün:</strong> {card.snack}</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={generateList}
        disabled={generating || !hasMenuContent || !apiSettings?.configured}
        className="min-h-[52px] rounded-xl bg-blue-600 text-lg font-semibold text-white disabled:opacity-50"
      >
        {generating ? 'AI Listesi Oluşturuluyor...' : 'Alışveriş Listesini Oluştur (AI)'}
      </button>
    </div>
  );
}
