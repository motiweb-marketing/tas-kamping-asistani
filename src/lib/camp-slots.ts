import type { DutyPeriod } from '@/types';

export interface CampMealSlot {
  camp_day_number: number;
  slot_date: string;
  period: DutyPeriod;
  title: string;
  is_departure: boolean;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function slotTitle(
  campDay: number,
  period: DutyPeriod,
  slotDate: string,
  isDeparture: boolean
): string {
  const periodLabel = period === 'breakfast' ? 'Sabah Kahvaltısı' : 'Akşam Yemeği';
  if (isDeparture) {
    return `Ayrılış — ${slotDate} — ${periodLabel}`;
  }
  return `${campDay}. Gün — ${slotDate} — ${periodLabel}`;
}

/**
 * Kamp öğün slotları (ör. 30-31-1-2):
 * - İlk gün: sadece akşam
 * - Ara günler: sabah + akşam
 * - Son gün: sadece sabah (ayrılış)
 */
export function generateCampMealSlots(startDate: string, endDate: string): CampMealSlot[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (end < start) return [];

  const slots: CampMealSlot[] = [];
  let campDay = 1;

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const dateStr = formatDate(d);
    const isFirst = dateStr === startDate;
    const isLast = dateStr === endDate;

    if (isFirst && isLast) {
      slots.push({
        camp_day_number: 1,
        slot_date: dateStr,
        period: 'breakfast',
        title: slotTitle(1, 'breakfast', dateStr, false),
        is_departure: false,
      });
      slots.push({
        camp_day_number: 1,
        slot_date: dateStr,
        period: 'dinner',
        title: slotTitle(1, 'dinner', dateStr, false),
        is_departure: false,
      });
      continue;
    }

    if (isFirst) {
      slots.push({
        camp_day_number: campDay,
        slot_date: dateStr,
        period: 'dinner',
        title: slotTitle(campDay, 'dinner', dateStr, false),
        is_departure: false,
      });
      continue;
    }

    if (isLast) {
      campDay += 1;
      slots.push({
        camp_day_number: campDay,
        slot_date: dateStr,
        period: 'breakfast',
        title: slotTitle(campDay, 'breakfast', dateStr, true),
        is_departure: true,
      });
      continue;
    }

    campDay += 1;
    slots.push({
      camp_day_number: campDay,
      slot_date: dateStr,
      period: 'breakfast',
      title: slotTitle(campDay, 'breakfast', dateStr, false),
      is_departure: false,
    });
    slots.push({
      camp_day_number: campDay,
      slot_date: dateStr,
      period: 'dinner',
      title: slotTitle(campDay, 'dinner', dateStr, false),
      is_departure: false,
    });
  }

  return slots;
}

export function slotKey(slot_date: string, period: DutyPeriod): string {
  return `${slot_date}:${period}`;
}

export const ENTRY_KIND_LABELS: Record<string, string> = {
  breakfast: 'Kahvaltı',
  meal: 'Yemek',
  snack: 'Ara Öğün',
};
