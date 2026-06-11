'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocalPatchList } from '@/hooks/use-local-patch-list';
import type { Item, Tent } from '@/types';

export default function ItemsReviewPage() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [publishing, setPublishing] = useState(false);

  const loadItems = useCallback(async () => {
    const res = await fetch('/api/items?published=false&scope=shared');
    const data = await res.json();
    return (data.items || []) as Item[];
  }, []);

  const { rows: items, loading, reload, setField, patch, remove } =
    useLocalPatchList<Item>(loadItems);

  const loadTents = useCallback(async () => {
    const res = await fetch('/api/tents');
    const data = await res.json();
    setTents(data.tents || []);
  }, []);

  useEffect(() => {
    loadTents();
  }, [loadTents]);

  async function deleteItem(id: string) {
    await remove(id);
  }

  async function publishAll() {
    setPublishing(true);
    await fetch('/api/items/publish', { method: 'POST' });
    setPublishing(false);
    await reload();
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
          <table className="w-full table-fixed text-left text-base">
            <thead>
              <tr className="border-b">
                <th className="w-[22%] p-2">Ad</th>
                <th className="w-[10%] p-2">Miktar</th>
                <th className="w-[12%] p-2">Kategori</th>
                <th className="w-[24%] p-2">Not</th>
                <th className="w-[18%] p-2">Çadır (opsiyonel)</th>
                <th className="w-[8%] p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b align-top">
                  <td className="p-2">
                    <input
                      value={item.name}
                      onChange={(e) => setField(item.id, { name: e.target.value })}
                      onBlur={(e) => patch(item.id, { name: e.target.value })}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={item.quantity}
                      onChange={(e) => setField(item.id, { quantity: e.target.value })}
                      onBlur={(e) => patch(item.id, { quantity: e.target.value })}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={item.category}
                      onChange={(e) =>
                        patch(item.id, {
                          category: e.target.value as Item['category'],
                        })
                      }
                      className="w-full rounded border px-2 py-1"
                    >
                      <option value="food">Yiyecek</option>
                      <option value="equipment">Ekipman</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      value={item.notes || ''}
                      onChange={(e) => setField(item.id, { notes: e.target.value })}
                      onBlur={(e) => patch(item.id, { notes: e.target.value })}
                      placeholder="Örn: organik tercih"
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={item.assigned_tent_id || ''}
                      onChange={(e) =>
                        patch(item.id, {
                          assigned_tent_id: e.target.value || null,
                        })
                      }
                      className="w-full rounded border px-2 py-1"
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
                      type="button"
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
