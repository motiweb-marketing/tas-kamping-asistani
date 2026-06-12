/** ISO date (YYYY-MM-DD) helpers for kamp varış / ayrılış seçimi */

export function coerceDateRangeOnStartChange(
  newStart: string,
  endDate: string
): { start_date: string; end_date: string } {
  if (!newStart) {
    return { start_date: '', end_date: '' };
  }
  if (endDate && endDate < newStart) {
    return { start_date: newStart, end_date: '' };
  }
  return { start_date: newStart, end_date: endDate };
}

export function isDateRangeValid(start: string, end: string): boolean {
  return Boolean(start && end && end >= start);
}

export function dateRangeError(start: string, end: string): string | null {
  if (!start) return 'Önce varış tarihini seçin.';
  if (!end) return 'Ayrılış tarihini seçin.';
  if (end < start) return 'Ayrılış tarihi varıştan önce olamaz.';
  return null;
}
