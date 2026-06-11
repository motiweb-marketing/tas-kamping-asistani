import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import { buildSystemPrompt, callOpenRouter } from '@/lib/openrouter';

export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const campaignId = session.user.campaign_id;
  const supabase = createServerClient();

  const [campaignRes, usersRes, tentsRes, menusRes] = await Promise.all([
    supabase.from('campaigns').select('openrouter_api_key').eq('id', campaignId).single(),
    supabase.from('users').select('age').eq('campaign_id', campaignId),
    supabase.from('tents').select('id').eq('campaign_id', campaignId),
    supabase
      .from('menus')
      .select('day, meal_type, period, entry_kind, description')
      .eq('campaign_id', campaignId),
  ]);

  const apiKey = campaignRes.data?.openrouter_api_key;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: 'OpenRouter API anahtarı tanımlı değil. Admin → Ayarlar sayfasından girin.' },
      { status: 400 }
    );
  }

  const users = usersRes.data || [];
  const tents = tentsRes.data || [];
  const menus = (menusRes.data || []).filter((m) => m.description?.trim());

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
    const aiItems = await callOpenRouter(systemPrompt, apiKey);

    const rows = aiItems.map((item) => ({
      campaign_id: campaignId,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      is_extra: false,
      is_published: false,
      price: 0,
      added_by: session.user!.id,
    }));

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
