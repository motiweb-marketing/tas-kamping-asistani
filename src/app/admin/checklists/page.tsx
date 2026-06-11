'use client';

import { useCallback, useState } from 'react';
import { useDebouncedFn } from '@/hooks/use-debounced-fn';
import { useLocalPatchList } from '@/hooks/use-local-patch-list';
import type { Item, ItemListScope } from '@/types';

function ChecklistSection({
  title,
  description,
  scope,
  rows,
  setField,
  patch,
  debouncedPatch,
  remove,
  onAdd,
  adding,
  setAdding,
  newRow,
  setNewRow,
}: {
  title: string;
  description: string;
  scope: ItemListScope;
  rows: Item[];
  setField: (id: string, fields: Partial<Item>) => void;
  patch: (id: string, fields: Partial<Item>) => Promise<void>;
  debouncedPatch: (id: string, fields: Partial<Item>) => void;
  remove: (id: string) => Promise<void>;
  onAdd: (scope: ItemListScope) => void;
  adding: ItemListScope | null;
  setAdding: (s: ItemListScope | null) => void;
  newRow: { name: string; quantity: string; notes: string };
  setNewRow: (r: { name: string; quantity: string; notes: string }) => void;
}) {
  return (
    <section className="rounded-xl border-2 border-gray-200 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-gray-600">{description}</p>
      <div className="flex flex-col gap-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-lg border bg-gray-50 p-3">
            <input
              value={item.name}
              onChange={(e) => {
                const v = e.target.value;
                setField(item.id, { name: v });
                debouncedPatch(item.id, { name: v });
              }}
              className="mb-1 w-full rounded border px-2 py-1 text-base font-medium"
            />
            <div className="flex flex-wrap gap-2">
              <input
                value={item.quantity}
                onChange={(e) => {
                  const v = e.target.value;
                  setField(item.id, { quantity: v });
                  debouncedPatch(item.id, { quantity: v });
                }}
                className="w-28 rounded border px-2 py-1 text-base"
                placeholder="Miktar"
              />
              <input
                value={item.notes || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setField(item.id, { notes: v });
                  debouncedPatch(item.id, { notes: v });
                }}
                className="min-w-[120px] flex-1 rounded border px-2 py-1 text-base"
                placeholder="Not / açıklama"
              />
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="rounded bg-red-100 px-2 text-sm text-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
      {adding === scope ? (
        <div className="mt-3 rounded-lg border-2 border-dashed border-emerald-300 p-3">
          <input
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
            placeholder="Malzeme adı"
            className="mb-2 w-full rounded border px-2 py-1"
          />
          <input
            value={newRow.quantity}
            onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })}
            placeholder="Miktar"
            className="mb-2 w-full rounded border px-2 py-1"
          />
          <input
            value={newRow.notes}
            onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })}
            placeholder="Açıklama"
            className="mb-2 w-full rounded border px-2 py-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAdd(scope)}
              className="rounded bg-emerald-600 px-3 py-1 text-white"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setAdding(null)}
              className="rounded bg-gray-200 px-3 py-1"
            >
              İptal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(scope)}
          className="mt-3 text-sm font-semibold text-emerald-700"
        >
          + Satır ekle
        </button>
      )}
    </section>
  );
}

export default function ChecklistsAdminPage() {
  const [adding, setAdding] = useState<ItemListScope | null>(null);
  const [newRow, setNewRow] = useState({ name: '', quantity: '1', notes: '' });

  const loadPersonal = useCallback(async () => {
    const res = await fetch('/api/items?scope=personal&recommendations=true');
    const data = await res.json();
    return (data.items || []) as Item[];
  }, []);

  const loadTent = useCallback(async () => {
    const res = await fetch('/api/items?scope=tent&recommendations=true');
    const data = await res.json();
    return (data.items || []) as Item[];
  }, []);

  const personalList = useLocalPatchList<Item>(loadPersonal);
  const tentList = useLocalPatchList<Item>(loadTent);

  const debouncedPersonalPatch = useDebouncedFn(
    (id: string, fields: Partial<Item>) => personalList.patch(id, fields),
    800
  );
  const debouncedTentPatch = useDebouncedFn(
    (id: string, fields: Partial<Item>) => tentList.patch(id, fields),
    800
  );

  const loading = personalList.loading || tentList.loading;

  async function addItem(scope: ItemListScope) {
    if (!newRow.name.trim()) return;
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRow.name,
        quantity: newRow.quantity,
        category: 'equipment',
        list_scope: scope,
        is_recommendation: true,
        is_published: true,
        notes: newRow.notes,
      }),
    });
    if (res.ok) {
      setNewRow({ name: '', quantity: '1', notes: '' });
      setAdding(null);
      if (scope === 'personal') await personalList.reload();
      else await tentList.reload();
    }
  }

  if (loading) return <p className="text-lg">Yükleniyor...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Önerilen Listeler</h2>
        <p className="mt-1 text-gray-600">
          Katılımcılar kamp kaydında bu listeleri görür. Ortak alışveriş listesinden bağımsızdır.
        </p>
      </div>

      <ChecklistSection
        title="Kişisel Liste (her katılımcı)"
        description="Deniz ayakkabısı, güneş kremi gibi herkesin kendi getirmesi gerekenler."
        scope="personal"
        rows={personalList.rows}
        setField={personalList.setField}
        patch={personalList.patch}
        debouncedPatch={debouncedPersonalPatch}
        remove={personalList.remove}
        onAdd={addItem}
        adding={adding}
        setAdding={setAdding}
        newRow={newRow}
        setNewRow={setNewRow}
      />

      <ChecklistSection
        title="Çadır / Aile Ekipmanı"
        description="Priz, çadır ışığı, sinek spreyi gibi çadır başına bulundurulması gerekenler."
        scope="tent"
        rows={tentList.rows}
        setField={tentList.setField}
        patch={tentList.patch}
        debouncedPatch={debouncedTentPatch}
        remove={tentList.remove}
        onAdd={addItem}
        adding={adding}
        setAdding={setAdding}
        newRow={newRow}
        setNewRow={setNewRow}
      />
    </div>
  );
}
