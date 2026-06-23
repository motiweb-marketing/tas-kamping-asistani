'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ItemSearchInput from '@/components/items/ItemSearchInput';
import CompactItemRow from '@/components/admin/listeler/CompactItemRow';
import ItemEditPanel, { type ItemEditDraft } from '@/components/admin/listeler/ItemEditPanel';
import SectionChips from '@/components/admin/listeler/SectionChips';
import { clientDuplicateCheck } from '@/lib/item-duplicates';
import { filterItemsBySearch } from '@/lib/item-names';
import type { ListTypeConfig } from '@/lib/list-config';
import type { Item, ListSection, Tent } from '@/types';

export default function ScopedListEditor({ config }: { config: ListTypeConfig }) {
  const isKamp = config.slug === 'kamp';
  const [items, setItems] = useState<Item[]>([]);
  const [sections, setSections] = useState<ListSection[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({
    name: '',
    quantity: '1',
    notes: '',
    category: 'equipment' as Item['category'],
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadSections = useCallback(async () => {
    const res = await fetch(`/api/list-sections?scope=${config.scope}`);
    const data = await res.json();
    setSections(data.sections || []);
  }, [config.scope]);

  const loadItems = useCallback(async () => {
    const query = isKamp
      ? '?published=false&scope=shared&exclude_standard=true'
      : `?scope=${config.scope}&recommendations=true`;
    const res = await fetch(`/api/items${query}`);
    const data = await res.json();
    setItems(data.items || []);
  }, [config.scope, isKamp]);

  const reload = useCallback(async () => {
    await Promise.all([loadItems(), loadSections()]);
  }, [loadItems, loadSections]);

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
    if (isKamp) {
      fetch('/api/tents')
        .then((r) => r.json())
        .then((d) => setTents(d.tents || []));
    }
  }, [reload, isKamp]);

  const filteredBySection =
    activeSection === null
      ? items
      : items.filter((i) => i.section_id === activeSection);

  const filteredItems = filterItemsBySearch(filteredBySection, search);

  async function addSection(name: string) {
    const res = await fetch('/api/list-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, list_scope: config.scope }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kategori eklenemedi');
      return;
    }
    await loadSections();
  }

  async function deleteSection(id: string) {
    const res = await fetch(`/api/list-sections/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Silinemedi');
      return;
    }
    if (activeSection === id) setActiveSection(null);
    await reload();
  }

  async function saveItem(draft: ItemEditDraft): Promise<string | null> {
    if (!editingItem) return null;

    const duplicate = clientDuplicateCheck(draft.name, items, editingItem.id);
    if (duplicate) return duplicate;

    const body: Record<string, unknown> = {
      name: draft.name,
      quantity: draft.quantity,
      notes: draft.notes || null,
      section_id: draft.section_id || null,
    };
    if (isKamp) {
      body.category = draft.category;
      body.assigned_tent_id = draft.assigned_tent_id || null;
    }

    const res = await fetch(`/api/items/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return data.error || 'Kaydedilemedi';
    await reload();
    return null;
  }

  async function deleteItem(id: string) {
    if (!confirm('Bu madde silinsin mi?')) return;
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Silinemedi');
      return;
    }
    await reload();
  }

  async function addItem() {
    if (!newRow.name.trim()) return;
    setAddError(null);
    const duplicate = clientDuplicateCheck(newRow.name, items);
    if (duplicate) {
      setAddError(duplicate);
      return;
    }

    const defaultSection = sections[0]?.id || null;
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRow.name,
        quantity: newRow.quantity,
        category: isKamp ? newRow.category : 'equipment',
        list_scope: config.scope,
        is_recommendation: !isKamp,
        is_published: isKamp ? false : true,
        notes: newRow.notes,
        section_id: activeSection || defaultSection,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.error || 'Eklenemedi');
      return;
    }
    setNewRow({ name: '', quantity: '1', notes: '', category: 'equipment' });
    setAdding(false);
    await reload();
  }

  async function publishAll() {
    setPublishing(true);
    setPublishMessage('');
    await fetch('/api/items/publish', { method: 'POST' });
    setPublishing(false);
    setPublishMessage('Kamp ihtiyaçları listesi yayınlandı.');
    await reload();
  }

  if (loading) return <p className="text-sm text-forest-500">Yükleniyor...</p>;

  return (
    <div className="space-y-4">
      {isKamp && (
        <>
          <div className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
            <strong>Birden fazla çadır:</strong> Yayınlandıktan sonra her çadır listeden adet
            seçerek üstlenebilir.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-forest-600">
              {items.length} taslak madde
              {items.length === 0 && (
                <>
                  {' '}
                  —{' '}
                  <Link href="/admin/menu-duzenle" className="font-semibold underline">
                    Menüden AI ile oluşturun
                  </Link>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => void publishAll()}
              disabled={publishing || items.length === 0}
              className="min-h-[44px] rounded-xl bg-forest-800 px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {publishing ? 'Yayınlanıyor...' : 'Listeyi yayınla'}
            </button>
          </div>
          {publishMessage && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {publishMessage}
            </p>
          )}
        </>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <SectionChips
        sections={sections}
        activeId={activeSection}
        onSelect={setActiveSection}
        onAddSection={addSection}
        onDeleteSection={deleteSection}
      />

      {items.length > 0 && (
        <ItemSearchInput
          value={search}
          onChange={setSearch}
          resultCount={filteredItems.length}
          totalCount={items.length}
        />
      )}

      <div className="flex flex-col gap-2">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-forest-500">
            {items.length === 0 ? 'Henüz madde yok.' : 'Bu filtrede madde yok.'}
          </p>
        ) : (
          filteredItems.map((item) => (
            <CompactItemRow
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => void deleteItem(item.id)}
            />
          ))
        )}
      </div>

      {adding ? (
        <div className="rounded-xl border-2 border-dashed border-forest-300 bg-forest-50/50 p-4">
          <input
            value={newRow.name}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
            placeholder="Madde adı"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          <input
            value={newRow.quantity}
            onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })}
            placeholder="Miktar"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          {isKamp && (
            <select
              value={newRow.category}
              onChange={(e) =>
                setNewRow({ ...newRow, category: e.target.value as Item['category'] })
              }
              className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
            >
              <option value="food">Yiyecek</option>
              <option value="equipment">Ekipman</option>
            </select>
          )}
          <input
            value={newRow.notes}
            onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })}
            placeholder="Not"
            className="mb-2 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
          />
          {addError && (
            <p className="mb-2 rounded-lg bg-red-50 px-2 py-1 text-sm text-red-700">{addError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void addItem()}
              className="rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg bg-forest-100 px-4 py-2 text-sm font-semibold text-forest-800"
            >
              İptal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm font-semibold text-forest-800 underline"
        >
          + Yeni madde ekle
        </button>
      )}

      {editingItem && (
        <ItemEditPanel
          item={editingItem}
          sections={sections}
          tents={tents}
          showKampFields={isKamp}
          open={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          onSave={saveItem}
        />
      )}
    </div>
  );
}
