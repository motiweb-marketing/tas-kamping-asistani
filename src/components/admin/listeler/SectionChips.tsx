'use client';

import { useState } from 'react';
import type { ListSection } from '@/types';

interface Props {
  sections: ListSection[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onAddSection: (name: string) => Promise<void>;
  onDeleteSection?: (id: string) => Promise<void>;
}

export default function SectionChips({
  sections,
  activeId,
  onSelect,
  onAddSection,
  onDeleteSection,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  async function submitAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    await onAddSection(newName.trim());
    setSaving(false);
    setNewName('');
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${
            activeId === null
              ? 'bg-forest-800 text-white'
              : 'bg-forest-100 text-forest-800'
          }`}
        >
          Tümü
        </button>
        {sections.map((s) => (
          <span key={s.id} className="inline-flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                activeId === s.id
                  ? 'bg-forest-800 text-white'
                  : 'bg-forest-100 text-forest-800'
              }`}
            >
              {s.name}
              {s.item_count != null && (
                <span className="ml-1 opacity-70">({s.item_count})</span>
              )}
            </button>
            {onDeleteSection && s.name !== 'Genel' && activeId === s.id && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`"${s.name}" kategorisi silinsin mi? Öğeler "Genel"e taşınır.`)) {
                    void onDeleteSection(s.id);
                  }
                }}
                className="rounded-full px-1.5 text-xs text-red-600"
                aria-label="Kategoriyi sil"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="shrink-0 rounded-full border border-dashed border-forest-400 px-3 py-1.5 text-sm font-semibold text-forest-700"
          >
            + Kategori
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Kategori adı"
              className="w-28 rounded-lg border border-forest-200 px-2 py-1 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && void submitAdd()}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void submitAdd()}
              className="rounded-lg bg-forest-800 px-2 py-1 text-xs font-semibold text-white"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewName('');
              }}
              className="text-xs text-forest-500"
            >
              İptal
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
