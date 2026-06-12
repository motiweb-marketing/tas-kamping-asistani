'use client';

import { useEffect, useState } from 'react';

interface ExpenseItem {
  id: string;
  name: string;
}

interface AddExpenseFormProps {
  items: ExpenseItem[];
  preselectedItemId?: string;
  tentAssigned: boolean;
  onAdded: () => void;
}

export default function AddExpenseForm({
  items,
  preselectedItemId,
  tentAssigned,
  onAdded,
}: AddExpenseFormProps) {
  const [itemId, setItemId] = useState(preselectedItemId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preselectedItemId) setItemId(preselectedItemId);
  }, [preselectedItemId]);

  if (!tentAssigned) {
    return (
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
        Harcama kaydı için önce bir çadıra atanmanız gerekir. Admin ile iletişime geçin.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-gray-600">
        Henüz ortak alışveriş listesinde harcama bağlanabilecek malzeme yok.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: itemId,
        amount: Number(amount),
        description,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Harcama eklenemedi');
      return;
    }

    setAmount('');
    setDescription('');
    if (!preselectedItemId) setItemId('');
    onAdded();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4"
    >
      <h3 className="mb-3 text-lg font-semibold text-blue-900">Yeni Harcama Kaydı</h3>
      <p className="mb-3 text-sm text-blue-800">
        Marketten aldığınız ortak malzemelerin tutarını buradan girin. Çadırınızın üstlendiği
        malzemeler listede önce gösterilir.
      </p>

      <label className="mb-1 block text-sm font-medium">Malzeme</label>
      <select
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
        className="mb-3 w-full rounded-lg border px-3 py-2 text-base"
        required
      >
        <option value="">Seçin...</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-sm font-medium">Tutar (₺)</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-3 w-full rounded-lg border px-3 py-2 text-lg"
        required
      />

      <label className="mb-1 block text-sm font-medium">Not (opsiyonel)</label>
      <input
        placeholder="Örn: Migros fişi"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-3 w-full rounded-lg border px-3 py-2"
      />

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="min-h-[48px] w-full rounded-xl bg-blue-600 text-lg font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Harcamayı Kaydet'}
      </button>
    </form>
  );
}
