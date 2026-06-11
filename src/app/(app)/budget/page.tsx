'use client';

import { useEffect, useState } from 'react';
import TentBalanceCard from '@/components/budget/TentBalanceCard';
import type { BudgetSummary } from '@/types';

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/budget');
      const data = await res.json();
      setBudget(data.budget);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  if (!budget) return <p className="text-lg text-gray-500">Bütçe hesaplanamadı.</p>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Bütçe Hesaplama</h2>

      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <p className="text-lg">
          Toplam Maliyet: <strong>{budget.total_cost.toFixed(2)} ₺</strong>
        </p>
        <p className="text-lg">
          Toplam Pay: <strong>{budget.total_shares}</strong>
          ({budget.adult_count} yetişkin, {budget.child_count} çocuk)
        </p>
        <p className="text-lg">
          1 Payın Maliyeti: <strong>{budget.cost_per_share.toFixed(2)} ₺</strong>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          15 yaş altı = 0.5 pay, 15+ = 1 pay
        </p>
      </div>

      <h3 className="text-lg font-semibold">Çadır Bazlı Bakiye</h3>
      {budget.tent_balances.map((tb) => (
        <TentBalanceCard key={tb.tent.id} balance={tb} />
      ))}
    </div>
  );
}
