import type { ItemCategory, ItemDisposition } from '@/types';

export interface StandardSharedTemplate {
  name: string;
  unit_label: string;
  /** Kişi başına gereken miktar */
  per_person: number;
  category: ItemCategory;
  disposition: ItemDisposition;
  notes: string;
}

/** AI'dan bağımsız, kişi sayısına göre otomatik güncellenen ortak malzemeler */
export const STANDARD_SHARED_ITEMS: StandardSharedTemplate[] = [
  {
    name: 'Tabak',
    unit_label: 'adet',
    per_person: 1,
    category: 'equipment',
    disposition: 'returnable',
    notes: 'Her öğünde kullanılır — kamp sonunda geri götürülür',
  },
  {
    name: 'Bardak / su bardağı',
    unit_label: 'adet',
    per_person: 1,
    category: 'equipment',
    disposition: 'returnable',
    notes: 'Her öğünde kullanılır',
  },
  {
    name: 'Çay bardağı',
    unit_label: 'adet',
    per_person: 1,
    category: 'equipment',
    disposition: 'returnable',
    notes: 'Çay ve sıcak içecekler için',
  },
  {
    name: 'Çatal',
    unit_label: 'adet',
    per_person: 1,
    category: 'equipment',
    disposition: 'returnable',
    notes: 'Her öğünde kullanılır',
  },
  {
    name: 'Kaşık',
    unit_label: 'adet',
    per_person: 1,
    category: 'equipment',
    disposition: 'returnable',
    notes: 'Her öğünde kullanılır',
  },
  {
    name: 'Bıçak',
    unit_label: 'adet',
    per_person: 1,
    category: 'equipment',
    disposition: 'returnable',
    notes: 'Yemek için',
  },
  {
    name: 'Peçete',
    unit_label: 'adet',
    per_person: 5,
    category: 'equipment',
    disposition: 'consumable',
    notes: 'Tüketimlik — ortak alınır',
  },
  {
    name: 'Çöp poşeti (ortak)',
    unit_label: 'adet',
    per_person: 0.25,
    category: 'equipment',
    disposition: 'consumable',
    notes: 'Ortak alan temizliği için',
  },
];

export function computeNeededCount(perPerson: number, totalPeople: number): number {
  return Math.max(1, Math.ceil(perPerson * totalPeople));
}

export function formatQuantity(count: number, unit: string): string {
  return `${count} ${unit}`;
}
