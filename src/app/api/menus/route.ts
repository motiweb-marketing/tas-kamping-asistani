import { NextRequest, NextResponse } from 'next/server';
import { addEntry, rowToFlatMenus } from '@/lib/menu-storage';
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
    .order('meal_type');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const menus = (data || []).flatMap((row) => rowToFlatMenus(row));
  return NextResponse.json({ menus });
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
    camp_day_number,
    is_departure = false,
  } = body as {
    day: string;
    period: MealPeriod;
    entry_kind: MenuEntryKind;
    camp_day_number: number;
    is_departure?: boolean;
  };

  if (!day || !period || !entry_kind || camp_day_number == null) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }

  const meal_type = period === 'breakfast' ? 'breakfast' : 'dinner';
  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const { data: existing } = await supabase
    .from('menus')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('day', day)
    .eq('meal_type', meal_type)
    .maybeSingle();

  const meta = { camp_day_number, is_departure };

  if (existing) {
    const newDescription = addEntry(existing.description || '', entry_kind, meta);
    const { data, error } = await supabase
      .from('menus')
      .update({ description: newDescription })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const menus = rowToFlatMenus(data);
    return NextResponse.json({ menu: menus[menus.length - 1] });
  }

  const description = addEntry('', entry_kind, meta);
  const { data, error } = await supabase
    .from('menus')
    .insert({
      campaign_id: campaignId,
      day,
      meal_type,
      description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const menus = rowToFlatMenus(data);
  return NextResponse.json({ menu: menus[menus.length - 1] });
}
