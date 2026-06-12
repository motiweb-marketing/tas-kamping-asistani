import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      'id, name, location, start_date, end_date, adult_accommodation_fee, child_accommodation_fee, accommodation_use_age_pricing, accommodation_child_age_max'
    )
    .eq('id', session.user.campaign_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Kamp bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ campaign: data });
}
