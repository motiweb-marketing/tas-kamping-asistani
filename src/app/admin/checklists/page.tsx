'use client';

import { useEffect, useState } from 'react';
import type { Item, ItemListScope } from '@/types';

export default function ChecklistsAdminPage() {
  const [personal, setPersonal] = useState<Item[]>([]);
  const [tent, setTent] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<ItemListScope | null>(null);
  const [newRow, setNewRow] = useState({ name: '', quantity: '1', notes: '' });

  async function load() {
    const [pRes, tRes] = await Promise.all([
      fetch('/api/items?scope=personal&recommendations=true'),
      fetch('/api/items?scope=tent&recommendations=true'),
    ]);
    const pData = await pRes.json();
    const tData = await tRes.json();
    setPersonal(pData.items || []);
    setTent(tData.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

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

  async function addItem(scope: ItemListScope) {
    if (!newRow.name.trim()) return;
    await fetch('/api/items', {
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
    setNewRow({ name: '', quantity: '1', notes: '' });
    setAdding(null);
    load();
  }

  function renderSection(
    title: string,
    description: string,
    scope: ItemListScope,
    rows: Item[]
  ) {
    return (
      <section className="rounded-xl border-2 border-gray-200 p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{description}</p>
        <div className="flex flex-col gap-3">
          {rows.map((item) => (
            <div key={item.id} className="rounded-lg border bg-gray-50 p-3">
              <input
                defaultValue={item.name}
                onBlur={(e) => updateItem(item.id, 'name', e.target.value)}
                className="mb-1 w-full rounded border px-2 py-1 font-medium"
              />
              <div className="flex gap-2">
                <input
                  defaultValue={item.quantity}
                  onBlur={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  className="w-28 rounded border px-2 py-1 text-sm"
                  placeholder="Miktar"
                />
                <input
                  defaultValue={item.notes || ''}
                  onBlur={(e) => updateItem(item.id, 'notes', e.target.value)}
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  placeholder="Not / açıklama"
                />
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
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
                onClick={() => addItem(scope)}
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

  if (loading) return <p className="text-lg">Yükleniyor...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Önerilen Listeler</h2>
        <p className="mt-1 text-gray-600">
          Katılımcılar kamp kaydında bu listeleri görür. Ortak alışveriş listesinden bağımsızdır.
        </p>
      </div>

      {renderSection(
        'Kişisel Liste (her katılımcı)',
        'Deniz ayakkabısı, güneş kremi gibi herkesin kendi getirmesi gerekenler.',
        'personal',
        personal
      )}

      {renderSection(
        'Çadır / Aile Ekipmanı',
        'Priz, çadır ışığı, sinek spreyi gibi çadır başına bulundurulması gerekenler.',
        'tent',
        tent
      )}
    </div>
  );
}
