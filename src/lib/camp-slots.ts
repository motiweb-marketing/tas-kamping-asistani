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

function formatDateTr(iso: string): string {
  const d = parseDate(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export interface CampDayCard {
  camp_day_number: number;
  date: string;
  title: string;
  is_arrival: boolean;
  is_departure: boolean;
  show_breakfast: boolean;
  show_meal: boolean;
  show_snack: boolean;
}

/**
 * Takvim günü başına bir kart (ör. 30-31-1-2):
 * - İlk gün: sadece akşam yemeği
 * - Ara günler: kahvaltı + yemek + ara öğün
 * - Son gün: sadece sabah kahvaltısı (ayrılış)
 */
export function generateCampDayCards(startDate: string, endDate: string): CampDayCard[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (end < start) return [];

  const cards: CampDayCard[] = [];
  let campDay = 1;

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const dateStr = formatDate(d);
    const isFirst = dateStr === startDate;
    const isLast = dateStr === endDate;
    const dateLabel = formatDateTr(dateStr);

    if (isFirst && isLast) {
      cards.push({
        camp_day_number: 1,
        date: dateStr,
        title: `1. Gün — ${dateLabel}`,
        is_arrival: true,
        is_departure: true,
        show_breakfast: true,
        show_meal: true,
        show_snack: true,
      });
      continue;
    }

    if (isFirst) {
      cards.push({
        camp_day_number: campDay,
        date: dateStr,
        title: `1. Gün — ${dateLabel} (Varış)`,
        is_arrival: true,
        is_departure: false,
        show_breakfast: false,
        show_meal: true,
        show_snack: false,
      });
      continue;
    }

    if (isLast) {
      campDay += 1;
      cards.push({
        camp_day_number: campDay,
        date: dateStr,
        title: `Ayrılış — ${dateLabel}`,
        is_arrival: false,
        is_departure: true,
        show_breakfast: true,
        show_meal: false,
        show_snack: false,
      });
      continue;
    }

    campDay += 1;
    cards.push({
      camp_day_number: campDay,
      date: dateStr,
      title: `${campDay}. Gün — ${dateLabel}`,
      is_arrival: false,
      is_departure: false,
      show_breakfast: true,
      show_meal: true,
      show_snack: true,
    });
  }

  return cards;
}

export const SECTION_LABELS = {
  breakfast: 'Kahvaltı',
  meal: 'Yemek (Akşam)',
  snack: 'Ara Öğün',
} as const;
