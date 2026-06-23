import type { ListGenerationContext } from '@/lib/list-generation-context';

export type CampSiteType =
  | 'ready_tent'
  | 'bungalow'
  | 'own_tent_campground'
  | 'own_tent_wild';

export type DrinkingBottle = '0.5l' | '1l' | '5l' | 'recommended';

export interface WaterPlanSettings {
  drinking_liters_per_person_per_day: number;
  drinking_bottle: DrinkingBottle;
  tea_enabled: boolean;
  tea_evening_dates: string[];
  semaver_count: number;
  liters_per_semaver: number;
}

export interface AssistantTranscriptEntry {
  role: 'assistant' | 'user';
  text: string;
  step_id: string;
}

export interface CampSetupProfile {
  profile_version: number;
  camp_site_type: CampSiteType | null;
  setup_answers: Record<string, string | boolean>;
  water: WaterPlanSettings;
  assistant_transcript: AssistantTranscriptEntry[];
  legacy_menu_prompt?: string;
  headcount_confirmed: boolean;
  cooking_setup: ListGenerationContext['cooking_setup'];
  has_portable_cooler: boolean;
  dietary_notes: string;
  alcohol_in_menu: boolean;
  breakfast_style: ListGenerationContext['breakfast_style'];
  dishwashing: ListGenerationContext['dishwashing'];
  extra_notes: string;
}

export const CAMP_SITE_LABELS: Record<CampSiteType, string> = {
  ready_tent: 'Hazır çadır / glamping',
  bungalow: 'Bungalov / kulübe',
  own_tent_campground: 'Kendi çadırım — kamp alanı',
  own_tent_wild: 'Kendi çadırım — orman / dağ / sahil',
};

export const DEFAULT_WATER: WaterPlanSettings = {
  drinking_liters_per_person_per_day: 2.5,
  drinking_bottle: 'recommended',
  tea_enabled: false,
  tea_evening_dates: [],
  semaver_count: 1,
  liters_per_semaver: 5,
};

export const DEFAULT_CAMP_SETUP_PROFILE: CampSetupProfile = {
  profile_version: 1,
  camp_site_type: null,
  setup_answers: {},
  water: { ...DEFAULT_WATER },
  assistant_transcript: [],
  headcount_confirmed: false,
  cooking_setup: 'both',
  has_portable_cooler: false,
  dietary_notes: '',
  alcohol_in_menu: false,
  breakfast_style: 'full',
  dishwashing: 'camp_sink',
  extra_notes: '',
};

export function normalizeCampSetupProfile(
  raw: Partial<CampSetupProfile> | Record<string, unknown> | null | undefined
): CampSetupProfile {
  const base = { ...DEFAULT_CAMP_SETUP_PROFILE, water: { ...DEFAULT_WATER } };
  if (!raw || typeof raw !== 'object') return base;

  const waterRaw = (raw as CampSetupProfile).water;
  const types: CampSiteType[] = [
    'ready_tent',
    'bungalow',
    'own_tent_campground',
    'own_tent_wild',
  ];
  const siteType = (raw as CampSetupProfile).camp_site_type;
  const bottles: DrinkingBottle[] = ['0.5l', '1l', '5l', 'recommended'];

  return {
    profile_version: 1,
    camp_site_type: types.includes(siteType as CampSiteType) ? (siteType as CampSiteType) : null,
    setup_answers:
      typeof (raw as CampSetupProfile).setup_answers === 'object' &&
      (raw as CampSetupProfile).setup_answers
        ? { ...(raw as CampSetupProfile).setup_answers }
        : {},
    water: {
      drinking_liters_per_person_per_day: 2.5,
      drinking_bottle: bottles.includes(waterRaw?.drinking_bottle as DrinkingBottle)
        ? (waterRaw!.drinking_bottle as DrinkingBottle)
        : 'recommended',
      tea_enabled: Boolean(waterRaw?.tea_enabled),
      tea_evening_dates: Array.isArray(waterRaw?.tea_evening_dates)
        ? waterRaw!.tea_evening_dates.map(String)
        : [],
      semaver_count: Math.max(1, Number(waterRaw?.semaver_count) || 1),
      liters_per_semaver: 5,
    },
    assistant_transcript: Array.isArray((raw as CampSetupProfile).assistant_transcript)
      ? (raw as CampSetupProfile).assistant_transcript
      : [],
    legacy_menu_prompt: (raw as CampSetupProfile).legacy_menu_prompt
      ? String((raw as CampSetupProfile).legacy_menu_prompt)
      : undefined,
    headcount_confirmed: Boolean((raw as CampSetupProfile).headcount_confirmed),
    cooking_setup:
      (raw as CampSetupProfile).cooking_setup === 'mangal' ||
      (raw as CampSetupProfile).cooking_setup === 'ocak'
        ? (raw as CampSetupProfile).cooking_setup
        : 'both',
    has_portable_cooler: Boolean((raw as CampSetupProfile).has_portable_cooler),
    dietary_notes: String((raw as CampSetupProfile).dietary_notes ?? '').trim(),
    alcohol_in_menu: Boolean((raw as CampSetupProfile).alcohol_in_menu),
    breakfast_style:
      (raw as CampSetupProfile).breakfast_style === 'simple' ? 'simple' : 'full',
    dishwashing:
      (raw as CampSetupProfile).dishwashing === 'hand' ? 'hand' : 'camp_sink',
    extra_notes: String((raw as CampSetupProfile).extra_notes ?? '').trim(),
  };
}

