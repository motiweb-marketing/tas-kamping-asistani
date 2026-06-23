'use client';

import type { Item } from '@/types';

interface Props {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CompactItemRow({ item, onEdit, onDelete }: Props) {
  const summary = [item.quantity, item.notes].filter(Boolean).join(' · ');

  return (
    <div className="flex min-h-[48px] items-center gap-2 rounded-lg border border-forest-100 bg-white px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest-950">{item.name}</p>
        {summary && (
          <p className="truncate text-xs text-forest-500">{summary}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800"
      >
        Düzenle
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
      >
        Sil
      </button>
    </div>
  );
}
