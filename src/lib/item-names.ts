import type { ItemListScope } from '@/types';

/** Karşılaştırma için malzeme adını normalize eder */
export function normalizeItemName(name: string): string {
  return name.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
}

export function itemMatchesSearch(
  item: { name: string; notes?: string | null },
  query: string
): boolean {
  const q = query.trim().toLocaleLowerCase('tr-TR');
  if (!q) return true;
  const name = item.name.toLocaleLowerCase('tr-TR');
  const notes = item.notes?.toLocaleLowerCase('tr-TR') ?? '';
  return name.includes(q) || notes.includes(q);
}

export function filterItemsBySearch<T extends { name: string; notes?: string | null }>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) return items;
  return items.filter((item) => itemMatchesSearch(item, query));
}

export function isDuplicateItemName(
  name: string,
  existing: { id: string; name: string }[],
  excludeId?: string
): boolean {
  const normalized = normalizeItemName(name);
  if (!normalized) return false;
  return existing.some(
    (item) => item.id !== excludeId && normalizeItemName(item.name) === normalized
  );
}
