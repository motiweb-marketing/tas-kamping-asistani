'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import SharedItemCard from '@/components/items/SharedItemCard';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import { clientDuplicateCheck } from '@/lib/item-duplicates';
import { filterItemsBySearch } from '@/lib/item-names';
import type { ItemCategory, ItemListScope, ItemWithRelations } from '@/types';

type Tab = ItemListScope;

const TABS: { id: Tab; label: string; shortLabel: string; hint: string }[] = [
  {
    id: 'shared',
    label: 'Kamp ihtiyaçları',
    shortLabel: 'Kamp',
    hint: 'Ortak alışveriş listesi — çadırınız adet seçerek üstlenir.',
  },
  {
    id: 'personal',
    label: 'Kişisel ihtiyaçlar',
    shortLabel: 'Kişisel',
    hint: 'Kendi çantanız için getirmeniz gerekenler.',
  },
  {
    id: 'tent',
    label: 'Çadır ihtiyaçları',
    shortLabel: 'Çadır',
    hint: 'Çadırınızın bulundurması gereken ekipman.',
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
  const openCount =
    tab === 'shared'
      ? items.filter((i) => (i.remaining_count ?? 1) > 0).length
      : items.filter((i) => !(tab === 'personal' ? i.checked : i.tent_checked)).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Kamp listeleri"
        subtitle={activeTab.hint}
        action={
          <Link
            href="/home"
            className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-emerald-800"
          >
            Ana sayfa
          </Link>
        }
      />

      {campaign && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-bold">{campaign.name}</p>
          <p>
            {campaign.start_date} — {campaign.end_date}
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === t.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="sm:hidden">{t.shortLabel}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {!loading && items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            {openCount > 0 ? (
              <span className="font-semibold text-amber-700">{openCount} eksik</span>
            ) : (
              <span className="font-semibold text-emerald-700">Tamamlandı</span>
            )}
          </p>
          {tab === 'shared' && (
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Turuncu: eksik</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">Yeşil: tamam</span>
            </div>
          )}
        </div>
      )}

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
            className="min-h-[48px] rounded-2xl bg-blue-600 px-5 text-base font-bold text-white shadow-sm"
          >
            + Ekstra Ekle
          </button>
        </div>
      )}

      {showAdd && tab === 'shared' && (
        <form onSubmit={handleAddItem} className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
          <input
            placeholder="Malzeme adı"
            value={newItem.name}
            onChange={(e) => {
              setNewItem({ ...newItem, name: e.target.value });
              setAddError(null);
            }}
            className="mb-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
            required
          />
          {addError && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{addError}</p>
          )}
          <input
            placeholder="Miktar"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="mb-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}
            className="mb-3 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          >
            <option value="food">Yiyecek</option>
            <option value="equipment">Ekipman</option>
          </select>
          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-blue-600 text-lg font-bold text-white"
          >
            Ekle
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-lg text-gray-500">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <SectionCard title="Liste henüz hazır değil">
          {tab === 'shared' ? (
            <p className="text-gray-700">
              Organizatör menü ve alışveriş listesini hazırlayınca burada görünecek. Bu arada{' '}
              <Link href="/menu" className="font-semibold text-emerald-700 underline">
                menüye
              </Link>{' '}
              bakabilirsiniz.
            </p>
          ) : (
            <p className="text-gray-700">
              Organizatör önerilen listeleri eklediğinde burada görünür.
            </p>
          )}
        </SectionCard>
      ) : filteredItems.length === 0 ? (
        <p className="text-lg text-gray-500">Aramanızla eşleşen malzeme yok.</p>
      ) : tab === 'personal' || tab === 'tent' ? (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              checked={tab === 'personal' ? !!item.checked : !!item.tent_checked}
              onToggle={handleCheck}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {standardItems.length > 0 && (
            <SectionCard
              title="Standart malzemeler"
              subtitle="Kişi sayısına göre hesaplanır. Adet seçerek üstlenin."
            >
              <div className="flex flex-col gap-3">
                {standardItems.map((item) => (
                  <SharedItemCard
                    key={item.id}
                    item={item}
                    onUpdated={() => loadItems('shared')}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {foodItems.length > 0 && (
            <SectionCard title="Yemek ve diğer ortak alışveriş">
              <div className="flex flex-col gap-3">
                {foodItems.map((item) => (
                  <SharedItemCard
                    key={item.id}
                    item={item}
                    onUpdated={() => loadItems('shared')}
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}
