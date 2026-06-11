'use client';

import ExtraBadge from './ExtraBadge';
import type { ItemWithRelations } from '@/types';

interface ItemCardProps {
  item: ItemWithRelations;
  onAssign?: (id: string) => void;
  showAssignButton?: boolean;
  onPriceChange?: (id: string, price: number) => void;
}

export default function ItemCard({
  item,
  onAssign,
  showAssignButton = true,
  onPriceChange,
}: ItemCardProps) {
  const isAssigned = !!item.assigned_tent_id;
  const bgClass = isAssigned
    ? 'bg-kamp-green border-kamp-green-border'
    : 'bg-kamp-orange border-kamp-orange-border';

  return (
    <div className={`rounded-xl border-2 p-4 ${bgClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-base text-gray-700">
            {item.quantity}
            {item.list_scope === 'shared' || !item.list_scope
              ? ` · ${item.category === 'food' ? 'Yiyecek' : 'Ekipman'}`
              : ''}
          </p>
          {item.is_extra && item.added_by_user && (
            <div className="mt-2">
              <ExtraBadge name={item.added_by_user.name} />
            </div>
          )}
          {isAssigned && item.assigned_tent && (
            <p className="mt-1 text-base font-medium text-emerald-800">
              → {item.assigned_tent.name} getiriyor
            </p>
          )}
        </div>
      </div>

      {onPriceChange && (
        <div className="mt-3">
          <label className="text-sm text-gray-600">Maliyet (₺)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            defaultValue={item.price}
            onBlur={(e) => onPriceChange(item.id, Number(e.target.value))}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-lg"
          />
        </div>
      )}

      {!isAssigned && showAssignButton && onAssign && (
        <button
          onClick={() => onAssign(item.id)}
          className="mt-3 w-full min-h-[48px] rounded-xl bg-emerald-600 text-lg font-semibold text-white active:bg-emerald-700"
        >
          Ben Getiriyorum
        </button>
      )}
    </div>
  );
}
