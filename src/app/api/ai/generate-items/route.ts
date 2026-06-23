import { NextRequest, NextResponse } from 'next/server';
import { normalizeItemName } from '@/lib/item-names';
import { dayMenuToFlat, rowsToDayMap } from '@/lib/menu-storage';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import {
  enrichAiGeneratedItems,
  ensureCalculationNotes,
} from '@/lib/enrich-ai-items';
import {
  analyzeMenuIngredients,
  formatComputedNeedsForPrompt,
} from '@/lib/menu-ingredient-analysis';
import {
  buildSystemPrompt,
  callOpenRouter,
  callOpenRouterClarifications,
  callOpenRouterPortionResearch,
  computeNeededCountFromQuantity,
} from '@/lib/openrouter';
import { getPlatformOpenRouterKey } from '@/lib/platform-settings';
import { resolveOpenRouterKeyFromRow } from '@/lib/resolve-openrouter-key';
import {
  normalizeListGenerationContext,
  type ListGenerationContext,
} from '@/lib/list-generation-context';
import {
  buildMenuPromptFromProfile,
  migrateLegacyMenuPrompt,
  normalizeCampSetupProfile,
  profileToListContext,
} from '@/lib/camp-setup-profile';
import { filterAiItemsWithoutWater, waterItemsToAiRows } from '@/lib/inject-water-items';
import {
  rebuildSharedSectionsFromHints,
  resolveSectionId,
} from '@/lib/list-sections';
import { snapshotHeadcount } from '@/lib/sync-ai-list-quantities';
import { computeWaterPlan, formatWaterPlanForPrompt } from '@/lib/water-plan';

const MIN_PARTICIPANTS = 2;

function countCampDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 3;
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const campaignId = session.user.campaign_id;
  const supabase = createServerClient();

  let body: {
    phase?: 'preview' | 'finalize';
    context?: Partial<ListGenerationContext>;
    clarification_answers?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const phase = body.phase || 'finalize';

  const [campaignRes, usersRes, tentsRes, menusRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select(
        'openrouter_api_key, use_platform_ai, plan_tier, start_date, end_date, camp_setup_profile, menu_ai_prompt'
      )
      .eq('id', campaignId)
      .single(),
    supabase.from('users').select('age, tent_id').eq('campaign_id', campaignId),
    supabase.from('tents').select('id').eq('campaign_id', campaignId),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
  ]);

  const profile = migrateLegacyMenuPrompt(
    normalizeCampSetupProfile(campaignRes.data?.camp_setup_profile),
    campaignRes.data?.menu_ai_prompt
  );

  const context = normalizeListGenerationContext({
    ...profileToListContext(profile),
    ...body.context,
  });

  if (!context.headcount_confirmed) {
    return NextResponse.json(
      { error: 'Liste oluşturmadan önce kişi sayısının kesinleştiğini onaylamalısınız.' },
      { status: 400 }
    );
  }

  const apiKey = resolveOpenRouterKeyFromRow(
    campaignRes.data,
    await getPlatformOpenRouterKey(supabase)
  );
  if (!apiKey) {
    const isPro = campaignRes.data?.plan_tier === 'paid';
    return NextResponse.json(
      {
        error: isPro
          ? 'AI şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin veya destek ile iletişime geçin.'
          : "AI liste oluşturma Pro sürümde dahildir. Pro'ya geçmek için Pro sayfasından bize yazın.",
      },
      { status: 400 }
    );
  }

  const users = usersRes.data || [];
  const tents = tentsRes.data || [];
  const headcount = snapshotHeadcount(users);

  if (headcount.total < MIN_PARTICIPANTS) {
    return NextResponse.json(
      {
        error: `Kişi sayısı net değil. En az ${MIN_PARTICIPANTS} kayıtlı kişi gerekli (şu an ${headcount.total}).`,
      },
      { status: 400 }
    );
  }

  const usersWithoutTent = users.filter((u) => !u.tent_id).length;
  if (usersWithoutTent > 0) {
    return NextResponse.json(
      { error: `${usersWithoutTent} kişinin çadırı atanmamış. Önce tüm kişilere çadır atayın.` },
      { status: 400 }
    );
  }

  const dayMap = rowsToDayMap(menusRes.data || []);
  const flatMenus = Array.from(dayMap.entries()).flatMap(([day, { content }]) =>
    dayMenuToFlat(day, content)
  );
  const menus = flatMenus
    .filter((m) => m.description?.trim())
    .map((m) => ({
      day: m.day,
      meal_type: m.meal_type,
      period: m.period,
      entry_kind: m.entry_kind,
      description: m.description,
    }));

  if (!menus.length) {
    return NextResponse.json({ error: 'Önce menü tariflerini girin' }, { status: 400 });
  }

  const campDays = countCampDays(
    campaignRes.data?.start_date || '',
    campaignRes.data?.end_date || ''
  );

  const waterPlan = computeWaterPlan(profile.water, headcount.total, campDays);

  const menuTextForResearch = menus
    .map((m) => `${m.day}: ${m.description}`)
    .join('\n');
  const computedNeeds = analyzeMenuIngredients(
    menus,
    headcount.adults,
    headcount.children
  );

  const [portionResearch] = await Promise.all([
    callOpenRouterPortionResearch(
      menuTextForResearch,
      headcount.total,
      campDays,
      apiKey
    ),
  ]);

  const extraPrompt = [
    buildMenuPromptFromProfile(profile),
    formatWaterPlanForPrompt(profile, headcount.total, campDays),
    formatComputedNeedsForPrompt(computedNeeds),
    portionResearch,
    body.clarification_answers
      ? `Kullanıcı netleştirmeleri: ${JSON.stringify(body.clarification_answers)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  if (phase === 'preview') {
    const clarifications = await callOpenRouterClarifications(
      `Kamp: ${headcount.total} kişi, ${campDays} gün. Menü öğesi: ${menus.length}. Su özeti: ${waterPlan.summary}`,
      apiKey
    );
    return NextResponse.json({
      clarifications,
      water_summary: waterPlan.summary,
    });
  }

  const systemPrompt = buildSystemPrompt({
    totalPeople: headcount.total,
    adultCount: headcount.adults,
    childCount: headcount.children,
    tentCount: tents.length || 1,
    campDays,
    menuDetails: menus,
    context,
    extraPrompt,
  });

  try {
    await supabase
      .from('items')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'shared')
      .eq('is_published', false)
      .eq('is_extra', false);

    const aiItemsRaw = await callOpenRouter(systemPrompt, apiKey);
    const enriched = ensureCalculationNotes(
      enrichAiGeneratedItems(
        filterAiItemsWithoutWater(aiItemsRaw),
        computedNeeds
      )
    );
    const aiItems = [...enriched, ...waterItemsToAiRows(waterPlan.items)];

    const sectionMap = await rebuildSharedSectionsFromHints(
      supabase,
      campaignId,
      aiItems.map((item) => item.section_hint || 'Genel')
    );

    const { data: existingShared } = await supabase
      .from('items')
      .select('name')
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'shared');

    const seenNames = new Set(
      (existingShared || []).map((item) => normalizeItemName(item.name))
    );

    const rows = aiItems
      .filter((item) => {
        const normalized = normalizeItemName(item.name);
        if (!normalized || seenNames.has(normalized)) return false;
        seenNames.add(normalized);
        return true;
      })
      .map((item) => ({
        campaign_id: campaignId,
        name: item.name,
        quantity: item.quantity,
        quantity_amount: item.quantity_amount,
        quantity_unit_text: item.quantity_unit,
        scales_with_people: item.scales_with_people,
        baseline_headcount: headcount.total,
        needed_count: computeNeededCountFromQuantity(item.quantity_amount, item.quantity_unit),
        unit_label: item.quantity_unit,
        category: item.category,
        disposition: 'consumable' as const,
        list_scope: 'shared' as const,
        is_recommendation: false,
        is_standard: false,
        is_extra: false,
        is_published: false,
        notes: item.notes || null,
        price: 0,
        added_by: session.user!.id,
        section_id: resolveSectionId(sectionMap, item.section_hint),
      }));

    if (!rows.length) {
      return NextResponse.json(
        { error: 'AI yeni malzeme üretemedi (hepsi listede zaten var olabilir).' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from('items').insert(rows).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from('campaigns')
      .update({
        list_generation_context: context,
        camp_setup_profile: profile,
        list_baseline_headcount: headcount.total,
        list_baseline_adults: headcount.adults,
        list_baseline_children: headcount.children,
        list_generated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    return NextResponse.json({
      items: data,
      count: data?.length || 0,
      headcount: headcount.total,
      sectionCount: sectionMap.size,
      water_summary: waterPlan.summary,
      redirectTo: '/admin/listeler/kamp',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
