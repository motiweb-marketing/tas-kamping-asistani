import { normalizeItemName } from '@/lib/item-names';
import type { WaterLineItem } from '@/lib/water-plan';
import type { AiGeneratedItemStructured } from '@/lib/openrouter';

const WATER_NAMES = new Set([
  normalizeItemName('İçme suyu'),
  normalizeItemName('Çay suyu (damacana)'),
  normalizeItemName('Su'),
  normalizeItemName('İçme Suyu'),
]);

export function filterAiItemsWithoutWater(
  aiItems: AiGeneratedItemStructured[]
): AiGeneratedItemStructured[] {
  return aiItems.filter((item) => !WATER_NAMES.has(normalizeItemName(item.name)));
}

export function waterItemsToAiRows(
  waterItems: WaterLineItem[]
): AiGeneratedItemStructured[] {
  return waterItems.map((w) => ({
    name: w.name,
    quantity: w.quantity,
    quantity_amount: w.quantity_amount,
    quantity_unit: w.quantity_unit,
    scales_with_people: w.scales_with_people,
    category: 'food' as const,
    section_hint: 'İçecekler',
    notes: w.notes,
  }));
}
