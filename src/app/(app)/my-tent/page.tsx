'use client';

import { useEffect, useState } from 'react';
import ItemCard from '@/components/items/ItemCard';
import type { ItemWithRelations, SessionUser } from '@/types';

export default function MyTentPage() {
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      if (meData.user?.tent_id) {
        const res = await fetch(`/api/items?tent_id=${meData.user.tent_id}`);
        const data = await res.json();
        setItems(data.items || []);
      }
      setLoading(false);
    }
    load();
  }, []);

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
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Çadırımın Görevleri</h2>
      <p className="text-lg text-gray-600">
        Çadırınızın üstlendiği {items.length} malzeme
      </p>

      {items.length === 0 ? (
        <p className="text-lg text-gray-500">Henüz görev yok.</p>
      ) : (
        items.map((item) => (
          <ItemCard key={item.id} item={item} showAssignButton={false} />
        ))
      )}
    </div>
  );
}
