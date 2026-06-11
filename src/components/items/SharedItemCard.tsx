'use client';

import Link from 'next/link';
import { useState } from 'react';
import ExtraBadge from './ExtraBadge';
import type { ItemWithRelations } from '@/types';

interface SharedItemCardProps {
  item: ItemWithRelations;
  onUpdated: () => void;
}

const DISPOSITION_LABELS = {
  consumable: 'Tüketilir',
  returnable: 'Geri götürülür',
} as const;

export default function SharedItemCard({ item, onUpdated }: SharedItemCardProps) {
  const [claimQty, setClaimQty] = useState(String(item.my_claim || 1));
  const [showClaim, setShowClaim] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const needed = item.needed_count ?? 1;
  const claimed = item.claimed_total ?? 0;
  const remaining = item.remaining_count ?? Math.max(0, needed - claimed);
  const complete = remaining === 0;
  const unit = item.unit_label || 'adet';

  const bgClass = complete
    ? 'bg-kamp-green border-kamp-green-border'
    : item.my_claim
      ? 'bg-blue-50 border-blue-200'
      : 'bg-kamp-orange border-kamp-orange-border';

  async function submitClaim() {
    setSaving(true);
    setError('');
    const qty = Number(claimQty);
    const res = await fetch('/api/items/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id, quantity: qty }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Üstlenilemedi');
      return;
    }
    setShowClaim(false);
    onUpdated();
  }

  async function removeClaim() {
    await fetch(`/api/items/claim?item_id=${item.id}`, { method: 'DELETE' });
    onUpdated();
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${bgClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            {item.is_standard && (
              <span className="rounded bg-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-900">
                Standart
              </span>
            )}
            <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
              {DISPOSITION_LABELS[item.disposition || 'consumable']}
            </span>
          </div>
          <p className="mt-1 text-base text-gray-700">
            Gerekli: <strong>{needed} {unit}</strong>
            {' · '}
            Üstlenilen: <strong>{claimed} {unit}</strong>
            {!complete && (
              <span className="text-amber-800"> · Kalan: {remaining} {unit}</span>
            )}
          </p>
          {item.notes?.trim() && (
            <p className="mt-1 text-sm text-gray-600">{item.notes}</p>
          )}
          {item.is_extra && item.added_by_user && (
            <div className="mt-2">
              <ExtraBadge name={item.added_by_user.name} />
            </div>
          )}
          {(item.claims || []).length > 0 && (
            <ul className="mt-2 space-y-0.5 text-sm text-gray-700">
              {item.claims!.map((c) => (
                <li key={c.id}>
                  → {c.tent?.name || 'Çadır'}: <strong>{c.quantity} {unit}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {!complete && (
          <button
            type="button"
            onClick={() => {
              setClaimQty(String(Math.min(remaining, item.my_claim || 1)));
              setShowClaim(true);
            }}
            className="min-h-[44px] flex-1 rounded-xl bg-emerald-600 px-3 text-base font-semibold text-white sm:flex-none sm:px-4"
          >
            {item.my_claim ? 'Adedi Güncelle' : 'Üstlen'}
          </button>
        )}
        {item.my_claim ? (
          <button
            type="button"
            onClick={removeClaim}
            className="min-h-[44px] rounded-xl border-2 border-gray-300 px-3 text-sm"
          >
            Üstlenmeyi Kaldır
          </button>
        ) : null}
        {item.disposition === 'consumable' && item.my_claim ? (
          <Link
            href={`/budget?item=${item.id}`}
            className="min-h-[44px] inline-flex items-center rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white"
          >
            Harcama Kaydet
          </Link>
        ) : null}
      </div>

      {showClaim && (
        <div className="mt-3 rounded-lg border-2 border-emerald-300 bg-white p-3">
          <label className="block text-sm font-medium">
            Kaç {unit} getiriyorsunuz? (en fazla {remaining + (item.my_claim || 0)})
          </label>
          <input
            type="number"
            min={1}
            max={remaining + (item.my_claim || 0)}
            value={claimQty}
            onChange={(e) => setClaimQty(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-lg"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={submitClaim}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => setShowClaim(false)}
              className="rounded-lg bg-gray-200 px-4 py-2"
            >
              İptal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
