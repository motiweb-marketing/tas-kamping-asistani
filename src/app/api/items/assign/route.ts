import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (!session.user.tent_id) {
    return NextResponse.json({ error: 'Bir çadıra atanmamışsınız' }, { status: 400 });
  }

  const { item_id } = await request.json();
  if (!item_id) {
    return NextResponse.json({ error: 'item_id gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: existing, error: fetchErr } = await supabase
    .from('items')
    .select('id, list_scope, assigned_tent_id')
    .eq('id', item_id)
    .eq('campaign_id', session.user.campaign_id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Malzeme bulunamadı' }, { status: 404 });
  }

  if (existing.list_scope !== 'shared') {
    return NextResponse.json(
      { error: 'Yalnızca ortak alışveriş listesinden üstlenilebilir' },
      { status: 400 }
    );
  }

  if (existing.assigned_tent_id && existing.assigned_tent_id !== session.user.tent_id) {
    return NextResponse.json({ error: 'Bu malzeme başka bir çadır tarafından üstlenildi' }, { status: 409 });
  }

  const { data: item, error } = await supabase
    .from('items')
    .update({ assigned_tent_id: session.user.tent_id })
    .eq('id', item_id)
    .eq('campaign_id', session.user.campaign_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}
