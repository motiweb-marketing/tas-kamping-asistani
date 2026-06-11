import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('camp_expenses')
    .select(`
      *,
      tent:tents(id, name),
      item:items(id, name, list_scope, is_recommendation),
      created_by_user:users!created_by(id, name)
    `)
    .eq('campaign_id', session.user.campaign_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ expenses: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user?.tent_id) {
    return NextResponse.json({ error: 'Çadır atanmadı' }, { status: 400 });
  }

  const body = await request.json();
  const { item_id, amount, description = '' } = body;
  const parsedAmount = Number(amount);

  if (!item_id || Number.isNaN(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json({ error: 'Malzeme ve geçerli tutar gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: item, error: itemErr } = await supabase
    .from('items')
    .select('id, list_scope, is_recommendation, disposition')
    .eq('id', item_id)
    .eq('campaign_id', session.user.campaign_id)
    .single();

  if (itemErr || !item) {
    return NextResponse.json({ error: 'Malzeme bulunamadı' }, { status: 404 });
  }

  if (item.list_scope !== 'shared' || item.is_recommendation) {
    return NextResponse.json(
      { error: 'Harcama yalnızca ortak alışveriş malzemelerine eklenebilir' },
      { status: 400 }
    );
  }

  const { data: expense, error } = await supabase
    .from('camp_expenses')
    .insert({
      campaign_id: session.user.campaign_id,
      item_id,
      tent_id: session.user.tent_id,
      amount: parsedAmount,
      description: String(description),
      created_by: session.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ expense });
}
