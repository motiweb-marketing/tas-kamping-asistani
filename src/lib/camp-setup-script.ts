import type { CampSiteType } from '@/lib/camp-setup-profile';

export interface SetupQuestion {
  id: string;
  text: string;
  type: 'yes_no' | 'text';
}

const QUESTIONS: Record<CampSiteType, SetupQuestion[]> = {
  ready_tent: [
    { id: 'has_electricity', text: 'Kamp alanında elektrik var mı?', type: 'yes_no' },
    { id: 'shared_kitchen', text: 'Ortak mutfak veya yemek alanı var mı?', type: 'yes_no' },
  ],
  bungalow: [
    { id: 'has_kitchen', text: 'Bungalovda mutfak/tezgah var mı?', type: 'yes_no' },
    { id: 'has_fridge', text: 'Buzdolabı var mı?', type: 'yes_no' },
  ],
  own_tent_campground: [
    { id: 'has_water_tap', text: 'Kamp alanında musluk / içme suyu noktası var mı?', type: 'yes_no' },
    { id: 'fire_allowed', text: 'Mangal veya ateş yakmak serbest mi?', type: 'yes_no' },
  ],
  own_tent_wild: [
    { id: 'fire_allowed', text: 'Mangal veya ateş yakmak serbest mi?', type: 'yes_no' },
    { id: 'water_source', text: 'Yakında su kaynağı (dere, çeşme) var mı?', type: 'yes_no' },
  ],
};

export function getQuestionsForCampType(type: CampSiteType | null): SetupQuestion[] {
  if (!type) return [];
  return QUESTIONS[type] || [];
}

export const EXTRA_NOTES_QUESTION: SetupQuestion = {
  id: 'extra_notes',
  text: 'Eklemek istediğiniz bir not var mı? (İsteğe bağlı)',
  type: 'text',
};
