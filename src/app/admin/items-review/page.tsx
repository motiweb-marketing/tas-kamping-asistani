'use client';

import { useEffect, useState } from 'react';
import type { Item, Tent } from '@/types';

export default function ItemsReviewPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  async function load() {
    const [itemsRes, tentsRes] = await Promise.all([
      fetch('/api/items?published=false&scope=shared'),
      fetch('/api/tents'),
    ]);
    const itemsData = await itemsRes.json();
    const tentsData = await tentsRes.json();
    setItems(itemsData.items || []);
    setTents(tentsData.tents || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateItem(id: string, field: string, value: string | null) {
    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value || null }),
    });
    load();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    load();
  }

  async function publishAll() {
    setPublishing(true);
    await fetch('/api/items/publish', { method: 'POST' });
    setPublishing(false);
    load();
  }

  if (loading) return <p className="text-lg">Yükleniyor...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Ortak Alışveriş Review</h2>
          <p className="text-sm text-gray-600">
            Yalnızca kamp ekibinin birlikte alacağı malzemeler. Kişisel ve çadır listeleri ayrıdır.
          </p>
        </div>
        <button
          onClick={publishAll}
          disabled={publishing || items.length === 0}
          className="min-h-[48px] rounded-xl bg-emerald-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          {publishing ? 'Yayınlanıyor...' : 'Yayınla'}
        </button>
      </div>

      <p className="text-lg text-gray-600">
        {items.length} taslak ortak malzeme — düzenleyin, çadır atayın, ardından yayınlayın.
      </p>

      {items.length === 0 ? (
        <p className="text-lg text-gray-500">Taslak ortak malzeme yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b">
                <th className="p-2">Ad</th>
                <th className="p-2">Miktar</th>
                <th className="p-2">Kategori</th>
                <th className="p-2">Çadır (opsiyonel)</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">
                    <input
                      defaultValue={item.name}
                      onBlur={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full min-w-[140px] rounded border px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      defaultValue={item.quantity}
                      onBlur={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-24 rounded border px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      defaultValue={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="rounded border px-2 py-1"
                    >
                      <option value="food">Yiyecek</option>
                      <option value="equipment">Ekipman</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      defaultValue={item.assigned_tent_id || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'assigned_tent_id', e.target.value || null)
                      }
                      className="max-w-[160px] rounded border px-2 py-1"
                    >
                      <option value="">— Üstlenilmedi —</option>
                      {tents.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="rounded bg-red-100 px-3 py-1 text-red-700"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
