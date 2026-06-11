import { NextRequest, NextResponse } from 'next/server';
import { assertNoDuplicateItem } from '@/lib/item-duplicates';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createServerClient();

  if (body.name !== undefined) {
    const { data: existing } = await supabase
      .from('items')
      .select('id, list_scope')
      .eq('id', params.id)
      .eq('campaign_id', session.user.campaign_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Malzeme bulunamadı' }, { status: 404 });
    }

    const duplicate = await assertNoDuplicateItem(
      supabase,
      session.user.campaign_id,
      body.name,
      existing.list_scope,
      params.id
    );
    if (duplicate) {
      return NextResponse.json({ error: duplicate.error }, { status: 409 });
    }
  }

  const { data: item, error } = await supabase
    .from('items')
    .update(body)
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Sadece admin silebilir' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
