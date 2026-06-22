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
    title: 'Kamp temel bilgileri',
    shortTitle: 'Temel',
    description: 'Kamp adı, konum ve tarihlerini kontrol edin. Kayıt sırasında girdiğiniz bilgiler burada.',
    editHref: '/admin/kamp',
  },
  {
    id: 2,
    slug: 'cadirlar',
    title: 'Çadırlar ve katılımcılar',
    shortTitle: 'Kişiler',
    description: 'Her çadırı ve katılımcıyı ekleyin. Her kişiye kullanıcı adı ve şifre verin.',
    editHref: '/admin/cadirlar',
  },
  {
    id: 3,
    slug: 'ucret',
    title: 'Konaklama ve bütçe ayarları',
    shortTitle: 'Ücret',
    description: 'Tesis kişi başı ücretini girin. Bakiye hesabı buna göre yapılır.',
    editHref: '/admin/ucret',
    optional: true,
  },
  {
    id: 4,
    slug: 'menu',
    title: 'Menü planlaması',
    shortTitle: 'Menü',
    description: 'Gün gün ne yeneceğini yazın. İsterseniz şimdi atlayıp sonra tamamlayabilirsiniz.',
    editHref: '/admin/menu-duzenle',
    optional: true,
  },
  {
    id: 5,
    slug: 'liste',
    title: 'İhtiyaç listesi onayı',
    shortTitle: 'Liste',
    description: 'AI veya elle oluşturduğunuz listeleri kontrol edin ve katılımcılara yayınlayın.',
    editHref: '/admin/listeler',
  },
  {
    id: 6,
    slug: 'paylas',
    title: 'Özet ve davet',
    shortTitle: 'Davet',
    description: 'Kamp özetini kontrol edin, katılımcılara giriş bilgisini gönderin.',
    editHref: '/admin/paylas',
    optional: true,
  },
];

/** Admin paneli / kurulum özeti için gerçek veri tamamlanma durumu */
export function getStepCompletion(input: SetupProgressInput): Record<number, boolean> {
  return {
    1: !!input.campaignName && input.hasDates,
    2: input.tentCount >= 1 && input.userCount >= 1,
    3: false, // opsiyonel — sihirbazda ziyaret edilene kadar tamamlanmış sayılmaz
    4: input.menuCount > 0,
    5: input.hasPublishedItems,
    6: false, // davet adımı yalnızca sihirbazda geçildiğinde tamamlanır
  };
}

/** Sihirbaz adım çubuğu: yalnızca kullanıcının geçtiği adımlar tikli */
export function getWizardStepState(
  stepId: number,
  current: number
): 'done' | 'current' | 'upcoming' {
  if (stepId < current) return 'done';
  if (stepId === current) return 'current';
  return 'upcoming';
}

export function canAdvanceFromStep(
  stepId: number,
  input: SetupProgressInput
): { ok: boolean; message?: string } {
  const completed = getStepCompletion(input);
  switch (stepId) {
    case 1:
      return completed[1]
        ? { ok: true }
        : { ok: false, message: 'Kamp adı ve tarihleri kaydedin.' };
    case 2:
      return input.tentCount >= 1 && input.userCount >= 1
        ? { ok: true }
        : { ok: false, message: 'En az bir çadır ve bir katılımcı ekleyin.' };
    case 5:
      return completed[5]
        ? { ok: true }
        : {
            ok: true,
            message:
              'Kamp listesi henüz yayınlanmadı — isterseniz devam edip sonra yayınlayabilirsiniz.',
          };
    default:
      return { ok: true };
  }
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
