'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import ExtraBadge from './ExtraBadge';
import { applySharedClaimPatch, applySharedClaimRemoved } from '@/lib/patch-items';
import type { ItemWithRelations } from '@/types';

interface SharedItemCardProps {
  item: ItemWithRelations;
  onItemPatched?: (id: string, patch: Partial<ItemWithRelations>) => void;
}

const DISPOSITION_LABELS = {
  consumable: 'Tüketilir',
  returnable: 'Geri götürülür',
} as const;

function SharedItemCard({ item, onItemPatched }: SharedItemCardProps) {
  const [claimQty, setClaimQty] = useState(String(item.my_claim || 1));
  const [showClaim, setShowClaim] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const needed = item.needed_count ?? 1;
  const claimed = item.claimed_total ?? 0;
  const remaining = item.remaining_count ?? Math.max(0, needed - claimed);
  const complete = remaining === 0;
  const unit = item.unit_label || 'adet';
  const progressPct = needed > 0 ? Math.min(100, Math.round((claimed / needed) * 100)) : 0;

  const bgClass = complete
    ? 'border-emerald-300 bg-emerald-50'
    : item.my_claim
      ? 'border-blue-300 bg-blue-50'
      : 'border-amber-300 bg-amber-50';

  function patch(next: ItemWithRelations) {
    onItemPatched?.(next.id, next);
  }

  async function submitClaim() {
    setSaving(true);
    setError('');
    const qty = Number(claimQty);
    const optimistic = applySharedClaimPatch(item, qty, (item.claimed_total ?? 0) - (item.my_claim || 0) + qty);
    patch(optimistic);

    const res = await fetch('/api/items/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id, quantity: qty }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      patch(item);
      setError(data.error || 'Üstlenilemedi');
      return;
    }
    setShowClaim(false);
    patch(applySharedClaimPatch(item, qty, data.claimed_total as number));
  }

  async function removeClaim() {
    const previous = item;
    patch(applySharedClaimRemoved(item));

    const res = await fetch(`/api/items/claim?item_id=${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      patch(previous);
      setError('Kaldırılamadı');
    }
  }

  return (
    <div className={`rounded-2xl border-2 p-4 shadow-sm transition-colors ${bgClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
            {item.is_standard && (
              <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                Standart
              </span>
            )}
            {item.is_extra && (
              <span className="rounded-full bg-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-900">
                Ekstra
              </span>
            )}
          </div>
          <p className="mt-1 text-base text-gray-700">
            {item.quantity} · {item.category === 'food' ? 'Yiyecek' : 'Ekipman'} ·{' '}
            {DISPOSITION_LABELS[item.disposition || 'consumable']}
          </p>
          {item.notes?.trim() && <p className="mt-1 text-sm text-gray-600">{item.notes}</p>}
          {item.is_extra && item.added_by_user && (
            <div className="mt-2">
              <ExtraBadge name={item.added_by_user.name} />
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium text-gray-600">İlerleme</p>
          <p className="text-lg font-bold text-gray-900">
            {claimed}/{needed} {unit}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {(item.claims || []).length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-white/60 px-3 py-2 text-sm text-gray-700">
          {item.claims!.map((c) => (
            <li key={c.id} className="flex justify-between gap-2">
              <span>{c.tent?.name || 'Çadır'}</span>
              <strong>
                {c.quantity} {unit}
              </strong>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {!complete && (
          <button
            type="button"
            onClick={() => {
              setClaimQty(String(Math.min(remaining, item.my_claim || 1) || 1));
              setShowClaim(true);
            }}
            className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 px-4 text-base font-bold text-white shadow-sm active:bg-emerald-700 sm:flex-none"
          >
            {item.my_claim ? 'Adedi Güncelle' : 'Ben Getiriyorum'}
          </button>
        )}
        {item.my_claim ? (
          <button
            type="button"
            onClick={() => void removeClaim()}
            className="min-h-[48px] rounded-xl border-2 border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700"
          >
            Kaldır
          </button>
        ) : null}
        {item.disposition === 'consumable' && item.my_claim ? (
          <Link
            href={`/budget?item=${item.id}`}
            className="min-h-[48px] inline-flex items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white"
          >
            Harcama Kaydet
          </Link>
        ) : null}
      </div>

      {showClaim && (
        <div className="mt-3 rounded-xl border-2 border-emerald-200 bg-white p-4">
          <label className="block text-sm font-semibold text-gray-800">
            Kaç {unit} getiriyorsunuz?
          </label>
          <p className="text-xs text-gray-500">
            En fazla {remaining + (item.my_claim || 0)} {unit}
          </p>
          <input
            type="number"
            min={1}
            max={remaining + (item.my_claim || 0)}
            value={claimQty}
            onChange={(e) => setClaimQty(e.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void submitClaim()}
              className="min-h-[44px] flex-1 rounded-xl bg-emerald-600 font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Onayla'}
            </button>
            <button
              type="button"
              onClick={() => setShowClaim(false)}
              className="min-h-[44px] rounded-xl bg-gray-100 px-4 font-semibold text-gray-700"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SharedItemCard);
