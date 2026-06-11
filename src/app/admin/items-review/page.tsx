'use client';

import { useCallback, useEffect, useState } from 'react';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import { useDebouncedFn } from '@/hooks/use-debounced-fn';
import { useLocalPatchList } from '@/hooks/use-local-patch-list';
import { filterItemsBySearch } from '@/lib/item-names';
import type { Item, Tent } from '@/types';

export default function ItemsReviewPage() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  const [patchError, setPatchError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const res = await fetch('/api/items?published=false&scope=shared&exclude_standard=true');
    const data = await res.json();
    return (data.items || []) as Item[];
  }, []);

  const { rows: items, loading, reload, setField, patch, remove } =
    useLocalPatchList<Item>(loadItems);

  const debouncedPatch = useDebouncedFn(
    async (id: string, fields: Partial<Item>) => {
      const err = await patch(id, fields);
      setPatchError(err);
    },
    800
  );

  const filteredItems = filterItemsBySearch(items, search);

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
        <span className="block text-sm text-gray-500">
          Değişiklikler yazmayı bıraktıktan ~1 sn sonra otomatik kaydedilir (iPhone uyumlu).
        </span>
      </p>

      {patchError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{patchError}</p>
      )}

      {items.length > 0 && (
        <ItemSearchInput
          value={search}
          onChange={setSearch}
          resultCount={filteredItems.length}
          totalCount={items.length}
        />
      )}

      {items.length === 0 ? (
        <p className="text-lg text-gray-500">Taslak ortak malzeme yok.</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-lg text-gray-500">Aramanızla eşleşen malzeme yok.</p>
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
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b align-top">
                  <td className="p-2">
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setField(item.id, { name: v });
                        debouncedPatch(item.id, { name: v });
                      }}
                      className="w-full rounded border px-2 py-1 text-base"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={item.quantity}
                      onChange={(e) => {
                        const v = e.target.value;
                        setField(item.id, { quantity: v });
                        debouncedPatch(item.id, { quantity: v });
                      }}
                      className="w-full rounded border px-2 py-1 text-base"
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
                      onChange={(e) => {
                        const v = e.target.value;
                        setField(item.id, { notes: v });
                        debouncedPatch(item.id, { notes: v });
                      }}
                      placeholder="Örn: organik tercih"
                      className="w-full rounded border px-2 py-1 text-base"
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
