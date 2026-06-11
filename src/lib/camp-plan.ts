export type DutyPeriod = 'breakfast' | 'dinner';
export type DutyKind = 'meal_prep' | 'fire' | 'tea' | 'dishes';

export interface DutySlotTemplate {
  camp_day_number: number;
  slot_date: string;
  period: DutyPeriod;
  duty_kind: DutyKind;
  title: string;
  is_departure: boolean;
}

const KIND_LABELS: Record<DutyKind, { breakfast: string; dinner: string }> = {
  meal_prep: { breakfast: 'Kahvaltı Hazırlığı', dinner: 'Akşam Yemeği Hazırlığı' },
  fire: { breakfast: 'Ateş / Ocak', dinner: 'Mangal / Ateş Yakma' },
  tea: { breakfast: 'Çay', dinner: 'Akşam Çay & Semaver' },
  dishes: { breakfast: 'Bulaşık & Toparlama', dinner: 'Bulaşık & Ortalık Toparlama' },
};

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

function dutiesForPeriod(
  campDay: number,
  slotDate: string,
  period: DutyPeriod,
  isDeparture: boolean
): DutySlotTemplate[] {
  const kinds: DutyKind[] =
    period === 'breakfast'
      ? ['meal_prep', 'dishes']
      : ['meal_prep', 'fire', 'tea', 'dishes'];

  const dayLabel = isDeparture
    ? 'Ayrılış Sabahı'
    : `${campDay}. Gün`;

  const periodLabel = period === 'breakfast' ? 'Sabah' : 'Akşam';

  return kinds.map((duty_kind) => ({
    camp_day_number: campDay,
    slot_date: slotDate,
    period,
    duty_kind,
    title: `${dayLabel} — ${periodLabel}: ${KIND_LABELS[duty_kind][period]}`,
    is_departure: isDeparture,
  }));
}

/**
 * Kamp günü mantığı (ör. 30-31-1-2):
 * - İlk gün: sadece akşam (1. gün akşam yemeği)
 * - Ara günler: sabah + akşam
 * - Son gün: sadece sabah (ayrılış kahvaltısı)
 */
export function generateCampDutyPlan(startDate: string, endDate: string): DutySlotTemplate[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (end < start) return [];

  const slots: DutySlotTemplate[] = [];
  let campDay = 1;

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const dateStr = formatDate(d);
    const isFirst = formatDate(d) === startDate;
    const isLast = formatDate(d) === endDate;

    if (isFirst && isLast) {
      slots.push(...dutiesForPeriod(1, dateStr, 'breakfast', false));
      slots.push(...dutiesForPeriod(1, dateStr, 'dinner', false));
      continue;
    }

    if (isFirst) {
      slots.push(...dutiesForPeriod(campDay, dateStr, 'dinner', false));
      continue;
    }

    if (isLast) {
      campDay += 1;
      slots.push(...dutiesForPeriod(campDay, dateStr, 'breakfast', true));
      continue;
    }

    campDay += 1;
    slots.push(...dutiesForPeriod(campDay, dateStr, 'breakfast', false));
    slots.push(...dutiesForPeriod(campDay, dateStr, 'dinner', false));
  }

  return slots;
}
