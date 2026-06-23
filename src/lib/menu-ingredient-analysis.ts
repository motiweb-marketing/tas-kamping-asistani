import type { MenuSummaryLine } from '@/types';
import {
  DISH_INGREDIENT_RULES,
  effectivePeopleGrams,
  formatKgDisplay,
  gramsToKg,
  INGREDIENT_SECTION_HINTS,
} from '@/lib/food-portions';

export interface IngredientUse {
  dishLabel: string;
  gramsPerAdult: number;
  occurrences: number;
}

export interface ComputedIngredientNeed {
  name: string;
  totalGrams: number;
  totalKg: number;
  uses: IngredientUse[];
  calculationNote: string;
  sectionHint: string;
}

function menuLineLabel(m: MenuSummaryLine): string {
  const period =
    m.period === 'breakfast' || m.meal_type === 'breakfast' ? 'Sabah' : 'Akşam';
  return `${m.day} ${period}`;
}

function normalizeMenuText(text: string): string {
  return text.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's');
}

/** Menüde geçen yemeklere göre malzeme ihtiyacını hesaplar. */
export function analyzeMenuIngredients(
  menus: MenuSummaryLine[],
  adults: number,
  children: number
): Map<string, ComputedIngredientNeed> {
  const peopleGrams = effectivePeopleGrams(adults, children);
  const peopleLabel = adults + children;

  const accumulator = new Map<
    string,
    { uses: IngredientUse[]; totalGramsPerPerson: number }
  >();

  for (const menu of menus) {
    const desc = menu.description?.trim();
    if (!desc) continue;

    const normalized = normalizeMenuText(desc);
    const label = menuLineLabel(menu);

    for (const rule of DISH_INGREDIENT_RULES) {
      if (!rule.dishKeywords.test(normalized) && !rule.dishKeywords.test(desc)) {
        continue;
      }

      for (const ing of rule.ingredients) {
        const existing = accumulator.get(ing.name) || {
          uses: [],
          totalGramsPerPerson: 0,
        };

        const useIdx = existing.uses.findIndex(
          (u) => u.dishLabel === label && u.gramsPerAdult === ing.gramsPerAdult
        );
        if (useIdx >= 0) {
          existing.uses[useIdx].occurrences += 1;
        } else {
          existing.uses.push({
            dishLabel: label,
            gramsPerAdult: ing.gramsPerAdult,
            occurrences: 1,
          });
        }
        existing.totalGramsPerPerson += ing.gramsPerAdult;
        accumulator.set(ing.name, existing);
      }
    }
  }

  const result = new Map<string, ComputedIngredientNeed>();

  for (const [name, data] of accumulator) {
    const breakdownParts = data.uses.map((u) => {
      const g = u.gramsPerAdult * u.occurrences;
      return u.occurrences > 1
        ? `${u.dishLabel} ${u.occurrences}×${u.gramsPerAdult}g`
        : `${u.dishLabel} ${g}g/kişi`;
    });

    const totalGrams = data.totalGramsPerPerson * peopleGrams;
    const totalKg = gramsToKg(totalGrams);
    const note = [
      `Hesap: ${peopleLabel} kişi × ${data.totalGramsPerPerson}g/kişi`,
      `(${breakdownParts.join(' + ')})`,
      `= ${formatKgDisplay(totalKg).replace(' kg', '')} kg`,
      'fire %15 dahil',
    ].join(' ');

    result.set(name, {
      name,
      totalGrams,
      totalKg,
      uses: data.uses,
      calculationNote: note,
      sectionHint: INGREDIENT_SECTION_HINTS[name] || 'Sebze & Meyve',
    });
  }

  return result;
}

export function formatComputedNeedsForPrompt(
  needs: Map<string, ComputedIngredientNeed>
): string {
  if (!needs.size) return '';

  const lines = Array.from(needs.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    .map((n) => `- ${n.name}: en az ${n.totalKg} kg — ${n.calculationNote}`);

  return `REFERANS PORSİYON HESABI (menü analizi — bu miktarların altına düşme):\n${lines.join('\n')}`;
}
