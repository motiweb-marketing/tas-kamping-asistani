import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { ItemClaimWithTent } from '@/types';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user?.tent_id) {
    return NextResponse.json({ error: 'Çadır atanmadı' }, { status: 400 });
  }

  const { item_id, quantity } = await request.json();
  const qty = Number(quantity);

  if (!item_id || !Number.isInteger(qty) || qty < 1) {
    return NextResponse.json({ error: 'Geçerli malzeme ve adet gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;
  const tentId = session.user.tent_id;

  const { data: item, error: itemErr } = await supabase
    .from('items')
    .select('id, list_scope, needed_count, is_published')
    .eq('id', item_id)
    .eq('campaign_id', campaignId)
    .single();

  if (itemErr || !item) {
    return NextResponse.json({ error: 'Malzeme bulunamadı' }, { status: 404 });
  }

  if (item.list_scope !== 'shared' || !item.is_published) {
    return NextResponse.json({ error: 'Yalnızca yayınlanmış ortak listeden üstlenilebilir' }, { status: 400 });
  }

  const { data: allClaims } = await supabase
    .from('item_claims')
    .select('id, item_id, tent_id, quantity')
    .eq('item_id', item_id);

  const claims = (allClaims || []) as ItemClaimWithTent[];
  const otherTotal = claims
    .filter((c) => c.tent_id !== tentId)
    .reduce((s, c) => s + c.quantity, 0);

  const needed = item.needed_count ?? 1;
  if (otherTotal + qty > needed) {
    return NextResponse.json(
      { error: `En fazla ${needed - otherTotal} adet üstlenebilir (toplam ${needed} gerekli)` },
      { status: 400 }
    );
  }

  const { data: claim, error } = await supabase
    .from('item_claims')
    .upsert(
      { item_id, tent_id: tentId, quantity: qty },
      { onConflict: 'item_id,tent_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from('items')
    .update({ assigned_tent_id: tentId })
    .eq('id', item_id)
    .is('assigned_tent_id', null);

  return NextResponse.json({ claim, claimed_total: otherTotal + qty });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user?.tent_id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const item_id = new URL(request.url).searchParams.get('item_id');
  if (!item_id) {
    return NextResponse.json({ error: 'item_id gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('item_claims')
    .delete()
    .eq('item_id', item_id)
    .eq('tent_id', session.user.tent_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
