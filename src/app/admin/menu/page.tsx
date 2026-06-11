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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ day: '', meal_type: 'breakfast' as 'breakfast' | 'dinner', description: '' });
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    setError('');
    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setForm({ day: '', meal_type: 'breakfast', description: '' });
    load();
  }

  function startEdit(menu: Menu) {
    setEditingId(menu.id);
    setEditForm({
      day: menu.day,
      meal_type: menu.meal_type,
      description: menu.description,
    });
  }

  async function saveEdit(id: string) {
    setError('');
    const res = await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setEditingId(null);
    load();
  }

  async function deleteMenu(id: string) {
    if (!confirm('Bu menü kaydını silmek istediğinize emin misiniz?')) return;
    setError('');
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Silinemedi');
      return;
    }
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

      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
      )}

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
        {menus.length === 0 ? (
          <p className="text-gray-500">Henüz menü yok.</p>
        ) : (
          menus.map((m) => (
            <div key={m.id} className="mb-3 rounded-xl border-2 border-gray-200 p-3">
              {editingId === m.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    value={editForm.day}
                    onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  />
                  <select
                    value={editForm.meal_type}
                    onChange={(e) => setEditForm({ ...editForm, meal_type: e.target.value as 'breakfast' | 'dinner' })}
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  >
                    <option value="breakfast">Kahvaltı</option>
                    <option value="dinner">Akşam Yemeği</option>
                  </select>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(m.id)}
                      className="min-h-[44px] flex-1 rounded-lg bg-emerald-600 font-semibold text-white"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="min-h-[44px] rounded-lg bg-gray-200 px-4"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg">
                    <strong>{m.day}</strong> — {m.meal_type === 'breakfast' ? 'Kahvaltı' : 'Akşam'}: {m.description}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => startEdit(m)}
                      className="min-h-[44px] flex-1 rounded-lg bg-blue-100 font-medium text-blue-800"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => deleteMenu(m.id)}
                      className="min-h-[44px] flex-1 rounded-lg bg-red-100 font-medium text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
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
