import { NextResponse } from 'next/server';
import { dayMenuToFlat, rowsToDayMap } from '@/lib/menu-storage';
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
    .select('id, day, meal_type, description')
    .eq('campaign_id', session.user.campaign_id)
    .order('day');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dayMap = rowsToDayMap(data || []);
  const menus = Array.from(dayMap.entries()).flatMap(([day, { content }]) =>
    dayMenuToFlat(day, content)
  );

  return NextResponse.json({ menus });
}
