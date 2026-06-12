'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AddExpenseForm from '@/components/budget/AddExpenseForm';
import ExpenseList from '@/components/budget/ExpenseList';
import TentBalanceCard from '@/components/budget/TentBalanceCard';
import type { BudgetSummary, CampExpenseWithRelations, ItemWithRelations, SessionUser } from '@/types';

type BudgetTab = 'harcamalar' | 'bakiye';

function BudgetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: BudgetTab = searchParams.get('tab') === 'bakiye' ? 'bakiye' : 'harcamalar';
  const preselectedItemId = searchParams.get('item') || undefined;

  const [user, setUser] = useState<SessionUser | null>(null);
  const [expenses, setExpenses] = useState<CampExpenseWithRelations[]>([]);
  const [expenseItems, setExpenseItems] = useState<{ id: string; name: string }[]>([]);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    const res = await fetch('/api/expenses');
    const data = await res.json();
    setExpenses(data.expenses || []);
  }, []);

  const loadBudget = useCallback(async () => {
    const res = await fetch('/api/budget');
    const data = await res.json();
    setBudget(data.budget);
  }, []);

  const loadExpenseItems = useCallback(async () => {
    const res = await fetch('/api/items?scope=shared');
    const data = await res.json();
    const items = (data.items || []) as ItemWithRelations[];
    setExpenseItems(
      items
        .filter(
          (item) =>
            !item.is_recommendation &&
            (item.disposition || 'consumable') === 'consumable'
        )
        .map((item) => ({ id: item.id, name: item.name }))
    );
  }, []);

  useEffect(() => {
    async function init() {
      const [meRes] = await Promise.all([
        fetch('/api/auth/me'),
        loadExpenses(),
        loadBudget(),
        loadExpenseItems(),
      ]);
      const meData = await meRes.json();
      setUser(meData.user);
      setLoading(false);
    }
    init();
  }, [loadExpenses, loadBudget, loadExpenseItems]);

  function setTab(next: BudgetTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'harcamalar') {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    const query = params.toString();
    router.replace(query ? `/budget?${query}` : '/budget');
  }

  async function handleExpenseAdded() {
    await Promise.all([loadExpenses(), loadBudget()]);
    setTab('harcamalar');
  }

  if (loading) return <p className="text-lg text-gray-500">Yükleniyor...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Bütçe & Harcamalar</h2>
        <p className="mt-1 text-sm text-gray-600">
          Alışveriş tutarlarını <strong>Harcamalar</strong> sekmesinden girin; kimin ne kadar ödediği{' '}
          <strong>Bakiye</strong> sekmesinde hesaplanır.
        </p>
      </div>

      <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setTab('harcamalar')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
            tab === 'harcamalar' ? 'bg-white text-blue-800 shadow' : 'text-gray-600'
          }`}
        >
          🧾 Harcamalar
        </button>
        <button
          type="button"
          onClick={() => setTab('bakiye')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
            tab === 'bakiye' ? 'bg-white text-emerald-800 shadow' : 'text-gray-600'
          }`}
        >
          💰 Bakiye Hesabı
        </button>
      </div>

      {tab === 'harcamalar' ? (
        <div className="flex flex-col gap-6">
          <AddExpenseForm
            items={expenseItems}
            preselectedItemId={preselectedItemId}
            tentAssigned={!!user?.tent_id}
            onAdded={handleExpenseAdded}
          />

          <section>
            <h3 className="mb-3 text-lg font-semibold">Kayıtlı Harcamalar</h3>
            <ExpenseList
              expenses={expenses}
              filter={expenseFilter}
              myTentId={user?.tent_id}
              onFilterChange={setExpenseFilter}
            />
          </section>

          <p className="text-sm text-gray-500">
            Listeden malzeme üstlendikten sonra kısayol: ortak listede{' '}
            <strong>Harcama Kaydet</strong> ile bu sayfaya yönlendirilirsiniz.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!budget ? (
            <p className="text-lg text-gray-500">Bütçe hesaplanamadı.</p>
          ) : (
            <>
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                <p className="text-lg">
                  Genel Toplam: <strong>{budget.total_cost.toFixed(2)} ₺</strong>
                </p>
                <div className="mt-2 space-y-1 text-base text-gray-800">
                  <p>
                    Konaklama (tesis): <strong>{budget.total_accommodation_cost.toFixed(2)} ₺</strong>
                    <span className="ml-1 text-sm text-gray-600">
                      {budget.accommodation_use_age_pricing
                        ? `(yetişkin ${budget.adult_accommodation_fee.toFixed(2)} ₺ · ${budget.accommodation_child_age_max} yaş altı ${budget.child_accommodation_fee.toFixed(2)} ₺ / kişi)`
                        : `(kişi başı ${budget.adult_accommodation_fee.toFixed(2)} ₺)`}
                    </span>
                  </p>
                  <p>
                    Ortak alışveriş: <strong>{budget.total_grocery_cost.toFixed(2)} ₺</strong>
                  </p>
                </div>
                <p className="mt-3 text-lg">
                  Alışveriş payı: <strong>{budget.total_shares}</strong> toplam pay (
                  {budget.adult_count} yetişkin, {budget.child_count} çocuk)
                </p>
                <p className="text-lg">
                  1 payın alışveriş maliyeti: <strong>{budget.cost_per_share.toFixed(2)} ₺</strong>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Konaklama{' '}
                  {budget.accommodation_use_age_pricing
                    ? `yaşa göre hesaplanır (${budget.accommodation_child_age_max} yaş sınırı).`
                    : 'herkes için aynı kişi başı ücrettir.'}{' '}
                  Alışverişte 15 yaş altı = 0.5 pay, 15+ = 1 pay. Market fişi girildiyse alışveriş
                  tutarı fişlerden hesaplanır.
                </p>
              </div>

              {expenses.length === 0 && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                  Henüz harcama girilmedi. Bakiye hesabı için önce{' '}
                  <button
                    type="button"
                    onClick={() => setTab('harcamalar')}
                    className="font-semibold underline"
                  >
                    Harcamalar
                  </button>{' '}
                  sekmesinden alışveriş tutarlarını kaydedin.
                </div>
              )}

              <h3 className="text-lg font-semibold">Çadır Bazlı Bakiye</h3>
              {budget.tent_balances.map((tb) => (
                <TentBalanceCard key={tb.tent.id} balance={tb} />
              ))}
            </>
          )}
        </div>
      )}

      <Link href="/items" className="text-center text-sm text-emerald-700 underline">
        Ortak listeye git →
      </Link>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<p className="text-lg text-gray-500">Yükleniyor...</p>}>
      <BudgetContent />
    </Suspense>
  );
}
