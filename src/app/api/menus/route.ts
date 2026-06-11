import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';
import type { MenuEntryKind, MealPeriod } from '@/types';

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
    .order('day')
    .order('period')
    .order('sort_order');

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
  const {
    day,
    period,
    entry_kind,
    description = '',
    camp_day_number,
    is_departure = false,
  } = body as {
    day: string;
    period: MealPeriod;
    entry_kind: MenuEntryKind;
    description?: string;
    camp_day_number: number;
    is_departure?: boolean;
  };

  if (!day || !period || !entry_kind || camp_day_number == null) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from('menus')
    .select('sort_order')
    .eq('campaign_id', session.user.campaign_id)
    .eq('day', day)
    .eq('period', period)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sort_order = (existing?.[0]?.sort_order ?? -1) + 1;

  const meal_type = period === 'breakfast' ? 'breakfast' : 'dinner';

  const { data, error } = await supabase
    .from('menus')
    .insert({
      campaign_id: session.user.campaign_id,
      day,
      meal_type,
      period,
      entry_kind,
      description: String(description).trim(),
      camp_day_number,
      is_departure,
      sort_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ menu: data });
}
