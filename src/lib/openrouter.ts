import type { AiGeneratedItem, ItemCategory, MenuSummaryLine } from '@/types';
import type { ListGenerationContext } from '@/lib/list-generation-context';
import { formatListContextForPrompt } from '@/lib/list-generation-context';
import {
  computeNeededCountFromQuantity,
  guessScalesWithPeople,
  parseQuantityString,
} from '@/lib/quantity-parser';

const OPENROUTER_HEADERS = {
  'Content-Type': 'application/json',
  'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'X-Title': 'Kamp Asistani',
} as const;

interface PromptParams {
  totalPeople: number;
  adultCount: number;
  childCount: number;
  tentCount: number;
  campDays: number;
  menuDetails: MenuSummaryLine[];
  context: ListGenerationContext;
  extraPrompt?: string;
}

export interface AiGeneratedItemStructured extends AiGeneratedItem {
  quantity_amount: number;
  quantity_unit: string;
  scales_with_people: boolean;
  notes?: string;
  section_hint?: string;
}

export function buildSystemPrompt(params: PromptParams): string {
  const menuText = params.menuDetails
    .filter((m) => m.description?.trim())
    .map((m) => {
      const period =
        m.period === 'breakfast' || m.meal_type === 'breakfast'
          ? 'Sabah'
          : 'Akşam';
      const kind =
        m.entry_kind === 'snack'
          ? 'Ara Öğün'
          : m.entry_kind === 'meal'
            ? 'Yemek'
            : m.entry_kind === 'breakfast'
              ? 'Kahvaltı'
              : m.meal_type === 'breakfast'
                ? 'Kahvaltı'
                : 'Yemek';
      return `${m.day} ${period} (${kind}): ${m.description}`;
    })
    .join('\n');

  const contextBlock = formatListContextForPrompt(params.context);

  return `Sen profesyonel bir kamp mutfak ve lojistik planlayıcısısın.

GRUP BİLGİSİ (KESİN — tüm miktarları buna göre hesapla):
- Toplam ${params.totalPeople} kişi (${params.adultCount} yetişkin, ${params.childCount} çocuk)
- ${params.tentCount} çadır
- ${params.campDays} kamp günü

KAMP MENÜSÜ:
${menuText}

GRUP TERCİHLERİ:
${contextBlock}
${params.extraPrompt ? `\n${params.extraPrompt}\n` : ''}

GÖREV: Bu menü için ORTAK KAMP ALIŞVERİŞ listesi oluştur. Eksiksiz, milimetrik, uygulanabilir olmalı.

HESAPLAMA KURALLARI:
1. Her yemek için malzeme + pişirme ekipmanı + servis düşün.
   Örnek pilav: pirinç, yağ, tuz, su + tencere + kapak + kepçe/kaşık.
   Örnek mangal: kömür/odun, çakmak, ızgara teli, maşa, eldiven, kömür kovası, yağlı kağıt/alüminyum folyo.
2. Kişi başı porsiyon hesapla; çocukları ~%70 porsiyon say.
3. Fire payı: kuru gıdada %10, sebzedey %15, kömürde mangal başına yeterli + yedek.
4. Kahvaltı, ara öğün, akşam yemeği ve içecekleri ayrı ayrı hesapla.
5. Bulaşık: deterjan, sünger, eldiven, kurulama bezi, çöp poşeti (gün sayısına göre).
6. Baharat/temel: tuz, karabiber, pul biber, zeytinyağı/ayçiçek yağı (menüde geçenlere göre).
7. Tek seferlik ekipman (1 mangal, 1 büyük tencere) scales_with_people=false; tüketimlikler true.

BÖLÜMLENDİRME (section_hint):
- Her öğeye Türkçe alışveriş kategorisi ver: section_hint
- Benzer malzemeler aynı kategoride olsun (5–10 kategori ideal)
- Örnek kategoriler: "Et & Tavuk", "Sebze & Meyve", "Baharat & Sos", "İçecekler", "Mangal & Kömür", "Pişirme Ekipmanı", "Bulaşık & Temizlik", "Kahvaltılık"
- Kategori uymuyorsa "Genel" kullan

KESİNLİKLE DAHİL ETME (sistemde zaten var):
- Tabak, bardak, çay bardağı, çatal, kaşık, bıçak, peçete (standart liste)
- Deniz ayakkabısı, güneş kremi, şapka, mayo, kişisel ilaçlar (kişisel liste)
- Çoklu priz, çadır ışığı, sinek spreyi, uyku tulumu (çadır listesi)
- İçme suyu ve çay suyu (damacana) — sistem ayrı ekler, sen EKLEME

JSON FORMATI — her öğe:
{
  "name": "Malzeme adı",
  "quantity": "2.4 kg",
  "quantity_amount": 2.4,
  "quantity_unit": "kg",
  "scales_with_people": true,
  "category": "food" veya "equipment",
  "section_hint": "Sebze & Meyve",
  "notes": "Kısa açıklama (isteğe bağlı)"
}

quantity_amount sayısal olmalı. quantity = quantity_amount + boşluk + quantity_unit.
Yanıtın SADECE JSON array olmalı, başka metin ekleme.`;
}

