'use client';

import type { CampExpenseWithRelations } from '@/types';

interface ExpenseListProps {
  expenses: CampExpenseWithRelations[];
  filter: 'all' | 'mine';
  myTentId?: string | null;
  onFilterChange: (filter: 'all' | 'mine') => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ExpenseList({
  expenses,
  filter,
  myTentId,
  onFilterChange,
}: ExpenseListProps) {
  const visible =
    filter === 'mine' && myTentId
      ? expenses.filter((e) => e.tent_id === myTentId)
      : expenses;

  const total = visible.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg">
          Toplam: <strong>{total.toFixed(2)} ₺</strong>
          <span className="ml-2 text-sm text-gray-500">({visible.length} kayıt)</span>
        </p>
        {myTentId && (
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                filter === 'all' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('mine')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                filter === 'mine' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Çadırımız
            </button>
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-500">
          {filter === 'mine' ? 'Çadırınız henüz harcama kaydetmedi.' : 'Henüz harcama kaydı yok.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((expense) => (
            <li
              key={expense.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{expense.item?.name || 'Malzeme'}</p>
                  <p className="text-sm text-gray-600">
                    ⛺ {expense.tent?.name}
                    {expense.created_by_user?.name && (
                      <span> · {expense.created_by_user.name}</span>
                    )}
                  </p>
                  {expense.description?.trim() && (
                    <p className="mt-1 text-sm text-gray-500">{expense.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-800">
                    {Number(expense.amount).toFixed(2)} ₺
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(expense.created_at)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
