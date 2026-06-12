export interface SetupProgressInput {
  campaignName: string;
  hasDates: boolean;
  tentCount: number;
  userCount: number;
  menuCount: number;
  itemCount: number;
  isMenuPublished: boolean;
  hasPublishedItems: boolean;
}

export interface SetupStep {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  editHref: string;
  optional?: boolean;
}

export const SETUP_STEPS: SetupStep[] = [
  {
    id: 1,
    slug: 'kamp',
    title: 'Kamp bilgileri',
    shortTitle: 'Kamp',
    description: 'Kamp adı, konum ve tarihleri girin.',
    editHref: '/admin/kamp',
  },
  {
    id: 2,
    slug: 'cadirlar',
    title: 'Çadırlar ve kişiler',
    shortTitle: 'Çadırlar',
    description: 'Çadırları ve katılımcıları ekleyin. Denemede en fazla 2 kişi.',
    editHref: '/admin/cadirlar',
  },
  {
    id: 3,
    slug: 'ucret',
    title: 'Konaklama ücreti',
    shortTitle: 'Ücret',
    description: 'Tesis kişi başı ücretini belirleyin (bakiye hesabı için).',
    editHref: '/admin/ucret',
    optional: true,
  },
  {
    id: 4,
    slug: 'menu',
    title: 'Menü planı',
    shortTitle: 'Menü',
    description: 'Günlük kahvaltı, öğün ve ara öğünleri yazın.',
    editHref: '/admin/menu-duzenle',
  },
  {
    id: 5,
    slug: 'liste',
    title: 'Alışveriş listesi',
    shortTitle: 'Liste',
    description: 'Menüden alışveriş listesi oluşturun ve katılımcılara yayınlayın.',
    editHref: '/admin/liste',
  },
  {
    id: 6,
    slug: 'paylas',
    title: 'Giriş bilgisini paylaş',
    shortTitle: 'Paylaş',
    description: 'Katılımcılara giriş adresi ve kullanıcı adlarını gönderin.',
    editHref: '/admin/paylas',
    optional: true,
  },
];

export function getStepCompletion(input: SetupProgressInput): Record<number, boolean> {
  return {
    1: !!input.campaignName && input.hasDates,
    2: input.tentCount >= 1 && input.userCount >= 1,
    3: true,
    4: input.menuCount > 0,
    5: input.hasPublishedItems,
    6: false,
  };
}

export function firstIncompleteStep(completed: Record<number, boolean>): number {
  for (const step of SETUP_STEPS) {
    if (!step.optional && !completed[step.id]) return step.id;
  }
  return SETUP_STEPS.length;
}

export function requiredStepsDone(completed: Record<number, boolean>): boolean {
  return SETUP_STEPS.filter((s) => !s.optional).every((s) => completed[s.id]);
}
