import { NextRequest, NextResponse } from 'next/server';
import { ensureCampaignRecommendations } from '@/lib/recommendations';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { ItemListScope, ItemWithRelations } from '@/types';

function enrichWithChecks(
  items: ItemWithRelations[],
  checks: { item_id: string; user_id: string; tent_id: string | null }[],
  userId: string,
  tentId: string | null
): ItemWithRelations[] {
  return items.map((item) => {
    const myCheck = checks.find((c) => c.item_id === item.id && c.user_id === userId);
    const tentCheck = tentId
      ? checks.find((c) => c.item_id === item.id && c.tent_id === tentId)
      : undefined;
    return {
      ...item,
      checked: !!myCheck,
      tent_checked: !!tentCheck,
    };
  });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get('published') !== 'false';
  const tentId = searchParams.get('tent_id');
  const scope = searchParams.get('scope') as ItemListScope | 'all' | null;
  const recommendationsOnly = searchParams.get('recommendations') === 'true';

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  try {
    await ensureCampaignRecommendations(supabase, campaignId);
  } catch {
    /* migration henüz uygulanmamış olabilir */
  }

  let query = supabase
    .from('items')
    .select(`
      *,
      added_by_user:users!added_by(id, name),
      assigned_tent:tents!assigned_tent_id(id, name)
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  if (scope && scope !== 'all') {
    query = query.eq('list_scope', scope);
  }

  if (recommendationsOnly) {
    query = query.eq('is_recommendation', true);
  }

  if (tentId) {
    query = query.eq('assigned_tent_id', tentId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data || []) as ItemWithRelations[];
  const needsChecks = items.some(
    (i) => i.list_scope === 'personal' || i.list_scope === 'tent'
  );

  if (!needsChecks) {
    return NextResponse.json({ items });
  }

  const itemIds = items.map((i) => i.id);
  const { data: checks } = await supabase
    .from('item_checks')
    .select('item_id, user_id, tent_id')
    .in('item_id', itemIds);

  return NextResponse.json({
    items: enrichWithChecks(
      items,
      checks || [],
      session.user.id,
      session.user.tent_id
    ),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    quantity = '1',
    category = 'food',
    price = 0,
    list_scope = 'shared',
    is_recommendation = false,
    notes = '',
  } = body;

  if (!name) {
    return NextResponse.json({ error: 'İsim gerekli' }, { status: 400 });
  }

  const isAdminRecommendation =
    session.user.role === 'admin' && is_recommendation && list_scope !== 'shared';

  if (list_scope !== 'shared' && !isAdminRecommendation) {
    return NextResponse.json({ error: 'Yalnızca ortak listeye ekleme yapılabilir' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data: item, error } = await supabase
    .from('items')
    .insert({
      campaign_id: session.user.campaign_id,
      name,
      quantity,
      category,
      list_scope,
      notes: notes || null,
      is_extra: list_scope === 'shared' && !is_recommendation,
      is_published: isAdminRecommendation || list_scope === 'shared',
      is_recommendation: !!is_recommendation,
      price,
      added_by: session.user.id,
    })
    .select()
    .single();

  if (error || !item) {
    return NextResponse.json({ error: error?.message || 'Eklenemedi' }, { status: 500 });
  }

  if (list_scope === 'shared') {
    await supabase.from('chat_messages').insert({
      campaign_id: session.user.campaign_id,
      user_id: session.user.id,
      message: `${session.user.name} ortak listeye ${name} ekledi`,
      is_system: true,
    });
  }

  return NextResponse.json({ item });
}