export function mergeCampSetupProfile(
  current: CampSetupProfile,
  patch: Partial<CampSetupProfile>
): CampSetupProfile {
  return normalizeCampSetupProfile({
    ...current,
    ...patch,
    setup_answers: patch.setup_answers
      ? { ...current.setup_answers, ...patch.setup_answers }
      : current.setup_answers,
    water: patch.water ? { ...current.water, ...patch.water } : current.water,
    assistant_transcript: patch.assistant_transcript ?? current.assistant_transcript,
  });
}

/** Eski menu_ai_prompt → profile migrate */
export function migrateLegacyMenuPrompt(
  profile: CampSetupProfile,
  menuAiPrompt: string | null | undefined
): CampSetupProfile {
  const trimmed = (menuAiPrompt || '').trim();
  if (!trimmed || profile.legacy_menu_prompt) return profile;
  return mergeCampSetupProfile(profile, {
    legacy_menu_prompt: trimmed,
    extra_notes: profile.extra_notes || trimmed,
  });
}

export function profileToListContext(profile: CampSetupProfile): ListGenerationContext {
  return {
    headcount_confirmed: profile.headcount_confirmed,
    cooking_setup: profile.cooking_setup,
    has_portable_cooler: profile.has_portable_cooler,
    dietary_notes: profile.dietary_notes,
    alcohol_in_menu: profile.alcohol_in_menu,
    coffee_tea_level: profile.water.tea_enabled ? 'high' : 'medium',
    dishwashing: profile.dishwashing,
    breakfast_style: profile.breakfast_style,
    extra_notes: profile.extra_notes,
  };
}

export function buildMenuPromptFromProfile(profile: CampSetupProfile): string {
  const lines: string[] = [
    'Kamp kurulum profili:',
    profile.camp_site_type
      ? `Kamp tipi: ${CAMP_SITE_LABELS[profile.camp_site_type]}`
      : '',
  ];

  for (const [key, val] of Object.entries(profile.setup_answers)) {
    if (key === 'extra_notes') continue;
    lines.push(`${key}: ${String(val)}`);
  }

  if (profile.extra_notes) lines.push(`Ek not: ${profile.extra_notes}`);
  if (profile.legacy_menu_prompt && profile.legacy_menu_prompt !== profile.extra_notes) {
    lines.push(`Organizatör talimatı: ${profile.legacy_menu_prompt}`);
  }

  lines.push(
    profile.water.tea_enabled
      ? `Akşam çayı/semaver planlanıyor (${profile.water.tea_evening_dates.length} akşam).`
      : 'Akşam çayı planlanmıyor.'
  );

  return lines.filter(Boolean).join('\n');
}

export function setupProgress(profile: CampSetupProfile): {
  step: number;
  total: number;
  labels: string[];
} {
  const labels = ['Kamp tipi', 'Asistan', 'Su ve çay', 'Kişiler', 'Menüler'];
  let completed = 0;
  if (profile.camp_site_type) completed++;
  if (Object.keys(profile.setup_answers).length > 0 || profile.assistant_transcript.length > 0)
    completed++;
  if (profile.water.drinking_bottle) completed++;
  if (profile.headcount_confirmed) completed++;
  return { step: Math.min(completed + 1, 5), total: 5, labels };
}
