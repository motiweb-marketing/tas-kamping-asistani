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
    .from('chat_messages')
    .select('*, users(id, name)')
    .eq('campaign_id', session.user.campaign_id)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = (data || []).map((msg) => ({
    ...msg,
    user: msg.users || null,
    users: undefined,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      campaign_id: session.user.campaign_id,
      user_id: session.user.id,
      message: message.trim(),
      is_system: false,
    })
    .select('*, users(id, name)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: { ...data, user: data.users || null, users: undefined },
  });
}
