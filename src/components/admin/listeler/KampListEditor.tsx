'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import { useDebouncedFn } from '@/hooks/use-debounced-fn';
import { useLocalPatchList } from '@/hooks/use-local-patch-list';
import { clientDuplicateCheck } from '@/lib/item-duplicates';
import { filterItemsBySearch } from '@/lib/item-names';
import type { Item, Tent } from '@/types';

export default function KampListEditor() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  const [patchError, setPatchError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({ name: '', quantity: '1', notes: '', category: 'food' as Item['category'] });
  const [addError, setAddError] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState('');

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

  useEffect(() => {
    fetch('/api/tents')
      .then((r) => r.json())
      .then((d) => setTents(d.tents || []));
  }, []);

  async function publishAll() {
    setPublishing(true);
    setPublishMessage('');
    await fetch('/api/items/publish', { method: 'POST' });
    setPublishing(false);
    setPublishMessage('Kamp ihtiyaçları listesi yayınlandı. Katılımcılar artık görebilir.');
    await reload();
  }

  async function addItem() {
    if (!newRow.name.trim()) return;
    setAddError(null);
    const duplicate = clientDuplicateCheck(newRow.name, items);
    if (duplicate) {
      setAddError(duplicate);
      return;
    }
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRow.name,
        quantity: newRow.quantity,
        category: newRow.category,
        list_scope: 'shared',
        is_recommendation: false,
        is_published: false,
        notes: newRow.notes,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNewRow({ name: '', quantity: '1', notes: '', category: 'food' });
      setAdding(false);
      await reload();
    } else {
      setAddError((data as { error?: string }).error || 'Eklenemedi');
    }
  }

  if (loading) return <p className="text-sm text-forest-500">Yükleniyor...</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
        <strong>Birden fazla çadır:</strong> Yayınlandıktan sonra her çadır listeden adet seçerek
        üstlenebilir. İsterseniz taslakta çadır ataması da yapabilirsiniz.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-forest-600">
          {items.length} taslak madde
          {items.length === 0 && (
            <>
              {' '}
              —{' '}
              <Link href="/admin/menu-duzenle" className="font-semibold underline">
                Menüden AI ile oluşturun
              </Link>{' '}
              veya aşağıdan elle ekleyin.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={publishAll}
          disabled={publishing || items.length === 0}
          className="min-h-[44px] w-full rounded-xl bg-forest-800 px-5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
        >
          {publishing ? 'Yayınlanıyor...' : 'Listeyi yayınla'}
        </button>
      </div>

      {publishMessage && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {publishMessage}
        </p>
      )}

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
        <p className="text-sm text-forest-500">Henüz taslak kamp maddesi yok.</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-sm text-forest-500">Aramanızla eşleşen madde yok.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-forest-100 bg-white p-4 shadow-sm"
            >
              <input
                value={item.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setField(item.id, { name: v });
                  debouncedPatch(item.id, { name: v });
                }}
                className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm font-medium"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={item.quantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    setField(item.id, { quantity: v });
                    debouncedPatch(item.id, { quantity: v });
                  }}
                  className="rounded-lg border border-forest-200 px-3 py-2 text-sm"
                  placeholder="Miktar"
                />
                <select
                  value={item.category}
                  onChange={(e) =>
                    patch(item.id, { category: e.target.value as Item['category'] })
                  }
                  className="rounded-lg border border-forest-200 px-3 py-2 text-sm"
                >
                  <option value="food">Yiyecek</option>
                  <option value="equipment">Ekipman</option>
                </select>
                <input
                  value={item.notes || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setField(item.id, { notes: v });
                    debouncedPatch(item.id, { notes: v });
                  }}
                  placeholder="Not"
                  className="rounded-lg border border-forest-200 px-3 py-2 text-sm sm:col-span-2"
                />
                <select
                  value={item.assigned_tent_id || ''}
                  onChange={(e) =>
                    patch(item.id, { assigned_tent_id: e.target.value || null })
                  }
                  className="rounded-lg border border-forest-200 px-3 py-2 text-sm sm:col-span-2"
                >
                  <option value="">— Çadır ataması yok —</option>
                  {tents.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-xl border-2 border-dashed border-forest-300 bg-forest-50/50 p-4">
          <input
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
            placeholder="Madde adı"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          <div className="mb-2 grid gap-2 sm:grid-cols-2">
            <input
              value={newRow.quantity}
              onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })}
              placeholder="Miktar"
              className="rounded-lg border border-forest-200 px-3 py-2 text-sm"
            />
            <select
              value={newRow.category}
              onChange={(e) =>
                setNewRow({ ...newRow, category: e.target.value as Item['category'] })
              }
              className="rounded-lg border border-forest-200 px-3 py-2 text-sm"
            >
              <option value="food">Yiyecek</option>
              <option value="equipment">Ekipman</option>
            </select>
          </div>
          <input
            value={newRow.notes}
            onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })}
            placeholder="Not"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          {addError && (
            <p className="mb-2 rounded-lg bg-red-50 px-2 py-1 text-sm text-red-700">{addError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg bg-forest-100 px-4 py-2 text-sm font-semibold text-forest-800"
            >
              İptal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm font-semibold text-forest-800 underline"
        >
          + Elle madde ekle
        </button>
      )}
    </div>
  );
}