export interface RawDayMenuInput {
  date: string;
  title: string;
  show_breakfast: boolean;
  show_meal: boolean;
  show_snack: boolean;
  breakfast: string;
  meal: string;
  snack: string;
}

export function buildMenuPublishPrompt(
  rawDays: RawDayMenuInput[],
  adminInstructions: string
): string {
  const filled = rawDays.filter(
    (d) => d.breakfast.trim() || d.meal.trim() || d.snack.trim()
  );

  return `Sen kamp menüsü editörüsün. Adminin ham notlarını katılımcılar için düzenli, sıcak ve okunaklı bir menüye çevir.

ADMIN TALİMATLARI:
${adminInstructions.trim() || 'Ham notları net, samimi ve anlaşılır Türkçe ile düzenle. Malzemeleri ve yemekleri madde madde yaz.'}

HAM MENÜ (JSON):
${JSON.stringify(filled, null, 2)}

Kurallar:
- Her günün date alanını aynen koru
- show_breakfast, show_meal, show_snack alanlarını aynen koru
- Sadece breakfast, meal, snack metinlerini düzenle
- Boş alanları "" bırak
- title alanını aynen koru

Yanıtın SADECE JSON array olmalı. Format:
[{"date":"YYYY-MM-DD","title":"...","show_breakfast":true,"show_meal":false,"show_snack":false,"breakfast":"","meal":"...","snack":""}]`;
}

async function callOpenRouterRaw(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  if (!apiKey?.trim()) {
    throw new Error('AI şu an kullanılamıyor. Pro sürümde bu özellik otomatik dahildir.');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...OPENROUTER_HEADERS,
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.35,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter hatası: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function normalizeAiItem(raw: Record<string, unknown>): AiGeneratedItemStructured | null {
  const name = String(raw.name ?? '').trim();
  if (!name) return null;

  const category: ItemCategory = raw.category === 'equipment' ? 'equipment' : 'food';

  let amount = Number(raw.quantity_amount);
  let unit = String(raw.quantity_unit ?? '').trim();

  if (Number.isNaN(amount) || amount <= 0 || !unit) {
    const parsed = parseQuantityString(String(raw.quantity ?? ''));
    if (!parsed) return null;
    amount = parsed.amount;
    unit = parsed.unit;
  }

  const scales =
    typeof raw.scales_with_people === 'boolean'
      ? raw.scales_with_people
      : guessScalesWithPeople(unit, category);

  const quantity = `${amount} ${unit}`.replace(/(\d+)\.(\d+)0+\s/, '$1.$2 ');

  return {
    name,
    quantity,
    quantity_amount: amount,
    quantity_unit: unit,
    scales_with_people: scales,
    category,
    notes: raw.notes ? String(raw.notes).trim() : undefined,
    section_hint: raw.section_hint ? String(raw.section_hint).trim() : undefined,
  };
}

export async function callOpenRouter(
  systemPrompt: string,
  apiKey: string
): Promise<AiGeneratedItemStructured[]> {
  const content = await callOpenRouterRaw(
    systemPrompt,
    'Yukarıdaki kurallara göre eksiksiz alışveriş listesini JSON array olarak oluştur.',
    apiKey
  );

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('AI yanıtı JSON formatında değil');
  }

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>[];
  const items: AiGeneratedItemStructured[] = [];

  for (const raw of parsed) {
    const item = normalizeAiItem(raw);
    if (item) items.push(item);
  }

  if (!items.length) {
    throw new Error('AI geçerli liste üretemedi');
  }

  return items;
}

export async function callOpenRouterMenuPublish(
  systemPrompt: string,
  apiKey: string
): Promise<RawDayMenuInput[]> {
  const content = await callOpenRouterRaw(
    systemPrompt,
    'Menüyü JSON array olarak döndür.',
    apiKey
  );

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('AI menü yanıtı JSON formatında değil');
  }

  return JSON.parse(jsonMatch[0]) as RawDayMenuInput[];
}

export interface AiClarification {
  id: string;
  question: string;
  options?: string[];
}

export async function callOpenRouterClarifications(
  summary: string,
  apiKey: string
): Promise<AiClarification[]> {
  const systemPrompt = `Sen kamp organizasyon asistanısın. Verilen özet belirsiz veya eksikse en fazla 2 kısa soru sor.
Her soruda 2-4 seçenek ver. Her şey netse boş dizi döndür.
Yanıt SADECE JSON: {"clarifications":[{"id":"q1","question":"...","options":["A","B"]}]}`;

  const content = await callOpenRouterRaw(systemPrompt, summary, apiKey);
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { clarifications?: AiClarification[] };
    return (parsed.clarifications || []).slice(0, 2);
  } catch {
    return [];
  }
}

export { computeNeededCountFromQuantity };
