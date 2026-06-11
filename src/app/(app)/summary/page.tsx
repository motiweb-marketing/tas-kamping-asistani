'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { SummaryClaimLine } from '@/types';

interface SummaryData {
  total_people: number;
  standard: SummaryClaimLine[];
  shared_food: SummaryClaimLine[];
  expenses: {
    id: string;
    amount: number;
    description: string;
    tent?: { name: string } | null;
    item?: { name: string } | null;
  }[];
  stats: { total_items: number; fully_claimed: number; open_items: number };
}

function ItemBlock({ line }: { line: SummaryClaimLine }) {
  const pct =
    line.needed_count > 0
      ? Math.min(100, Math.round((line.claimed_total / line.needed_count) * 100))
      : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">{line.item_name}</h4>
        <span className="text-sm text-gray-600">
          {line.claimed_total}/{line.needed_count} {line.unit_label}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {line.claims.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-700">
          {line.claims.map((c) => (
            <li key={c.tent_id}>
              <strong>{c.tent_name}</strong> → {c.quantity} {line.unit_label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-amber-700">Henüz kimse üstlenmedi</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        {line.disposition === 'consumable' ? 'Tüketilir' : 'Geri götürülür'}
        {line.is_standard ? ' · Standart malzeme' : ''}
      </p>
    </div>
  );
}

export default function SummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/summary');
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  if (!data) return <p className="text-lg text-gray-500">Özet yüklenemedi.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Kamp Özeti</h2>
        <p className="text-gray-600">
          {data.total_people} kişi · {data.stats.fully_claimed}/{data.stats.total_items} malzeme tam
          üstlenildi
        </p>
        <Link href="/items" className="mt-1 inline-block text-sm font-medium text-emerald-700 underline">
          Listelere git →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-800">{data.standard.length}</p>
          <p className="text-sm">Standart malzeme</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-800">{data.stats.open_items}</p>
          <p className="text-sm">Eksik kalan</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-800">{data.expenses.length}</p>
          <p className="text-sm">Harcama kaydı</p>
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-lg font-semibold">Standart Malzemeler (tabak, çatal…)</h3>
        <div className="flex flex-col gap-3">
          {data.standard.map((line) => (
            <ItemBlock key={line.item_id} line={line} />
          ))}
        </div>
      </section>

      {data.shared_food.length > 0 && (
        <section>
          <h3 className="mb-2 text-lg font-semibold">Yemek & Ortak Alışveriş</h3>
          <div className="flex flex-col gap-3">
            {data.shared_food.map((line) => (
              <ItemBlock key={line.item_id} line={line} />
            ))}
          </div>
        </section>
      )}

      {data.expenses.length > 0 && (
        <section>
          <h3 className="mb-2 text-lg font-semibold">Son Harcamalar</h3>
          <ul className="flex flex-col gap-2">
            {data.expenses.map((e) => (
              <li key={e.id} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                <strong>{e.tent?.name}</strong> — {e.item?.name}: {Number(e.amount).toFixed(2)} ₺
                {e.description && <span className="text-gray-600"> ({e.description})</span>}
              </li>
            ))}
          </ul>
          <Link href="/budget" className="mt-2 inline-block text-sm text-emerald-700 underline">
            Bütçe detayı →
          </Link>
        </section>
      )}
    </div>
  );
}
