import type { ItemCategory } from '@/types';

export interface DefaultChecklistEntry {
  name: string;
  quantity: string;
  category: ItemCategory;
  notes: string;
}

/** Her katılımcının kendi getirmesi gerekenler — ortak alışverişe dahil değil */
export const DEFAULT_PERSONAL_CHECKLIST: DefaultChecklistEntry[] = [
  {
    name: 'Deniz ayakkabısı / su ayakkabısı',
    quantity: '1 çift',
    category: 'equipment',
    notes: 'Sahil taşlık — herkes kendi ayağına uygun getirmeli',
  },
  {
    name: 'Güneş kremi',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Yüksek faktör, gün boyu güneşteyiz',
  },
  {
    name: 'Şapka veya güneş gözlüğü',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Kişisel güneş koruması',
  },
  {
    name: 'Havlu ve kişisel hijyen malzemeleri',
    quantity: '1 set',
    category: 'equipment',
    notes: 'Diş fırçası, sabun, şampuan vb.',
  },
  {
    name: 'Kişisel ilaçlar',
    quantity: 'İhtiyaca göre',
    category: 'equipment',
    notes: 'Düzenli kullandığınız ilaçlar ve temel ilk yardım (yara bandı)',
  },
  {
    name: 'Mayo / yüzme kıyafeti',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Deniz ve duş için',
  },
  {
    name: 'Powerbank',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Telefon şarjı için kişisel yedek',
  },
  {
    name: 'Nakit / küçük harçlık',
    quantity: 'İhtiyaca göre',
    category: 'equipment',
    notes: 'Çevrede market veya ek ihtiyaçlar için',
  },
];

/** Her çadırın (aile) bulundurması gereken ekipman — ortak alışverişe dahil değil */
export const DEFAULT_TENT_CHECKLIST: DefaultChecklistEntry[] = [
  {
    name: 'Çoklu priz / uzatma kablosu',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Çadırda elektrik var — telefon ve küçük cihazlar için',
  },
  {
    name: 'Çadır içi LED ışık / fener',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Gece çadır içi aydınlatma',
  },
  {
    name: 'Sinek kovucu sprey',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Akşam sinekleri için çadır çevresi',
  },
  {
    name: 'Uyku tulumu veya yatak / mat',
    quantity: 'Kişi başı',
    category: 'equipment',
    notes: 'Çadır üyelerinin konforu için',
  },
  {
    name: 'Kamp sandalyesi',
    quantity: 'İhtiyaca göre',
    category: 'equipment',
    notes: 'Oturma alanı — çadır başına birkaç adet yeterli',
  },
  {
    name: 'Çadır pengueni / ek kazık',
    quantity: '1 set',
    category: 'equipment',
    notes: 'Rüzgârda çadırı sabitlemek için',
  },
  {
    name: 'Çöp torbası',
    quantity: '1 paket',
    category: 'equipment',
    notes: 'Çadır çevresi temizliği',
  },
  {
    name: 'El feneri',
    quantity: '1 adet',
    category: 'equipment',
    notes: 'Gece tuvalet / çadır dışı hareket için',
  },
];
