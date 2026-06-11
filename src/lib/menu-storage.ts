import type { MenuEntryKind, MealPeriod } from '@/types';

export interface DayMenuContent {
  breakfast: string;
  meal: string;
  snack: string;
}

export interface DayMenuRecord {
  row_id: string | null;
  day: string;
  camp_day_number: number;
  is_arrival: boolean;
  is_departure: boolean;
  breakfast: string;
  meal: string;
  snack: string;
}

interface DayMenuPayloadV2 {
  v: 2;
  camp_day_number: number;
  is_arrival: boolean;
  is_departure: boolean;
  breakfast: string;
  meal: string;
  snack: string;
}

interface MenuPayloadV1 {
  v: 1;
  entries: { id: string; kind: MenuEntryKind; text: string }[];
  camp_day_number?: number;
  is_departure?: boolean;
}

export interface FlatMenuEntry {
  day: string;
  meal_type: 'breakfast' | 'dinner';
  period: MealPeriod;
  entry_kind: MenuEntryKind;
  description: string;
}

function emptyContent(): DayMenuContent {
  return { breakfast: '', meal: '', snack: '' };
}

function parseV2(description: string): DayMenuPayloadV2 | null {
  try {
    const p = JSON.parse(description) as DayMenuPayloadV2;
    if (p?.v === 2) return p;
  } catch {
    /* */
  }
  return null;
}

function parseV1(description: string): MenuPayloadV1 | null {
  try {
    const p = JSON.parse(description) as MenuPayloadV1;
    if (p?.v === 1 && Array.isArray(p.entries)) return p;
  } catch {
    /* */
  }
  return null;
}

function v1ToContent(description: string): DayMenuContent {
  const payload = parseV1(description);
  if (!payload) {
    const text = description.trim();
    return text ? { breakfast: '', meal: text, snack: '' } : emptyContent();
  }
  const c = emptyContent();
  for (const e of payload.entries) {
    const t = e.text.trim();
    if (!t) continue;
    if (e.kind === 'breakfast') c.breakfast = c.breakfast ? `${c.breakfast}\n${t}` : t;
    else if (e.kind === 'snack') c.snack = c.snack ? `${c.snack}\n${t}` : t;
    else c.meal = c.meal ? `${c.meal}\n${t}` : t;
  }
  return c;
}

export function serializeDayMenu(
  content: DayMenuContent,
  meta: { camp_day_number: number; is_arrival: boolean; is_departure: boolean }
): string {
  return JSON.stringify({
    v: 2,
    camp_day_number: meta.camp_day_number,
    is_arrival: meta.is_arrival,
    is_departure: meta.is_departure,
    breakfast: content.breakfast.trim(),
    meal: content.meal.trim(),
    snack: content.snack.trim(),
  } satisfies DayMenuPayloadV2);
}

export function parseRowContent(description: string): DayMenuContent {
  const v2 = parseV2(description);
  if (v2) {
    return {
      breakfast: v2.breakfast || '',
      meal: v2.meal || '',
      snack: v2.snack || '',
    };
  }
  return v1ToContent(description);
}

export function rowsToDayMap(
  rows: {
    id: string;
    day: string;
    meal_type: 'breakfast' | 'dinner';
    description: string;
  }[]
): Map<string, { row_id: string; content: DayMenuContent }> {
  const map = new Map<string, { row_id: string; content: DayMenuContent }>();

  for (const row of rows) {
    const parsed = parseRowContent(row.description);
    const existing = map.get(row.day);

    if (!existing) {
      map.set(row.day, { row_id: row.id, content: parsed });
      continue;
    }

    const v2 = parseV2(row.description);
    if (v2) {
      map.set(row.day, { row_id: row.id, content: parsed });
      continue;
    }

    existing.content = {
      breakfast: [existing.content.breakfast, parsed.breakfast].filter(Boolean).join('\n'),
      meal: [existing.content.meal, parsed.meal].filter(Boolean).join('\n'),
      snack: [existing.content.snack, parsed.snack].filter(Boolean).join('\n'),
    };
  }

  return map;
}

export function dayMenuToFlat(day: string, content: DayMenuContent): FlatMenuEntry[] {
  const lines: FlatMenuEntry[] = [];
  if (content.breakfast.trim()) {
    lines.push({
      day,
      meal_type: 'breakfast',
      period: 'breakfast',
      entry_kind: 'breakfast',
      description: content.breakfast.trim(),
    });
  }
  if (content.meal.trim()) {
    lines.push({
      day,
      meal_type: 'dinner',
      period: 'dinner',
      entry_kind: 'meal',
      description: content.meal.trim(),
    });
  }
  if (content.snack.trim()) {
    lines.push({
      day,
      meal_type: 'dinner',
      period: 'dinner',
      entry_kind: 'snack',
      description: content.snack.trim(),
    });
  }
  return lines;
}

/** @deprecated AI uyumluluğu için */
export function rowToFlatMenus(row: {
  day: string;
  meal_type: 'breakfast' | 'dinner';
  description: string;
}): FlatMenuEntry[] {
  return dayMenuToFlat(row.day, parseRowContent(row.description));
}
