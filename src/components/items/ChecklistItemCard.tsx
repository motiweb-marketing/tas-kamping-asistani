'use client';

import type { ItemWithRelations } from '@/types';

interface ChecklistItemCardProps {
  item: ItemWithRelations;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

export default function ChecklistItemCard({ item, checked, onToggle }: ChecklistItemCardProps) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${
        checked
          ? 'border-emerald-400 bg-emerald-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="mt-1 h-6 w-6 shrink-0 rounded border-gray-300"
      />
      <div className="flex-1">
        <h3 className={`text-lg font-semibold ${checked ? 'text-emerald-900 line-through' : ''}`}>
          {item.name}
        </h3>
        <p className="text-base text-gray-600">{item.quantity}</p>
        {item.notes && (
          <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
        )}
      </div>
    </label>
  );
}
