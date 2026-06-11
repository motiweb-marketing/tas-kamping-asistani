import { NextRequest, NextResponse } from 'next/server';
import { generateCampDayCards } from '@/lib/camp-slots';
import { rowsToDayMap, serializeDayMenu } from '@/lib/menu-storage';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const {
    day,
    camp_day_number,
    is_arrival,
    is_departure,
    breakfast,
    meal,
    snack,
  } = body;

  if (!day || camp_day_number == null) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }

  const description = serializeDayMenu(
    {
      breakfast: breakfast ?? '',
      meal: meal ?? '',
      snack: snack ?? '',
    },
    {
      camp_day_number,
      is_arrival: !!is_arrival,
      is_departure: !!is_departure,
    }
  );

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  await supabase.from('menus').delete().eq('campaign_id', campaignId).eq('day', day);

  const { data, error } = await supabase
    .from('menus')
    .insert({
      campaign_id: campaignId,
      day,
      meal_type: 'breakfast',
      description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, row: data });
}

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const [{ data: campaign }, { data: rows, error }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('start_date, end_date')
      .eq('id', campaignId)
      .single(),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!campaign?.start_date || !campaign?.end_date) {
    return NextResponse.json({ days: [] });
  }

  const cards = generateCampDayCards(campaign.start_date, campaign.end_date);
  const dayMap = rowsToDayMap(rows || []);

  const days = cards.map((card) => {
    const stored = dayMap.get(card.date);
    const content = stored?.content ?? { breakfast: '', meal: '', snack: '' };
    return {
      ...card,
      row_id: stored?.row_id ?? null,
      breakfast: content.breakfast,
      meal: content.meal,
      snack: content.snack,
    };
  });

  return NextResponse.json({ days });
}
