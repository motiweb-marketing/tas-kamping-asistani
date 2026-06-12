import { NextResponse } from 'next/server';
import { normalizeItemName } from '@/lib/item-names';
import { dayMenuToFlat, rowsToDayMap } from '@/lib/menu-storage';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { buildSystemPrompt, callOpenRouter } from '@/lib/openrouter';
import { resolveOpenRouterKeyFromRow } from '@/lib/resolve-openrouter-key';

export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const campaignId = session.user.campaign_id;
  const supabase = createServerClient();

  const [campaignRes, usersRes, tentsRes, menusRes] = await Promise.all([
    supabase.from('campaigns').select('openrouter_api_key, use_platform_ai').eq('id', campaignId).single(),
    supabase.from('users').select('age').eq('campaign_id', campaignId),
    supabase.from('tents').select('id').eq('campaign_id', campaignId),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
  ]);

  const apiKey = resolveOpenRouterKeyFromRow(campaignRes.data);
  if (!apiKey) {
    return NextResponse.json(
      {
        error: campaignRes.data?.use_platform_ai
          ? 'Platform AI paketi henüz aktif değil. Satıcıyla iletişime geçin.'
          : 'OpenRouter API anahtarı tanımlı değil. Admin → Ayarlar sayfasından girin.',
      },
      { status: 400 }
    );
  }

  const users = usersRes.data || [];
  const tents = tentsRes.data || [];
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

  const adultCount = users.filter((u) => u.age >= 15).length;
  const childCount = users.filter((u) => u.age < 15).length;

  const systemPrompt = buildSystemPrompt({
    totalPeople: users.length,
    adultCount,
    childCount,
    tentCount: tents.length || 1,
    menuDetails: menus,
  });

  try {
    await supabase
      .from('items')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('list_scope', 'shared')
      .eq('is_published', false)
      .eq('is_extra', false);

    const aiItems = await callOpenRouter(systemPrompt, apiKey);

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
      needed_count: 1,
      unit_label: 'adet',
      category: item.category,
      disposition: 'consumable' as const,
      list_scope: 'shared' as const,
      is_recommendation: false,
      is_standard: false,
      is_extra: false,
      is_published: false,
      price: 0,
      added_by: session.user!.id,
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

    return NextResponse.json({ items: data, count: data?.length || 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
