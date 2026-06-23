'use client';

import { useEffect, useState } from 'react';
import type { Item, ListSection, Tent } from '@/types';

export interface ItemEditDraft {
  name: string;
  quantity: string;
  notes: string;
  section_id: string;
  category: Item['category'];
  assigned_tent_id: string;
}

interface Props {
  item: Item;
  sections: ListSection[];
  tents?: Tent[];
  showKampFields?: boolean;
  open: boolean;
  onClose: () => void;
  onSave: (draft: ItemEditDraft) => Promise<string | null>;
}

function toDraft(item: Item): ItemEditDraft {
  return {
    name: item.name,
    quantity: item.quantity,
    notes: item.notes || '',
    section_id: item.section_id || '',
    category: item.category,
    assigned_tent_id: item.assigned_tent_id || '',
  };
}

export default function ItemEditPanel({
  item,
  sections,
  tents = [],
  showKampFields = false,
  open,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<ItemEditDraft>(() => toDraft(item));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(toDraft(item));
      setDirty(false);
      setError(null);
    }
  }, [open, item]);

  function update<K extends keyof ItemEditDraft>(key: K, value: ItemEditDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function requestClose() {
    if (dirty) {
      if (!confirm('Kaydedilmemiş değişiklikler kaybolacak. Emin misiniz?')) return;
    }
    onClose();
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError('Ad gerekli');
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onSave(draft);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setDirty(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/40 p-0 sm:items-center sm:p-4"
      onClick={requestClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="font-display text-lg font-bold text-forest-950">Maddeyi düzenle</h3>

        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-forest-700">Ad</span>
            <input
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-forest-200 px-3 py-2 text-base"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-forest-700">Miktar</span>
            <input
              value={draft.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className="mt-1 w-full rounded-lg border border-forest-200 px-3 py-2 text-base"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-forest-700">Kategori</span>
            <select
              value={draft.section_id}
              onChange={(e) => update('section_id', e.target.value)}
              className="mt-1 w-full rounded-lg border border-forest-200 px-3 py-2 text-base"
            >
              <option value="">— Seçin —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {showKampFields && (
            <>
              <label className="block text-sm">
                <span className="font-medium text-forest-700">Tür</span>
                <select
                  value={draft.category}
                  onChange={(e) => update('category', e.target.value as Item['category'])}
                  className="mt-1 w-full rounded-lg border border-forest-200 px-3 py-2 text-base"
                >
                  <option value="food">Yiyecek</option>
                  <option value="equipment">Ekipman</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-forest-700">Çadır ataması</span>
                <select
                  value={draft.assigned_tent_id}
                  onChange={(e) => update('assigned_tent_id', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-forest-200 px-3 py-2 text-base"
                >
                  <option value="">— Yok —</option>
                  {tents.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="block text-sm">
            <span className="font-medium text-forest-700">Not</span>
            <textarea
              value={draft.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-forest-200 px-3 py-2 text-base"
            />
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="min-h-[48px] flex-1 rounded-xl border border-forest-200 font-semibold text-forest-800"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="min-h-[48px] flex-1 rounded-xl bg-forest-800 font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
