'use client';

import { useCallback, useEffect, useState } from 'react';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import ItemCard from '@/components/items/ItemCard';
import type { ItemCategory, ItemListScope, ItemWithRelations } from '@/types';

type Tab = ItemListScope;

const TABS: { id: Tab; label: string; hint: string }[] = [
  {
    id: 'personal',
    label: 'Kişisel',
    hint: 'Kendiniz için getirmeniz gerekenler — herkes kendi listesini işaretler.',
  },
  {
    id: 'tent',
    label: 'Çadırımız',
    hint: 'Çadırınızın (ailenizin) bulundurması gereken ekipman.',
  },
  {
    id: 'shared',
    label: 'Ortak Alışveriş',
    hint: 'Kamp ekibinin birlikte alacağı malzemeler — çadırınız üstlenebilir.',
  },
];

export default function ItemsPage() {
  const [tab, setTab] = useState<Tab>('personal');
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [myTentId, setMyTentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string; quantity: string; category: ItemCategory }>({
    name: '',
    quantity: '1',
    category: 'food',
  });

  const loadItems = useCallback(async (scope: Tab) => {
    const extra = scope !== 'shared' ? '&recommendations=true' : '';
    const res = await fetch(`/api/items?scope=${scope}${extra}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setMyTentId(meData.user?.tent_id ?? null);
      await loadItems(tab);
    }
    init();
  }, [tab, loadItems]);

  async function handleAssign(itemId: string) {
    const res = await fetch('/api/items/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (res.ok) loadItems(tab);
  }

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

  const sharedMine = items.filter((i) => i.assigned_tent_id === myTentId);
  const sharedOpen = items.filter((i) => !i.assigned_tent_id);
  const sharedOthers = items.filter(
    (i) => i.assigned_tent_id && i.assigned_tent_id !== myTentId
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Kamp Listeleri</h2>
        <p className="mt-1 text-sm text-gray-600">{activeTab.hint}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setLoading(true);
              setTab(t.id);
            }}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === t.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'shared' && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="min-h-[44px] rounded-xl bg-blue-600 px-4 text-base font-semibold text-white"
          >
            + Ortak Listeye Ekle
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
          {tab === 'shared'
            ? 'Henüz ortak alışveriş listesi yayınlanmadı.'
            : 'Liste henüz hazırlanmadı.'}
        </p>
      ) : tab === 'personal' ? (
        items.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            checked={!!item.checked}
            onToggle={handleCheck}
          />
        ))
      ) : tab === 'tent' ? (
        items.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            checked={!!item.tent_checked}
            onToggle={handleCheck}
          />
        ))
      ) : (
        <div className="flex flex-col gap-6">
          {sharedMine.length > 0 && (
            <section>
              <h3 className="mb-2 text-lg font-semibold text-emerald-800">
                Çadırımızın Getirecekleri
              </h3>
              <div className="flex flex-col gap-3">
                {sharedMine.map((item) => (
                  <ItemCard key={item.id} item={item} showAssignButton={false} />
                ))}
              </div>
            </section>
          )}

          {sharedOpen.length > 0 && (
            <section>
              <h3 className="mb-2 text-lg font-semibold text-amber-800">
                Üstlenilebilir Malzemeler
              </h3>
              <div className="flex flex-col gap-3">
                {sharedOpen.map((item) => (
                  <ItemCard key={item.id} item={item} onAssign={handleAssign} />
                ))}
              </div>
            </section>
          )}

          {sharedOthers.length > 0 && (
            <section>
              <h3 className="mb-2 text-lg font-semibold text-gray-600">
                Diğer Çadırların Getirecekleri
              </h3>
              <div className="flex flex-col gap-3">
                {sharedOthers.map((item) => (
                  <ItemCard key={item.id} item={item} showAssignButton={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
