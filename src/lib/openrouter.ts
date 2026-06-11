import type { AiGeneratedItem, MenuSummaryLine } from '@/types';

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

  return `Sen Taş Kamping'e gidecek bir grubun asistanısın. Grupta toplam ${params.totalPeople} kişi var (${params.adultCount} yetişkin, ${params.childCount} çocuk). Katılımcılar ${params.tentCount} adet çadırda kalacak.

İşte gün gün kamp menüsü:
${menuText}

Bu menüye ve kişi sayısına göre milimetrik bir alışveriş listesi çıkar.

Ayrıca Taş Kamping kurallarına göre şu donanımları kesinlikle listeye ekle:
- Sahil taşlık olduğu için ${params.totalPeople} adet 'Deniz Ayakkabısı'
- Ortak buzdolabı yetersiz kalacağı için 'Büyük Boy Kamp Buzluğu/Termos'
- Çadırlarda elektrik var, içerde telefonu şarj etmek için ${params.tentCount} adet 'Çoklu Priz / Uzatma Kablosu'

Sadece JSON formatında dönecek bir liste ver. Her öğe şu formatta olmalı: {"name": "...", "quantity": "...", "category": "food" veya "equipment"}
Yanıtın SADECE JSON array olmalı, başka metin ekleme.`;
}

export async function callOpenRouter(
  systemPrompt: string,
  apiKey: string
): Promise<AiGeneratedItem[]> {
  if (!apiKey?.trim()) {
    throw new Error('OpenRouter API anahtarı tanımlı değil. Admin → Ayarlar sayfasından girin.');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Taş Kamping Asistanı',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Alışveriş listesini JSON array olarak oluştur.' },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter hatası: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '[]';

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
