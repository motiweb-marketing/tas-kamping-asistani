import { NextRequest, NextResponse } from 'next/server';
import { ensureListSections } from '@/lib/list-sections';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { ItemListScope } from '@/types';

const SCOPES: ItemListScope[] = ['personal', 'tent', 'shared'];

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const scope = request.nextUrl.searchParams.get('scope') as ItemListScope | null;
  if (!scope || !SCOPES.includes(scope)) {
    return NextResponse.json({ error: 'Geçerli scope gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  try {
    await ensureListSections(supabase, campaignId, [scope]);
  } catch {
    /* migration pending */
  }

  const { data: sections, error } = await supabase
    .from('list_sections')
    .select('id, campaign_id, list_scope, name, sort_order, created_at')
    .eq('campaign_id', campaignId)
    .eq('list_scope', scope)
    .order('sort_order')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: items } = await supabase
    .from('items')
    .select('section_id')
    .eq('campaign_id', campaignId)
    .eq('list_scope', scope);

  const counts = new Map<string, number>();
  for (const item of items || []) {
    if (item.section_id) {
      counts.set(item.section_id, (counts.get(item.section_id) || 0) + 1);
    }
  }

  const withCounts = (sections || []).map((s) => ({
    ...s,
    item_count: counts.get(s.id) || 0,
  }));

  return NextResponse.json({ sections: withCounts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const { name, list_scope } = body as { name?: string; list_scope?: ItemListScope };

  if (!name?.trim() || !list_scope || !SCOPES.includes(list_scope)) {
    return NextResponse.json({ error: 'Ad ve scope gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const { data: maxRow } = await supabase
    .from('list_sections')
    .select('sort_order')
    .eq('campaign_id', campaignId)
    .eq('list_scope', list_scope)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('list_sections')
    .insert({
      campaign_id: campaignId,
      list_scope,
      name: name.trim(),
      sort_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ section: { ...data, item_count: 0 } });
}
