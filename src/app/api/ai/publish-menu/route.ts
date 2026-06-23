import { NextResponse } from 'next/server';
import { generateCampDayCards } from '@/lib/camp-slots';
import { dayMenuToFlat, rowsToDayMap } from '@/lib/menu-storage';
import {
  buildMenuPublishPrompt,
  callOpenRouterMenuPublish,
  type RawDayMenuInput,
} from '@/lib/openrouter';
import {
  buildMenuPromptFromProfile,
  migrateLegacyMenuPrompt,
  normalizeCampSetupProfile,
} from '@/lib/camp-setup-profile';
import { getPlatformOpenRouterKey } from '@/lib/platform-settings';
import { resolveOpenRouterKeyFromRow } from '@/lib/resolve-openrouter-key';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const campaignId = session.user.campaign_id;
  const supabase = createServerClient();

  const [campaignRes, menusRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select(
        'openrouter_api_key, use_platform_ai, plan_tier, menu_ai_prompt, start_date, end_date, camp_setup_profile'
      )
      .eq('id', campaignId)
      .single(),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
  ]);

  const campaign = campaignRes.data;
  const apiKey = resolveOpenRouterKeyFromRow(
    campaign,
    await getPlatformOpenRouterKey(supabase)
  );

  if (!apiKey) {
    const isPro = campaign?.plan_tier === 'paid';
    return NextResponse.json(
      {
        error: isPro
          ? 'AI şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin veya destek ile iletişime geçin.'
          : 'AI menü düzenleme Pro sürümde dahildir. Pro\'ya geçmek için Pro sayfasından bize yazın.',
      },
      { status: 400 }
    );
  }

  if (!campaign?.start_date || !campaign?.end_date) {
    return NextResponse.json({ error: 'Önce kamp tarihlerini kaydedin' }, { status: 400 });
  }

  const cards = generateCampDayCards(campaign.start_date, campaign.end_date);
  const dayMap = rowsToDayMap(menusRes.data || []);

  const rawDays: RawDayMenuInput[] = cards.map((card) => {
    const stored = dayMap.get(card.date);
    const content = stored?.content ?? { breakfast: '', meal: '', snack: '' };
    return {
      date: card.date,
      title: card.title,
      show_breakfast: card.show_breakfast,
      show_meal: card.show_meal,
      show_snack: card.show_snack,
      breakfast: content.breakfast,
      meal: content.meal,
      snack: content.snack,
    };
  });

  const hasContent = rawDays.some(
    (d) => d.breakfast.trim() || d.meal.trim() || d.snack.trim()
  );
  if (!hasContent) {
    return NextResponse.json({ error: 'Önce ham menü notlarını girin' }, { status: 400 });
  }

  try {
    const profile = migrateLegacyMenuPrompt(
      normalizeCampSetupProfile(campaign?.camp_setup_profile),
      campaign?.menu_ai_prompt
    );
    const adminInstructions = buildMenuPromptFromProfile(profile);
    const prompt = buildMenuPublishPrompt(rawDays, adminInstructions);
    const aiDays = await callOpenRouterMenuPublish(prompt, apiKey);

    const merged = cards.map((card) => {
      const ai = aiDays.find((d) => d.date === card.date);
      return {
        ...card,
        breakfast: ai?.breakfast ?? '',
        meal: ai?.meal ?? '',
        snack: ai?.snack ?? '',
      };
    });

    const { error } = await supabase
      .from('campaigns')
      .update({ published_menu: JSON.stringify(merged) })
      .eq('id', campaignId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ days: merged });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
