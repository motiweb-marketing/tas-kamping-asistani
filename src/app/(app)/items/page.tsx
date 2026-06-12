'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import SharedItemCard from '@/components/items/SharedItemCard';
import { clientDuplicateCheck } from '@/lib/item-duplicates';
import { filterItemsBySearch } from '@/lib/item-names';
import type { ItemCategory, ItemListScope, ItemWithRelations } from '@/types';

type Tab = ItemListScope;

const TABS: { id: Tab; label: string; shortLabel: string; hint: string }[] = [
  {
    id: 'personal',
    label: 'Kişisel ihtiyaçlar',
    shortLabel: 'Kişisel',
    hint: 'Kendiniz için getirmeniz gerekenler.',
  },
  {
    id: 'tent',
    label: 'Çadır ihtiyaçları',
    shortLabel: 'Çadır',
    hint: 'Çadırınızın bulundurması gereken ekipman.',
  },
  {
    id: 'shared',
    label: 'Kamp ihtiyaçları',
    shortLabel: 'Kamp',
    hint: 'Tüm kampın ortak listesi — çadırınız adet seçerek üstlenir.',
  },
];

interface CampaignBanner {
  name: string;
  start_date: string;
  end_date: string;
}

export default function ItemsPage() {
  const [tab, setTab] = useState<Tab>('shared');
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [campaign, setCampaign] = useState<CampaignBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
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
    fetch('/api/campaign')
      .then((r) => r.json())
      .then((d) => {
        if (d.campaign) {
          setCampaign({
            name: d.campaign.name,
            start_date: d.campaign.start_date,
            end_date: d.campaign.end_date,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setSearch('');
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
    setAddError(null);

    const duplicate = clientDuplicateCheck(newItem.name, items);
    if (duplicate) {
      setAddError(duplicate);
      return;
    }

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, list_scope: 'shared' }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNewItem({ name: '', quantity: '1', category: 'food' });
      setShowAdd(false);
      loadItems(tab);
    } else {
      setAddError((data as { error?: string }).error || 'Eklenemedi');
    }
  }

  const activeTab = TABS.find((t) => t.id === tab)!;
  const filteredItems = filterItemsBySearch(items, search);
  const standardItems = filteredItems.filter((i) => i.is_standard);
  const foodItems = filteredItems.filter((i) => !i.is_standard);

  return (
    <div className="flex flex-col gap-4">
      {campaign && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">{campaign.name}</p>
          <p>
            {campaign.start_date} — {campaign.end_date} · Listeden üstlen → Harcama → Nöbet → Chat
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Kamp Listeleri</h2>
          <p className="mt-1 text-sm text-gray-600">{activeTab.hint}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/summary" className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-emerald-800">
            Özet
          </Link>
          <Link href="/menu" className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-emerald-800">
            Menü
          </Link>
          <Link href="/duties" className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-emerald-800">
            Nöbet
          </Link>
        </div>
      </div>

      {tab === 'shared' && (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span className="font-medium text-amber-700">Turuncu</span> eksik ·{' '}
          <span className="font-medium text-emerald-700">Yeşil</span> tamam ·{' '}
          <span className="font-medium text-blue-700">Mavi</span> ekstra malzeme
        </p>
      )}

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
            <span className="sm:hidden">{t.shortLabel}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {!loading && items.length > 0 && (
        <ItemSearchInput
          value={search}
          onChange={setSearch}
          resultCount={filteredItems.length}
          totalCount={items.length}
        />
      )}

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
            onChange={(e) => {
              setNewItem({ ...newItem, name: e.target.value });
              setAddError(null);
            }}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-lg"
            required
          />
          {addError && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{addError}</p>
          )}
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
        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-gray-700">
          {tab === 'shared' ? (
            <>
              <p className="font-medium">Henüz ortak liste yayınlanmadı.</p>
              <p className="mt-2 text-sm">
                Organizatör menü ve alışveriş listesini hazırlayınca burada görünecek. Bu arada{' '}
                <Link href="/menu" className="font-semibold text-emerald-700 underline">
                  menüye
                </Link>{' '}
                bakabilirsiniz.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Bu liste henüz hazırlanmadı.</p>
              <p className="mt-2 text-sm">Organizatör önerilen listeleri eklediğinde burada görünür.</p>
            </>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-lg text-gray-500">Aramanızla eşleşen malzeme yok.</p>
      ) : tab === 'personal' || tab === 'tent' ? (
        filteredItems.map((item) => (
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
