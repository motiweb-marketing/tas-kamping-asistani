import type { CampSetupProfile, DrinkingBottle, WaterPlanSettings } from '@/lib/camp-setup-profile';

export interface WaterLineItem {
  name: string;
  quantity: string;
  quantity_amount: number;
  quantity_unit: string;
  scales_with_people: boolean;
  notes?: string;
}

export interface WaterPlanResult {
  drinking_liters: number;
  tea_liters: number;
  drinking_bottle: DrinkingBottle;
  drinking_units: number;
  tea_damacana_units: number;
  summary: string;
  items: WaterLineItem[];
}

function bottleLiters(bottle: DrinkingBottle): number {
  if (bottle === '1l') return 1;
  if (bottle === '5l') return 5;
  return 0.5;
}

export function recommendDrinkingBottle(
  totalLiters: number,
  headcount: number
): DrinkingBottle {
  if (totalLiters >= 40 || headcount >= 12) return '5l';
  if (totalLiters >= 15) return '1l';
  return '0.5l';
}

export function resolveDrinkingBottle(
  preference: DrinkingBottle,
  totalLiters: number,
  headcount: number
): DrinkingBottle {
  if (preference !== 'recommended') return preference;
  return recommendDrinkingBottle(totalLiters, headcount);
}

export function litersToUnits(totalLiters: number, bottle: DrinkingBottle): number {
  const per = bottleLiters(bottle);
  return Math.max(1, Math.ceil(totalLiters / per));
}

export function computeWaterPlan(
  water: WaterPlanSettings,
  headcount: number,
  campDays: number
): WaterPlanResult {
  const drinking_liters = headcount * campDays * water.drinking_liters_per_person_per_day;
  const tea_liters = water.tea_enabled
    ? water.tea_evening_dates.length * water.semaver_count * water.liters_per_semaver
    : 0;

  const drinking_bottle = resolveDrinkingBottle(
    water.drinking_bottle,
    drinking_liters,
    headcount
  );
  const drinking_units = litersToUnits(drinking_liters, drinking_bottle);
  const tea_damacana_units =
    tea_liters > 0 ? Math.max(1, Math.ceil(tea_liters / 5)) : 0;

  const bottleLabel =
    drinking_bottle === '5l' ? '5 L damacana' : drinking_bottle === '1l' ? '1 L şişe' : '0,5 L şişe';

  const items: WaterLineItem[] = [];

  if (drinking_liters > 0) {
    const per = bottleLiters(drinking_bottle);
    items.push({
      name: 'İçme suyu',
      quantity: `${drinking_units} adet (${Math.round(drinking_liters)} L toplam)`,
      quantity_amount: drinking_units,
      quantity_unit: 'adet',
      scales_with_people: true,
      notes: `${bottleLabel} — kişi başı günde ${water.drinking_liters_per_person_per_day} L`,
    });
  }

  if (tea_liters > 0) {
    items.push({
      name: 'Çay suyu (damacana)',
      quantity: `${tea_damacana_units} adet 5 L (${tea_liters} L toplam)`,
      quantity_amount: tea_damacana_units,
      quantity_unit: 'adet',
      scales_with_people: false,
      notes: `${water.tea_evening_dates.length} akşam × ${water.semaver_count} semaver × ${water.liters_per_semaver} L`,
    });
  }

  const summary = [
    drinking_liters > 0
      ? `İçme: ${headcount} kişi × ${campDays} gün × ${water.drinking_liters_per_person_per_day} L = ${drinking_liters} L → ${drinking_units}× ${bottleLabel}`
      : null,
    tea_liters > 0
      ? `Çay: ${water.tea_evening_dates.length} akşam × ${water.semaver_count} semaver × ${water.liters_per_semaver} L = ${tea_liters} L → ${tea_damacana_units}× 5 L damacana`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    drinking_liters,
    tea_liters,
    drinking_bottle,
    drinking_units,
    tea_damacana_units,
    summary,
    items,
  };
}

export function formatWaterPlanForPrompt(
  profile: CampSetupProfile,
  headcount: number,
  campDays: number
): string {
  const plan = computeWaterPlan(profile.water, headcount, campDays);
  return [
    'SU PLANI (sistem tarafından hesaplanır — listede ayrı satır olarak eklenecek, sen ekleme):',
    plan.summary || 'Su planı henüz yapılandırılmadı.',
    'Pişirme suyu menü malzemelerinde kalır; ayrıca su satırı ekleme.',
  ].join('\n');
}
