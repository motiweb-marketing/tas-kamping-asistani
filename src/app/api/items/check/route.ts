import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { item_id, checked } = await request.json();
  if (!item_id || typeof checked !== 'boolean') {
    return NextResponse.json({ error: 'item_id ve checked gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: item, error: itemErr } = await supabase
    .from('items')
    .select('id, list_scope, campaign_id')
    .eq('id', item_id)
    .eq('campaign_id', session.user.campaign_id)
    .single();

  if (itemErr || !item) {
    return NextResponse.json({ error: 'Malzeme bulunamadı' }, { status: 404 });
  }

  if (item.list_scope === 'shared') {
    return NextResponse.json({ error: 'Ortak liste için işaretleme kullanılmaz' }, { status: 400 });
  }

  if (item.list_scope === 'tent' && !session.user.tent_id) {
    return NextResponse.json({ error: 'Çadır atanmadı' }, { status: 400 });
  }

  if (!checked) {
    await supabase
      .from('item_checks')
      .delete()
      .eq('item_id', item_id)
      .eq('user_id', session.user.id);
    return NextResponse.json({ ok: true, checked: false });
  }

  const { error } = await supabase.from('item_checks').upsert(
    {
      item_id,
      user_id: session.user.id,
      tent_id: item.list_scope === 'tent' ? session.user.tent_id : null,
    },
    { onConflict: 'item_id,user_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checked: true });
}
