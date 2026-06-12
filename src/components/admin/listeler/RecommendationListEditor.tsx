'use client';

import { useCallback, useState } from 'react';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import { useDebouncedFn } from '@/hooks/use-debounced-fn';
import { useLocalPatchList } from '@/hooks/use-local-patch-list';
import { clientDuplicateCheck } from '@/lib/item-duplicates';
import { filterItemsBySearch } from '@/lib/item-names';
import type { ListTypeConfig } from '@/lib/list-config';
import type { Item } from '@/types';

export default function RecommendationListEditor({ config }: { config: ListTypeConfig }) {
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({ name: '', quantity: '1', notes: '' });
  const [addError, setAddError] = useState<string | null>(null);
  const [patchError, setPatchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadItems = useCallback(async () => {
    const res = await fetch(`/api/items?scope=${config.scope}&recommendations=true`);
    const data = await res.json();
    return (data.items || []) as Item[];
  }, [config.scope]);

  const { rows, loading, reload, setField, patch, remove } = useLocalPatchList<Item>(loadItems);

  const debouncedPatch = useDebouncedFn(
    async (id: string, fields: Partial<Item>) => {
      const err = await patch(id, fields);
      setPatchError(err);
    },
    800
  );

  const filteredRows = filterItemsBySearch(rows, search);

  async function addItem() {
    if (!newRow.name.trim()) return;
    setAddError(null);
    const duplicate = clientDuplicateCheck(newRow.name, rows);
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
        category: 'equipment',
        list_scope: config.scope,
        is_recommendation: true,
        is_published: true,
        notes: newRow.notes,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNewRow({ name: '', quantity: '1', notes: '' });
      setAdding(false);
      await reload();
    } else {
      setAddError((data as { error?: string }).error || 'Eklenemedi');
    }
  }

  if (loading) return <p className="text-sm text-forest-500">Yükleniyor...</p>;

  return (
    <div className="space-y-4">
      {patchError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{patchError}</p>
      )}

      {rows.length > 0 && (
        <ItemSearchInput
          value={search}
          onChange={setSearch}
          resultCount={filteredRows.length}
          totalCount={rows.length}
        />
      )}

      <div className="flex flex-col gap-3">
        {filteredRows.length === 0 && rows.length > 0 ? (
          <p className="text-sm text-forest-500">Aramanızla eşleşen madde yok.</p>
        ) : (
          filteredRows.map((item) => (
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
              <div className="flex flex-wrap gap-2">
                <input
                  value={item.quantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    setField(item.id, { quantity: v });
                    debouncedPatch(item.id, { quantity: v });
                  }}
                  className="w-28 rounded-lg border border-forest-200 px-3 py-2 text-sm"
                  placeholder="Miktar"
                />
                <input
                  value={item.notes || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setField(item.id, { notes: v });
                    debouncedPatch(item.id, { notes: v });
                  }}
                  className="min-w-[120px] flex-1 rounded-lg border border-forest-200 px-3 py-2 text-sm"
                  placeholder="Not"
                />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {adding ? (
        <div className="rounded-xl border-2 border-dashed border-forest-300 bg-forest-50/50 p-4">
          <input
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
            placeholder="Madde adı"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          <input
            value={newRow.quantity}
            onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })}
            placeholder="Miktar"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          <input
            value={newRow.notes}
            onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })}
            placeholder="Açıklama"
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
          + Yeni madde ekle
        </button>
      )}
    </div>
  );
}
