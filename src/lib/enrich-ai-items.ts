import type { AiGeneratedItemStructured } from '@/lib/openrouter';
import type { ComputedIngredientNeed } from '@/lib/menu-ingredient-analysis';
import { formatKgDisplay } from '@/lib/food-portions';
import { guessScalesWithPeople } from '@/lib/quantity-parser';

const GROUPED_NAME_PATTERNS = [
  /malzemeler/i,
  /çeşitli\s+sebze/i,
  /karışık/i,
  /\([^)]*,[^)]+\)/,
];

const SPLIT_FROM_PARENS = /\(([^)]+)\)/;

const NAME_ALIASES: Record<string, string[]> = {
  domates: ['domates', 'tomato'],
  salatalik: ['salatalık', 'salatalik', 'hıyar', 'hiyar', 'cucumber'],
  yesillik: ['yeşillik', 'yesillik', 'marul', 'roka', 'göbek', 'gobek', 'yeşil'],
  biber: ['biber', 'sivri biber', 'kapya'],
  sogan: ['soğan', 'sogan'],
};

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function isGroupedItemName(name: string): boolean {
  return GROUPED_NAME_PATTERNS.some((p) => p.test(name));
}

function extractSplitNames(name: string): string[] | null {
  const paren = name.match(SPLIT_FROM_PARENS);
  if (paren) {
    const parts = paren[1]
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    if (parts.length >= 2) return parts;
  }

  if (/salata\s*malzemeler/i.test(name)) {
    return ['Domates', 'Salatalık', 'Yeşillik'];
  }

  return null;
}

function matchCanonicalIngredient(
  itemName: string,
  needs: Map<string, ComputedIngredientNeed>
): string | null {
  const key = normalizeKey(itemName);
  for (const canonical of needs.keys()) {
    const cKey = normalizeKey(canonical);
    if (key === cKey || key.includes(cKey) || cKey.includes(key)) {
      return canonical;
    }
  }

  for (const [aliasKey, aliases] of Object.entries(NAME_ALIASES)) {
    if (aliases.some((a) => key.includes(normalizeKey(a)))) {
      for (const canonical of needs.keys()) {
        if (normalizeKey(canonical).includes(aliasKey)) return canonical;
      }
    }
  }

  return null;
}

function buildItemFromNeed(need: ComputedIngredientNeed): AiGeneratedItemStructured {
  return {
    name: need.name,
    quantity: formatKgDisplay(need.totalKg),
    quantity_amount: need.totalKg,
    quantity_unit: 'kg',
    scales_with_people: true,
    category: 'food',
    section_hint: need.sectionHint,
    notes: need.calculationNote,
  };
}

/** Gruplanmış satırları ayırır; menü analizine göre miktar tabanını uygular. */
export function enrichAiGeneratedItems(
  items: AiGeneratedItemStructured[],
  computedNeeds: Map<string, ComputedIngredientNeed>
): AiGeneratedItemStructured[] {
  const result: AiGeneratedItemStructured[] = [];
  const covered = new Set<string>();

  for (const item of items) {
    if (isGroupedItemName(item.name)) {
      const splitNames = extractSplitNames(item.name);
      if (splitNames) {
        for (const partName of splitNames) {
          const canonical = matchCanonicalIngredient(partName, computedNeeds);
          if (canonical && computedNeeds.has(canonical)) {
            const need = computedNeeds.get(canonical)!;
            covered.add(canonical);
            result.push(buildItemFromNeed(need));
          } else {
            result.push({
              ...item,
              name: partName,
              notes: item.notes || 'Gruplanmış satırdan ayrıldı; miktarı kontrol edin.',
            });
          }
        }
        continue;
      }
    }

    const canonical = matchCanonicalIngredient(item.name, computedNeeds);
    if (canonical && computedNeeds.has(canonical)) {
      const need = computedNeeds.get(canonical)!;
      covered.add(canonical);
      const floorKg = need.totalKg;
      const aiKg =
        item.quantity_unit === 'kg' ? item.quantity_amount : 0;

      if (aiKg < floorKg) {
        result.push({
          ...item,
          name: need.name,
          quantity: formatKgDisplay(floorKg),
          quantity_amount: floorKg,
          quantity_unit: 'kg',
          scales_with_people: true,
          section_hint: item.section_hint || need.sectionHint,
          notes: need.calculationNote,
        });
      } else {
        const existingNote = item.notes?.trim();
        result.push({
          ...item,
          name: need.name,
          notes: existingNote?.includes('Hesap:')
            ? existingNote
            : [existingNote, need.calculationNote].filter(Boolean).join(' · '),
        });
      }
      continue;
    }

    result.push(item);
  }

  for (const [name, need] of computedNeeds) {
    if (covered.has(name)) continue;
    result.push(buildItemFromNeed(need));
  }

  return dedupeByName(result);
}

function dedupeByName(
  items: AiGeneratedItemStructured[]
): AiGeneratedItemStructured[] {
  const seen = new Map<string, AiGeneratedItemStructured>();

  for (const item of items) {
    const key = normalizeKey(item.name);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
      continue;
    }
    if (item.quantity_amount > existing.quantity_amount) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values());
}

export function ensureCalculationNotes(
  items: AiGeneratedItemStructured[]
): AiGeneratedItemStructured[] {
  return items.map((item) => {
    if (item.category === 'equipment') return item;
    if (item.notes?.includes('Hesap:')) return item;
    if (!item.scales_with_people) return item;

    const unit = item.quantity_unit;
    const scales = guessScalesWithPeople(unit, item.category);
    if (!scales) return item;

    return {
      ...item,
      notes: [
        item.notes,
        `Hesap: ${item.quantity_amount} ${unit} (kişi sayısına göre ölçeklenir)`,
      ]
        .filter(Boolean)
        .join(' · '),
    };
  });
}
