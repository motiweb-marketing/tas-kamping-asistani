import { NextRequest, NextResponse } from 'next/server';
import { generateCampDayCards } from '@/lib/camp-slots';
import { rowsToDayMap, serializeDayMenu } from '@/lib/menu-storage';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

function buildDaysFromCampaign(
  campaign: {
    start_date: string;
    end_date: string;
    published_menu?: string | null;
    menu_ai_prompt?: string | null;
  },
  rows: { id: string; day: string; meal_type: 'breakfast' | 'dinner'; description: string }[],
  isAdmin: boolean
) {
  const cards = generateCampDayCards(campaign.start_date, campaign.end_date);
  const dayMap = rowsToDayMap(rows);

  let publishedDays: ReturnType<typeof generateCampDayCards> & {
    breakfast: string;
    meal: string;
    snack: string;
  }[] | null = null;

  if (campaign.published_menu) {
    try {
      publishedDays = JSON.parse(campaign.published_menu);
    } catch {
      publishedDays = null;
    }
  }

  const rawDays = cards.map((card) => {
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

  return {
    days: isAdmin ? rawDays : publishedDays?.length ? publishedDays : rawDays,
    published_days: publishedDays,
    menu_ai_prompt: campaign.menu_ai_prompt || '',
    is_published: !!publishedDays?.length,
  };
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const day = typeof body.day === 'string' ? body.day : '';
  const campDayNumber = Number(body.camp_day_number);

  if (!day || Number.isNaN(campDayNumber) || campDayNumber < 1) {
    return NextResponse.json(
      { error: 'Gün veya kamp günü numarası geçersiz' },
      { status: 400 }
    );
  }

  const description = serializeDayMenu(
    {
      breakfast: String(body.breakfast ?? ''),
      meal: String(body.meal ?? ''),
      snack: String(body.snack ?? ''),
    },
    {
      camp_day_number: campDayNumber,
      is_arrival: !!body.is_arrival,
      is_departure: !!body.is_departure,
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
  const isAdmin = session.user.role === 'admin';

  const [{ data: campaign, error: campErr }, { data: rows, error }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('start_date, end_date, published_menu, menu_ai_prompt')
      .eq('id', campaignId)
      .single(),
    supabase.from('menus').select('id, day, meal_type, description').eq('campaign_id', campaignId),
  ]);

  if (campErr || error) {
    return NextResponse.json({ error: error?.message || campErr?.message }, { status: 500 });
  }

  if (!campaign?.start_date || !campaign?.end_date) {
    return NextResponse.json({ days: [], published_days: null, menu_ai_prompt: '' });
  }

  const result = buildDaysFromCampaign(campaign, rows || [], isAdmin);

  if (isAdmin) {
    return NextResponse.json({
      days: result.days,
      published_days: result.published_days,
      menu_ai_prompt: result.menu_ai_prompt,
      is_published: result.is_published,
    });
  }

  return NextResponse.json({
    days: result.days,
    is_published: result.is_published,
  });
}
