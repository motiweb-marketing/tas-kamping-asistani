'use client';

import { useEffect, useState } from 'react';
import type { Item } from '@/types';

export default function ItemsReviewPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  async function load() {
    const res = await fetch('/api/items?published=false');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateItem(id: string, field: string, value: string) {
    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI Liste Review</h2>
        <button
          onClick={publishAll}
          disabled={publishing || items.length === 0}
          className="min-h-[48px] rounded-xl bg-emerald-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          {publishing ? 'Yayınlanıyor...' : 'Yayınla'}
        </button>
      </div>

      <p className="text-lg text-gray-600">
        {items.length} taslak malzeme — düzenleyin, silin, ardından yayınlayın.
      </p>

      {items.length === 0 ? (
        <p className="text-lg text-gray-500">Taslak malzeme yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b">
                <th className="p-2">Ad</th>
                <th className="p-2">Miktar</th>
                <th className="p-2">Kategori</th>
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
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      defaultValue={item.quantity}
                      onBlur={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-20 rounded border px-2 py-1"
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
