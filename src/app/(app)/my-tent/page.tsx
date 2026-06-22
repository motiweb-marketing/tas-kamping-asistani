'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import SharedItemCard from '@/components/items/SharedItemCard';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import StatCard from '@/components/ui/StatCard';
import { filterItemsBySearch } from '@/lib/item-names';
import type { CampDutyWithRelations, ItemWithRelations, SessionUser } from '@/types';

type FilterTab = 'all' | 'shared' | 'tent' | 'personal' | 'duties';

export default function MyTentPage() {
  const [sharedItems, setSharedItems] = useState<ItemWithRelations[]>([]);
  const [tentItems, setTentItems] = useState<ItemWithRelations[]>([]);
  const [personalItems, setPersonalItems] = useState<ItemWithRelations[]>([]);
  const [duties, setDuties] = useState<CampDutyWithRelations[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');

  const loadAll = useCallback(async (tentId?: string | null) => {
    const [meRes, sharedRes, tentRes, personalRes, dutiesRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/items?scope=shared'),
      fetch('/api/items?scope=tent&recommendations=true'),
      fetch('/api/items?scope=personal&recommendations=true'),
      fetch('/api/duties'),
    ]);

    const meData = await meRes.json();
    setUser(meData.user);

    const sharedData = await sharedRes.json();
    const mine = (sharedData.items || []).filter(
      (i: ItemWithRelations) => (i.my_claim || 0) > 0
    );
    setSharedItems(mine);

    const tentData = await tentRes.json();
    setTentItems(tentData.items || []);

    const personalData = await personalRes.json();
    setPersonalItems(personalData.items || []);

    const dutiesData = await dutiesRes.json();
    const myDuties = (dutiesData.duties || []).filter(
      (d: CampDutyWithRelations) =>
        d.assigned_tent_id === (tentId ?? meData.user?.tent_id) ||
        d.assigned_user_id === meData.user?.id
    );
    setDuties(myDuties);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCheck(itemId: string, checked: boolean) {
    const res = await fetch('/api/items/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, checked }),
    });
    if (res.ok) loadAll(user?.tent_id);
  }

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  if (!user?.tent_id) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-lg text-amber-900">
        Henüz bir çadıra atanmadınız. Organizatörünüzle iletişime geçin.
      </div>
    );
  }

  const allItems = [...sharedItems, ...tentItems, ...personalItems];
  const filteredShared = filterItemsBySearch(sharedItems, search);
  const filteredTent = filterItemsBySearch(tentItems, search);
  const filteredPersonal = filterItemsBySearch(personalItems, search);
  const filteredDuties = duties.filter(
    (d) =>
      !search.trim() ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.slot_date.includes(search)
  );

  const personalDone = personalItems.filter((i) => i.checked).length;
  const tentDone = tentItems.filter((i) => i.tent_checked).length;
  const totalChecklist = personalItems.length + tentItems.length;
  const doneChecklist = personalDone + tentDone;

  const showShared = filter === 'all' || filter === 'shared';
  const showTent = filter === 'all' || filter === 'tent';
  const showPersonal = filter === 'all' || filter === 'personal';
  const showDuties = filter === 'all' || filter === 'duties';

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Sorumluluklarım"
        subtitle="Çadırınızın üstlendiği malzemeler, kişisel eşyalar ve nöbetler tek yerde."
        action={
          <Link
            href="/final-check"
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
          >
            Son kontrol
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Ortak malzeme" value={sharedItems.length} tone="info" />
        <StatCard label="Çadır ekipmanı" value={tentItems.length} />
        <StatCard label="Kişisel eşya" value={personalItems.length} />
        <StatCard label="Nöbet" value={duties.length} tone={duties.length > 0 ? 'success' : 'default'} />
      </div>

      {totalChecklist > 0 && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-emerald-900">Hazırlık ilerlemesi</p>
            <p className="text-sm font-bold text-emerald-800">
              {doneChecklist}/{totalChecklist}
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all' as const, label: 'Tümü' },
          { id: 'shared' as const, label: 'Ortak' },
          { id: 'tent' as const, label: 'Çadır' },
          { id: 'personal' as const, label: 'Kişisel' },
          { id: 'duties' as const, label: 'Nöbet' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-bold ${
              filter === t.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {allItems.length > 0 && (
        <ItemSearchInput
          value={search}
          onChange={setSearch}
          resultCount={
            filteredShared.length + filteredTent.length + filteredPersonal.length + filteredDuties.length
          }
          totalCount={allItems.length + duties.length}
        />
      )}

      {showShared && (
        <SectionCard
          title={`Ortak alışveriş (${sharedItems.length})`}
          subtitle="Kamp listesinden üstlendiğiniz malzemeler"
        >
          {sharedItems.length === 0 ? (
            <p className="text-gray-600">
              Henüz ortak listeden malzeme üstlenilmedi.{' '}
              <Link href="/items" className="font-semibold text-emerald-700 underline">
                Listeye git
              </Link>
            </p>
          ) : filteredShared.length === 0 && search.trim() ? (
            <p className="text-gray-500">Aramanızla eşleşen ortak malzeme yok.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredShared.map((item) => (
                <SharedItemCard
                  key={item.id}
                  item={item}
                  onUpdated={() => loadAll(user.tent_id)}
                />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {showTent && (
        <SectionCard title={`Çadır ekipmanı (${tentItems.length})`}>
          {filteredTent.length === 0 && search.trim() && tentItems.length > 0 ? (
            <p className="text-gray-500">Aramanızla eşleşen çadır ekipmanı yok.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTent.map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  checked={!!item.tent_checked}
                  onToggle={handleCheck}
                />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {showPersonal && (
        <SectionCard title={`Kişisel eşyalar (${personalItems.length})`}>
          {filteredPersonal.length === 0 && search.trim() && personalItems.length > 0 ? (
            <p className="text-gray-500">Aramanızla eşleşen kişisel eşya yok.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredPersonal.map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  checked={!!item.checked}
                  onToggle={handleCheck}
                />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {showDuties && (
        <SectionCard title={`Nöbetlerim (${duties.length})`}>
          {duties.length === 0 ? (
            <p className="text-gray-600">
              Henüz nöbet almadınız.{' '}
              <Link href="/duties" className="font-semibold text-emerald-700 underline">
                Nöbet planına git
              </Link>
            </p>
          ) : filteredDuties.length === 0 ? (
            <p className="text-gray-500">Aramanızla eşleşen nöbet yok.</p>
          ) : (
            <ul className="space-y-2">
              {filteredDuties.map((d) => (
                <li
                  key={d.id}
                  className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3"
                >
                  <p className="font-semibold text-gray-900">{d.title}</p>
                  <p className="text-sm text-gray-600">
                    {d.slot_date} — {d.period === 'breakfast' ? 'Sabah' : 'Akşam'}
                    {d.is_departure && ' (Ayrılış)'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}
