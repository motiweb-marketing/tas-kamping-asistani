const DISCRETE_UNITS = new Set([
  'adet',
  'paket',
  'kutu',
  'dilim',
  'demet',
  'şişe',
  'sise',
  'kavanoz',
  'poşet',
  'poset',
  'rulo',
  'tabaka',
]);

const WEIGHT_VOLUME_UNITS = new Set(['kg', 'gram', 'g', 'litre', 'l', 'ml', 'cl']);

export interface ParsedQuantity {
  amount: number;
  unit: string;
  display: string;
}

export function parseQuantityString(raw: string): ParsedQuantity | null {
  const text = raw.trim().replace(',', '.');
  if (!text) return null;

  const match = text.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (Number.isNaN(amount) || amount <= 0) return null;

  const unit = normalizeUnit(match[2].trim());
  return {
    amount,
    unit,
    display: formatQuantityDisplay(amount, unit),
  };
}

export function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  if (u === 'gr' || u === 'gram') return 'gram';
  if (u === 'lt' || u === 'l') return 'litre';
  if (u === 'şişe') return 'sise';
  if (u === 'poşet') return 'poset';
  return u;
}

export function formatQuantityDisplay(amount: number, unit: string): string {
  const rounded = roundQuantity(amount, unit);
  const displayAmount = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  return `${displayAmount} ${unit}`;
}

export function roundQuantity(amount: number, unit: string): number {
  const u = normalizeUnit(unit);
  if (WEIGHT_VOLUME_UNITS.has(u)) {
    if (u === 'kg' || u === 'litre' || u === 'l') return Math.round(amount * 10) / 10;
    return Math.ceil(amount);
  }
  if (DISCRETE_UNITS.has(u)) return Math.max(1, Math.ceil(amount));
  return Math.round(amount * 10) / 10;
}

export function computeNeededCountFromQuantity(amount: number, unit: string): number {
  const u = normalizeUnit(unit);
  if (DISCRETE_UNITS.has(u)) return Math.max(1, Math.ceil(amount));
  return 1;
}

export function guessScalesWithPeople(unit: string, category: 'food' | 'equipment'): boolean {
  const u = normalizeUnit(unit);
  if (category === 'food') return true;
  if (DISCRETE_UNITS.has(u)) return true;
  if (WEIGHT_VOLUME_UNITS.has(u)) return true;
  return false;
}

export function scaleQuantityAmount(
  amount: number,
  unit: string,
  fromHeadcount: number,
  toHeadcount: number
): number {
  if (fromHeadcount <= 0 || toHeadcount <= 0) return amount;
  const ratio = toHeadcount / fromHeadcount;
  return roundQuantity(amount * ratio, unit);
}
