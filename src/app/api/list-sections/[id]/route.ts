import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SECTION_NAME, getOrCreateDefaultSection } from '@/lib/list-sections';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json({ error: 'Ad gerekli' }, { status: 400 });
    }
    updates.name = name;
  }
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('list_sections')
    .update(updates)
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ section: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const { data: section } = await supabase
    .from('list_sections')
    .select('id, list_scope, name')
    .eq('id', params.id)
    .eq('campaign_id', campaignId)
    .single();

  if (!section) {
    return NextResponse.json({ error: 'Bölüm bulunamadı' }, { status: 404 });
  }

  if (section.name === DEFAULT_SECTION_NAME) {
    return NextResponse.json({ error: '"Genel" bölümü silinemez' }, { status: 400 });
  }

  const fallbackId = await getOrCreateDefaultSection(
    supabase,
    campaignId,
    section.list_scope
  );

  if (fallbackId) {
    await supabase
      .from('items')
      .update({ section_id: fallbackId })
      .eq('section_id', params.id);
  } else {
    await supabase
      .from('items')
      .update({ section_id: null })
      .eq('section_id', params.id);
  }

  const { error } = await supabase.from('list_sections').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
