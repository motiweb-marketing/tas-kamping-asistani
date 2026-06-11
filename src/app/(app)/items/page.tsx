'use client';

import { useEffect, useState } from 'react';
import ItemCard from '@/components/items/ItemCard';
import type { ItemCategory, ItemWithRelations } from '@/types';

export default function ItemsPage() {
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string; quantity: string; category: ItemCategory }>({
    name: '',
    quantity: '1',
    category: 'food',
  });

  async function loadItems() {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleAssign(itemId: string) {
    const res = await fetch('/api/items/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (res.ok) loadItems();
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      setNewItem({ name: '', quantity: '1', category: 'food' });
      setShowAdd(false);
      loadItems();
    }
  }

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Ana Liste</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="min-h-[44px] rounded-xl bg-blue-600 px-4 text-base font-semibold text-white"
        >
          + Ekle
        </button>
      </div>

      {showAdd && (
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
            Listeye Ekle
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-lg text-gray-500">Henüz liste oluşturulmamış.</p>
      ) : (
        items.map((item) => (
          <ItemCard key={item.id} item={item} onAssign={handleAssign} />
        ))
      )}
    </div>
  );
}
