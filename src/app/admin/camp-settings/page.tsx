'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ENTRY_KIND_LABELS,
  generateCampMealSlots,
  slotKey,
  type CampMealSlot,
} from '@/lib/camp-slots';
import type { CampaignSettings, Menu, MenuEntryKind } from '@/types';

export default function CampSettingsPage() {
  const [campaign, setCampaign] = useState<{
    name: string;
    location: string;
    start_date: string;
    end_date: string;
  } | null>(null);
  const [dates, setDates] = useState({ start_date: '', end_date: '' });
  const [menus, setMenus] = useState<Menu[]>([]);
  const [savedSlots, setSavedSlots] = useState<CampMealSlot[]>([]);
  const [apiSettings, setApiSettings] = useState<CampaignSettings | null>(null);
  const [savingDates, setSavingDates] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [campRes, menusRes, settingsRes] = await Promise.all([
      fetch('/api/campaign', { cache: 'no-store' }),
      fetch('/api/menus', { cache: 'no-store' }),
      fetch('/api/admin/settings'),
    ]);
    const campData = await campRes.json();
    const menusData = await menusRes.json();
    const settingsData = await settingsRes.json();

    if (campRes.ok && campData.campaign) {
      setCampaign(campData.campaign);
      setDates({
        start_date: campData.campaign.start_date,
        end_date: campData.campaign.end_date,
      });
      setSavedSlots(
        generateCampMealSlots(
          campData.campaign.start_date,
          campData.campaign.end_date
        )
      );
    }
    setMenus(menusData.menus || []);
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
    setSavedSlots(generateCampMealSlots(data.campaign.start_date, data.campaign.end_date));
    setMessage(
      `Kamp tarihleri güncellendi. Nöbet planı yenilendi (${data.duties_regenerated} slot).`
    );
    load();
  }

  async function addEntry(
    slot: CampMealSlot,
    entry_kind: MenuEntryKind
  ) {
    setError('');
    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: slot.slot_date,
        period: slot.period,
        entry_kind,
        description: '',
        camp_day_number: slot.camp_day_number,
        is_departure: slot.is_departure,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Eklenemedi');
      return;
    }
    load();
  }

  async function saveDescription(id: string, description: string) {
    await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    load();
  }

  async function deleteEntry(id: string) {
    if (!confirm('Bu öğün kaydını silmek istiyor musunuz?')) return;
    await fetch(`/api/menus/${id}`, { method: 'DELETE' });
    load();
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

  const slots =
    dates.start_date && dates.end_date && dates.end_date >= dates.start_date
      ? generateCampMealSlots(dates.start_date, dates.end_date)
      : savedSlots;

  function entriesForSlot(slot: CampMealSlot) {
    return menus.filter(
      (m) =>
        m.day === slot.slot_date &&
        (m.period === slot.period ||
          (!m.period && m.meal_type === slot.period))
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Kamp Ayarları</h2>
        <p className="mt-1 text-base text-gray-600">
          Varış günü akşam yemeğinden başlar, ayrılış günü sabah kahvaltısıyla biter.
          Kaydettiğinizde tüm katılımcıların ekranı güncellenir.
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

      {slots.length === 0 ? (
        <p className="text-gray-500">Geçerli kamp tarihi girin.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {slots.map((slot) => {
            const entries = entriesForSlot(slot);
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
                <p className="text-sm text-gray-500">
                  {slot.period === 'breakfast' ? '☀️ Sabah' : '🌙 Akşam'}
                </p>

                <div className="mt-3 flex flex-col gap-3">
                  {entries.length === 0 ? (
                    <p className="text-sm text-gray-400">Henüz öğün eklenmedi.</p>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-medium text-emerald-800">
                            {ENTRY_KIND_LABELS[entry.entry_kind || 'meal']}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteEntry(entry.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Sil
                          </button>
                        </div>
                        <textarea
                          defaultValue={entry.description}
                          placeholder="Tarif / menü açıklaması yazın..."
                          rows={3}
                          className="w-full rounded-lg border-2 px-3 py-2 text-base"
                          onBlur={(e) => {
                            if (e.target.value.trim() !== entry.description) {
                              saveDescription(entry.id, e.target.value.trim());
                            }
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addEntry(slot, 'breakfast')}
                    className="min-h-[40px] flex-1 rounded-lg bg-orange-100 px-3 text-sm font-medium text-orange-900 sm:flex-none"
                  >
                    + Kahvaltı Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => addEntry(slot, 'meal')}
                    className="min-h-[40px] flex-1 rounded-lg bg-emerald-100 px-3 text-sm font-medium text-emerald-900 sm:flex-none"
                  >
                    + Yemek Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => addEntry(slot, 'snack')}
                    className="min-h-[40px] flex-1 rounded-lg bg-blue-100 px-3 text-sm font-medium text-blue-900 sm:flex-none"
                  >
                    + Ara Öğün Ekle
                  </button>
                </div>
              </section>
            );
          })}
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
        disabled={generating || menus.length === 0 || !apiSettings?.configured}
        className="min-h-[52px] rounded-xl bg-blue-600 text-lg font-semibold text-white disabled:opacity-50"
      >
        {generating ? 'AI Listesi Oluşturuluyor...' : 'Listeyi Oluştur (AI)'}
      </button>
    </div>
  );
}
