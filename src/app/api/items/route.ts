import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get('published') !== 'false';
  const tentId = searchParams.get('tent_id');

  const supabase = createServerClient();
  let query = supabase
    .from('items')
    .select(`
      *,
      added_by_user:users!added_by(id, name),
      assigned_tent:tents!assigned_tent_id(id, name)
    `)
    .eq('campaign_id', session.user.campaign_id)
    .order('created_at', { ascending: true });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  if (tentId) {
    query = query.eq('assigned_tent_id', tentId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await request.json();
  const { name, quantity = '1', category = 'food', price = 0 } = body;

  if (!name) {
    return NextResponse.json({ error: 'İsim gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: item, error } = await supabase
    .from('items')
    .insert({
      campaign_id: session.user.campaign_id,
      name,
      quantity,
      category,
      added_by: session.user.id,
      is_extra: true,
      is_published: true,
      price,
    })
    .select()
    .single();

  if (error || !item) {
    return NextResponse.json({ error: error?.message || 'Eklenemedi' }, { status: 500 });
  }

  await supabase.from('chat_messages').insert({
    campaign_id: session.user.campaign_id,
    user_id: session.user.id,
    message: `${session.user.name} listeye ${name} ekledi`,
    is_system: true,
  });

  return NextResponse.json({ item });
}
