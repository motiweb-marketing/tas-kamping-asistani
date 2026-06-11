import type { MenuEntryKind, MealPeriod } from '@/types';
import { randomUUID } from 'crypto';

export interface MenuEntry {
  id: string;
  kind: MenuEntryKind;
  text: string;
}

interface MenuPayload {
  v: 1;
  entries: MenuEntry[];
  camp_day_number?: number;
  is_departure?: boolean;
}

export interface FlatMenuEntry {
  id: string;
  row_id: string;
  campaign_id: string;
  day: string;
  meal_type: 'breakfast' | 'dinner';
  period: MealPeriod;
  entry_kind: MenuEntryKind;
  description: string;
  camp_day_number: number;
  is_departure: boolean;
  sort_order: number;
  created_at: string;
}

function parsePayload(description: string): MenuPayload | null {
  try {
    const parsed = JSON.parse(description) as MenuPayload;
    if (parsed?.v === 1 && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* legacy plain text */
  }
  return null;
}

export function rowToFlatMenus(row: {
  id: string;
  campaign_id: string;
  day: string;
  meal_type: 'breakfast' | 'dinner';
  description: string;
  created_at: string;
  camp_day_number?: number | null;
  period?: MealPeriod | null;
  entry_kind?: MenuEntryKind | null;
  is_departure?: boolean | null;
  sort_order?: number | null;
}): FlatMenuEntry[] {
  const period = (row.period || row.meal_type) as MealPeriod;
  const payload = parsePayload(row.description);

  if (payload) {
    return payload.entries.map((e, i) => ({
      id: `${row.id}:${e.id}`,
      row_id: row.id,
      campaign_id: row.campaign_id,
      day: row.day,
      meal_type: row.meal_type,
      period,
      entry_kind: e.kind,
      description: e.text,
      camp_day_number: payload.camp_day_number ?? row.camp_day_number ?? 1,
      is_departure: payload.is_departure ?? row.is_departure ?? false,
      sort_order: row.sort_order ?? i,
      created_at: row.created_at,
    }));
  }

  if (!row.description?.trim() && !row.entry_kind) return [];

  const kind =
    row.entry_kind ||
    (row.meal_type === 'breakfast' ? 'breakfast' : 'meal');

  return [
    {
      id: `${row.id}:legacy`,
      row_id: row.id,
      campaign_id: row.campaign_id,
      day: row.day,
      meal_type: row.meal_type,
      period,
      entry_kind: kind as MenuEntryKind,
      description: row.description,
      camp_day_number: row.camp_day_number ?? 1,
      is_departure: row.is_departure ?? false,
      sort_order: row.sort_order ?? 0,
      created_at: row.created_at,
    },
  ];
}

export function buildPayload(
  entries: MenuEntry[],
  meta: { camp_day_number: number; is_departure: boolean }
): string {
  return JSON.stringify({ v: 1, ...meta, entries } satisfies MenuPayload);
}

export function parseCompositeId(compositeId: string): { rowId: string; entryId: string } {
  const idx = compositeId.indexOf(':');
  if (idx === -1) return { rowId: compositeId, entryId: 'legacy' };
  return { rowId: compositeId.slice(0, idx), entryId: compositeId.slice(idx + 1) };
}

export function addEntry(
  description: string,
  kind: MenuEntryKind,
  meta: { camp_day_number: number; is_departure: boolean }
): string {
  let payload = parsePayload(description);

  if (!payload) {
    const legacyEntries: MenuEntry[] = description.trim()
      ? [{ id: randomUUID(), kind: 'meal', text: description }]
      : [];
    payload = { v: 1, ...meta, entries: legacyEntries };
  }

  payload.camp_day_number = meta.camp_day_number;
  payload.is_departure = meta.is_departure;
  payload.entries.push({ id: randomUUID(), kind, text: '' });
  return JSON.stringify(payload);
}

export function updateEntryText(
  description: string,
  entryId: string,
  text: string
): string | null {
  const payload = parsePayload(description);
  if (!payload) return null;
  const entry = payload.entries.find((e) => e.id === entryId);
  if (!entry) return null;
  entry.text = text;
  return JSON.stringify(payload);
}

export function removeEntry(description: string, entryId: string): string | null {
  const payload = parsePayload(description);
  if (!payload) return null;
  payload.entries = payload.entries.filter((e) => e.id !== entryId);
  return JSON.stringify(payload);
}
