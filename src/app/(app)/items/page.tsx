'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import SharedItemCard from '@/components/items/SharedItemCard';
import type { ItemCategory, ItemListScope, ItemWithRelations } from '@/types';

type Tab = ItemListScope;

const TABS: { id: Tab; label: string; hint: string }[] = [
  {
    id: 'personal',
    label: 'Kişisel',
    hint: 'Kendiniz için getirmeniz gerekenler.',
  },
  {
    id: 'tent',
    label: 'Çadırımız',
    hint: 'Çadırınızın bulundurması gereken ekipman.',
  },
  {
    id: 'shared',
    label: 'Ortak',
    hint: 'Birlikte alınan malzemeler — adet seçerek üstlenin.',
  },
];

export default function ItemsPage() {
  const [tab, setTab] = useState<Tab>('shared');
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string; quantity: string; category: ItemCategory }>({
    name: '',
    quantity: '1',
    category: 'food',
  });

  const loadItems = useCallback(async (scope: Tab) => {
    setLoading(true);
    const extra = scope !== 'shared' ? '&recommendations=true' : '';
    const res = await fetch(`/api/items?scope=${scope}${extra}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems(tab);
  }, [tab, loadItems]);

  async function handleCheck(itemId: string, checked: boolean) {
    const res = await fetch('/api/items/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, checked }),
    });
    if (res.ok) loadItems(tab);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, list_scope: 'shared' }),
    });
    if (res.ok) {
      setNewItem({ name: '', quantity: '1', category: 'food' });
      setShowAdd(false);
      loadItems(tab);
    }
  }

  const activeTab = TABS.find((t) => t.id === tab)!;
  const standardItems = items.filter((i) => i.is_standard);
  const foodItems = items.filter((i) => !i.is_standard);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Kamp Listeleri</h2>
          <p className="mt-1 text-sm text-gray-600">{activeTab.hint}</p>
        </div>
        <Link
          href="/summary"
          className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-emerald-800"
        >
          Özet
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === t.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'shared' && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="min-h-[44px] rounded-xl bg-blue-600 px-4 text-base font-semibold text-white"
          >
            + Ekstra Ekle
          </button>
        </div>
      )}

      {showAdd && tab === 'shared' && (
        <form onSubmit={handleAddItem} className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
          <input
            placeholder="Malzeme adı"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-lg"
            required
          />
          <input
            placeholder="Miktar"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-lg"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}
            className="mb-3 w-full rounded-lg border px-3 py-2 text-lg"
          >
            <option value="food">Yiyecek</option>
            <option value="equipment">Ekipman</option>
          </select>
          <button type="submit" className="w-full min-h-[48px] rounded-xl bg-blue-600 text-lg font-semibold text-white">
            Ekle
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-lg text-gray-500">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <p className="text-lg text-gray-500">
          {tab === 'shared' ? 'Henüz ortak liste yok.' : 'Liste henüz hazırlanmadı.'}
        </p>
      ) : tab === 'personal' || tab === 'tent' ? (
        items.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            checked={tab === 'personal' ? !!item.checked : !!item.tent_checked}
            onToggle={handleCheck}
          />
        ))
      ) : (
        <div className="flex flex-col gap-6">
          {standardItems.length > 0 && (
            <section>
              <h3 className="mb-1 text-lg font-semibold text-emerald-800">
                Standart Malzemeler
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                Kişi sayısına göre otomatik hesaplanır. Adet seçerek üstlenin — hepsini tek çadır getirmek zorunda değil.
              </p>
              <div className="flex flex-col gap-3">
                {standardItems.map((item) => (
                  <SharedItemCard
                    key={item.id}
                    item={item}
                    onUpdated={() => loadItems('shared')}
                  />
                ))}
              </div>
            </section>
          )}

          {foodItems.length > 0 && (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-amber-800">
                Yemek & Diğer Ortak Alışveriş
              </h3>
              <div className="flex flex-col gap-3">
                {foodItems.map((item) => (
                  <SharedItemCard
                    key={item.id}
                    item={item}
                    onUpdated={() => loadItems('shared')}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
