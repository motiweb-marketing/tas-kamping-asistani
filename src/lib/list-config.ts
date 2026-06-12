import type { ItemListScope } from '@/types';

export interface ListTypeConfig {
  slug: string;
  scope: ItemListScope;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  participantHint: string;
  href: string;
  isRecommendation: boolean;
}

export const LIST_TYPES: ListTypeConfig[] = [
  {
    slug: 'kisisel',
    scope: 'personal',
    order: 1,
    title: 'Kişisel ihtiyaçlar listesi',
    shortTitle: 'Kişisel',
    description:
      'Her katılımcının kendi çantasında getirmesi gerekenler: terlik, güneş kremi, kişisel ilaçlar vb.',
    participantHint: 'Katılımcılar uygulamada kendi listelerini işaretler.',
    href: '/admin/listeler/kisisel',
    isRecommendation: true,
  },
  {
    slug: 'cadir',
    scope: 'tent',
    order: 2,
    title: 'Çadır ihtiyaçları',
    shortTitle: 'Çadır',
    description:
      'Her çadırın (aile veya grubun) bulundurması gereken ortak ekipman: priz, çadır ışığı, sinek spreyi vb.',
    participantHint: 'Çadırdaki herkes çadır listesini birlikte görür.',
    href: '/admin/listeler/cadir',
    isRecommendation: true,
  },
  {
    slug: 'kamp',
    scope: 'shared',
    order: 3,
    title: 'Kamp ihtiyaçları',
    shortTitle: 'Kamp',
    description:
      'Tüm kampın birlikte kullandığı malzemeler: yiyecek, mutfak ekipmanı, ortak sarf malzemeleri. Birden fazla çadır olduğunda her çadır listeden adet seçerek üstlenir.',
    participantHint: 'Yayınlanmadan katılımcılar bu listeyi görmez.',
    href: '/admin/listeler/kamp',
    isRecommendation: false,
  },
];

export const LIST_WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Menüyü belirleyin',
    description: 'Günlük kahvaltı, öğün ve ara öğünleri yazın.',
    href: '/admin/menu-duzenle',
  },
  {
    step: 2,
    title: 'Kamp ihtiyaçlarını oluşturun',
    description: 'Menüden AI ile liste üretin veya kendiniz ekleyin.',
    href: '/admin/listeler/kamp',
  },
  {
    step: 3,
    title: 'Kişisel ve çadır listelerini düzenleyin',
    description: 'Her katılımcı ve çadır için hazır maddeleri kontrol edin.',
    href: '/admin/listeler/kisisel',
  },
  {
    step: 4,
    title: 'Kontrol edin ve yayınlayın',
    description: 'Kamp listesini gözden geçirip katılımcılara açın.',
    href: '/admin/listeler/kamp',
  },
];

export function getListConfig(slug: string): ListTypeConfig | undefined {
  return LIST_TYPES.find((l) => l.slug === slug);
}
