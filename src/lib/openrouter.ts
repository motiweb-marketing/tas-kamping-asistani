import type { AiGeneratedItem, MenuSummaryLine } from '@/types';

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
  menuDetails: MenuSummaryLine[];
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

  return `Sen kampa gidecek bir grubun asistanısın. Grupta toplam ${params.totalPeople} kişi var (${params.adultCount} yetişkin, ${params.childCount} çocuk). Katılımcılar ${params.tentCount} adet çadırda kalacak.

İşte gün gün kamp menüsü:
${menuText}

Bu menüye ve kişi sayısına göre ORTAK KAMP ALIŞVERİŞ listesi çıkar.

ÖNEMLİ — listeye KESİNLİKLE DAHİL ETME (bunlar sistemde zaten var):
- Tabak, bardak, çay bardağı, çatal, kaşık, bıçak, peçete (standart liste)
- Deniz ayakkabısı, güneş kremi, şapka, mayo, kişisel ilaçlar (kişisel liste)
- Çoklu priz, çadır ışığı, sinek spreyi, uyku tulumu (çadır listesi)

Sadece menüye özel yiyecek ve tüketimlik ortak malzemeleri ekle:
- Menüdeki tüm yiyecek ve içecek malzemeleri (category: food)
- Ortak kullanım ekipmanı: büyük kamp buzluğu/termos, mangal kömürü/odun, ortak pişirme tencere/tava, tabak-bardak seti (kişi sayısına göre), çöp poşeti, bulaşık süngeri/deterjan (category: equipment)

Sadece JSON formatında dönecek bir liste ver. Her öğe: {"name": "...", "quantity": "...", "category": "food" veya "equipment"}
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
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter hatası: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callOpenRouter(
  systemPrompt: string,
  apiKey: string
): Promise<AiGeneratedItem[]> {
  const content = await callOpenRouterRaw(
    systemPrompt,
    'Alışveriş listesini JSON array olarak oluştur.',
    apiKey
  );

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('AI yanıtı JSON formatında değil');
  }

  const items: AiGeneratedItem[] = JSON.parse(jsonMatch[0]);

  return items.map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    category: item.category === 'equipment' ? 'equipment' : 'food',
  }));
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
