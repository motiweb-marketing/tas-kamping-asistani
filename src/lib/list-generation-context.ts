/** Admin liste oluşturmadan önce doldurduğu bağlam */
export interface ListGenerationContext {
  /** Kişi listesi kesinleşti onayı */
  headcount_confirmed: boolean;
  cooking_setup: 'mangal' | 'ocak' | 'both';
  has_portable_cooler: boolean;
  dietary_notes: string;
  alcohol_in_menu: boolean;
  coffee_tea_level: 'low' | 'medium' | 'high';
  dishwashing: 'hand' | 'camp_sink';
  breakfast_style: 'full' | 'simple';
  extra_notes: string;
}

export const DEFAULT_LIST_GENERATION_CONTEXT: ListGenerationContext = {
  headcount_confirmed: false,
  cooking_setup: 'both',
  has_portable_cooler: false,
  dietary_notes: '',
  alcohol_in_menu: false,
  coffee_tea_level: 'medium',
  dishwashing: 'camp_sink',
  breakfast_style: 'full',
  extra_notes: '',
};

export function normalizeListGenerationContext(
  raw: Partial<ListGenerationContext> | null | undefined
): ListGenerationContext {
  const base = DEFAULT_LIST_GENERATION_CONTEXT;
  if (!raw || typeof raw !== 'object') return { ...base };

  const cooking = raw.cooking_setup;
  const tea = raw.coffee_tea_level;
  const dish = raw.dishwashing;
  const breakfast = raw.breakfast_style;

  return {
    headcount_confirmed: Boolean(raw.headcount_confirmed),
    cooking_setup:
      cooking === 'mangal' || cooking === 'ocak' || cooking === 'both' ? cooking : base.cooking_setup,
    has_portable_cooler: Boolean(raw.has_portable_cooler),
    dietary_notes: String(raw.dietary_notes ?? '').trim(),
    alcohol_in_menu: Boolean(raw.alcohol_in_menu),
    coffee_tea_level: tea === 'low' || tea === 'high' ? tea : 'medium',
    dishwashing: dish === 'hand' ? 'hand' : 'camp_sink',
    breakfast_style: breakfast === 'simple' ? 'simple' : 'full',
    extra_notes: String(raw.extra_notes ?? '').trim(),
  };
}

export function formatListContextForPrompt(ctx: ListGenerationContext): string {
  const cooking =
    ctx.cooking_setup === 'mangal'
      ? 'Mangal/barbekü (kömür, ızgara teli, maşa vb. dahil hesapla)'
      : ctx.cooking_setup === 'ocak'
        ? 'Kamp ocağı / tencere-tava (gaz/elektrik ocak)'
        : 'Hem mangal hem ocak kullanılacak';

  const cooler = ctx.has_portable_cooler
    ? 'Grupta taşınabilir kamp buzluğu/termos VAR — ekstra büyük buzluğa gerek yok'
    : 'Taşınabilir buzluğu yok — soğuk zincir ve buz ihtiyacını hesapla';

  const tea =
    ctx.coffee_tea_level === 'high'
      ? 'Çay/kahve tüketimi YÜKSEK'
      : ctx.coffee_tea_level === 'low'
        ? 'Çay/kahve tüketimi DÜŞÜK'
        : 'Çay/kahve tüketimi ORTA';

  const dish =
    ctx.dishwashing === 'hand'
      ? 'Bulaşık elde yıkanacak (kova, sünger, deterjan, kurulama bezi)'
      : 'Kamp lavabosunda yıkanacak (sünger, deterjan, kurulama bezi)';

  const breakfast =
    ctx.breakfast_style === 'simple'
      ? 'Kahvaltı SADE (çay, ekmek, peynir/zeytin düzeyi)'
      : 'Kahvaltı ZENGİN (yumurta, domates, salam/sucuk, reçel vb.)';

  const lines = [
    `Pişirme: ${cooking}`,
    `Soğutma: ${cooler}`,
    `Kahvaltı: ${breakfast}`,
    `İçecek: ${tea}`,
    `Bulaşık: ${dish}`,
    ctx.alcohol_in_menu ? 'Menüde alkol var — bira/şarap/aperatif malzemeleri dahil et' : 'Menüde alkol yok',
  ];

  if (ctx.dietary_notes) lines.push(`Diyet/alerji: ${ctx.dietary_notes}`);
  if (ctx.extra_notes) lines.push(`Ek notlar: ${ctx.extra_notes}`);

  return lines.join('\n');
}
