import type { ItemWithRelations } from '@/types';

export interface SectionGroup {
  id: string;
  name: string;
  sort: number;
  items: ItemWithRelations[];
}

export function groupItemsBySection(items: ItemWithRelations[]): SectionGroup[] {
  const groups = new Map<string, SectionGroup>();

  for (const item of items) {
    const id = item.section_id || '__none__';
    const name = item.list_section?.name || 'Genel';
    const sort = item.list_section?.sort_order ?? 0;

    if (!groups.has(id)) {
      groups.set(id, { id, name, sort, items: [] });
    }
    groups.get(id)!.items.push(item);
  }

  return Array.from(groups.values()).sort(
    (a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'tr')
  );
}
