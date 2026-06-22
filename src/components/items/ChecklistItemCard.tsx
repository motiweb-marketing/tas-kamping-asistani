'use client';

import type { ItemWithRelations } from '@/types';

interface ChecklistItemCardProps {
  item: ItemWithRelations;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
  compact?: boolean;
}

export default function ChecklistItemCard({
  item,
  checked,
  onToggle,
  compact = false,
}: ChecklistItemCardProps) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-all ${
        checked
          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
          : 'border-gray-200 bg-white shadow-sm hover:border-emerald-200'
      } ${compact ? 'p-3' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="mt-0.5 h-7 w-7 shrink-0 rounded-lg border-2 border-gray-300 text-emerald-600"
      />
      <div className="min-w-0 flex-1">
        <h3
          className={`font-semibold text-gray-900 ${checked ? 'text-emerald-800 line-through' : ''} ${
            compact ? 'text-base' : 'text-lg'
          }`}
        >
          {item.name}
        </h3>
        {!compact && item.quantity && (
          <p className="text-base text-gray-600">{item.quantity}</p>
        )}
        {item.notes && (
          <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
        )}
      </div>
    </label>
  );
}
