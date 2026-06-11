'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import SharedItemCard from '@/components/items/SharedItemCard';
import type { ItemWithRelations, SessionUser } from '@/types';

export default function MyTentPage() {
  const [sharedItems, setSharedItems] = useState<ItemWithRelations[]>([]);
  const [tentItems, setTentItems] = useState<ItemWithRelations[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadShared(tentId: string) {
    const res = await fetch('/api/items?scope=shared');
    const data = await res.json();
    const mine = (data.items || []).filter(
      (i: ItemWithRelations) => (i.my_claim || 0) > 0
    );
    setSharedItems(mine);
  }

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      if (meData.user?.tent_id) {
        await loadShared(meData.user.tent_id);
        const tentRes = await fetch('/api/items?scope=tent&recommendations=true');
        const tentData = await tentRes.json();
        setTentItems(tentData.items || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCheck(itemId: string, checked: boolean) {
    const res = await fetch('/api/items/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, checked }),
    });
    if (res.ok) {
      const tentRes = await fetch('/api/items?scope=tent&recommendations=true');
      const tentData = await tentRes.json();
      setTentItems(tentData.items || []);
    }
  }

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  if (!user?.tent_id) {
    return (
      <div className="rounded-xl bg-yellow-100 p-6 text-lg text-yellow-800">
        Henüz bir çadıra atanmadınız. Admin ile iletişime geçin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Çadırımız</h2>
          <p className="text-gray-600">Üstlendiğimiz ortak malzemeler ve çadır ekipmanı.</p>
        </div>
        <Link href="/summary" className="text-sm font-semibold text-emerald-700 underline">
          Kamp özeti
        </Link>
      </div>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-emerald-800">
          Ortak Alışverişten Üstlendiklerimiz ({sharedItems.length})
        </h3>
        {sharedItems.length === 0 ? (
          <p className="text-gray-500">
            Henüz ortak listeden malzeme üstlenilmedi.{' '}
            <Link href="/items" className="text-emerald-700 underline">
              Listeye git
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sharedItems.map((item) => (
              <SharedItemCard
                key={item.id}
                item={item}
                onUpdated={() => user.tent_id && loadShared(user.tent_id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-blue-800">Çadır Ekipmanı</h3>
        <div className="flex flex-col gap-3">
          {tentItems.map((item) => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              checked={!!item.tent_checked}
              onToggle={handleCheck}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
