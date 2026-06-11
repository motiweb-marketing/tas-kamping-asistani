'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CampaignSettings, Menu } from '@/types';

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [apiSettings, setApiSettings] = useState<CampaignSettings | null>(null);
  const [form, setForm] = useState<{ day: string; meal_type: 'breakfast' | 'dinner'; description: string }>({
    day: '',
    meal_type: 'breakfast',
    description: '',
  });
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const [menusRes, settingsRes] = await Promise.all([
      fetch('/api/menus'),
      fetch('/api/admin/settings'),
    ]);
    const menusData = await menusRes.json();
    const settingsData = await settingsRes.json();
    setMenus(menusData.menus || []);
    if (settingsRes.ok) setApiSettings(settingsData);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ day: '', meal_type: 'breakfast', description: '' });
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

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Menü Girişi</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border-2 p-4">
        <input
          type="date"
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
          className="rounded-xl border-2 px-4 py-3 text-lg"
          required
        />
        <select
          value={form.meal_type}
          onChange={(e) => setForm({ ...form, meal_type: e.target.value as 'breakfast' | 'dinner' })}
          className="rounded-xl border-2 px-4 py-3 text-lg"
        >
          <option value="breakfast">Kahvaltı</option>
          <option value="dinner">Akşam Yemeği</option>
        </select>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Menü açıklaması (ör: Menemen, zeytin, peynir...)"
          className="rounded-xl border-2 px-4 py-3 text-lg"
          rows={3}
          required
        />
        <button type="submit" className="min-h-[48px] rounded-xl bg-emerald-600 text-lg font-semibold text-white">
          Menü Kaydet
        </button>
      </form>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Kayıtlı Menüler</h3>
        {menus.map((m) => (
          <div key={m.id} className="mb-2 rounded-lg bg-gray-100 px-4 py-2">
            <strong>{m.day}</strong> — {m.meal_type === 'breakfast' ? 'Kahvaltı' : 'Akşam'}: {m.description}
          </div>
        ))}
      </div>

      {!apiSettings?.configured && (
        <div className="rounded-xl bg-amber-100 p-4 text-lg text-amber-900">
          AI listesi için önce OpenRouter API anahtarını girin.{' '}
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

      {message && (
        <p className="rounded-lg bg-blue-100 p-3 text-lg text-blue-800">{message}</p>
      )}
    </div>
  );
}
