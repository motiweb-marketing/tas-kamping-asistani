'use client';

import { useEffect, useState } from 'react';
import ChecklistItemCard from '@/components/items/ChecklistItemCard';
import ItemCard from '@/components/items/ItemCard';
import type { ItemWithRelations, SessionUser } from '@/types';

export default function MyTentPage() {
  const [sharedItems, setSharedItems] = useState<ItemWithRelations[]>([]);
  const [tentItems, setTentItems] = useState<ItemWithRelations[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      if (meData.user?.tent_id) {
        const [sharedRes, tentRes] = await Promise.all([
          fetch(`/api/items?scope=shared&tent_id=${meData.user.tent_id}`),
          fetch('/api/items?scope=tent&recommendations=true'),
        ]);
        const sharedData = await sharedRes.json();
        const tentData = await tentRes.json();
        setSharedItems(sharedData.items || []);
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
    if (res.ok && user?.tent_id) {
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
      <div>
        <h2 className="text-xl font-bold">Çadırımız</h2>
        <p className="text-lg text-gray-600">
          Ortak alışverişten üstlendiğimiz malzemeler ve çadır ekipmanı kontrol listesi.
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-emerald-800">
          Ortak Alışverişten Getireceklerimiz ({sharedItems.length})
        </h3>
        {sharedItems.length === 0 ? (
          <p className="text-gray-500">Henüz ortak listeden malzeme üstlenilmedi.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sharedItems.map((item) => (
              <ItemCard key={item.id} item={item} showAssignButton={false} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-blue-800">
          Çadır Ekipmanı Kontrol Listesi
        </h3>
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
