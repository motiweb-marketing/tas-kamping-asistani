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
    .from('menus')
    .select('*')
    .eq('campaign_id', session.user.campaign_id)
    .order('day', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ menus: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const { day, meal_type, description } = body;

  if (!day || !meal_type || !description) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('menus')
    .upsert(
      {
        campaign_id: session.user.campaign_id,
        day,
        meal_type,
        description,
      },
      { onConflict: 'campaign_id,day,meal_type' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ menu: data });
}
