import { NextResponse } from 'next/server';
import { calculateBudget } from '@/lib/budget';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const campaignId = session.user.campaign_id;
  const supabase = createServerClient();

  const [campaignRes, usersRes, tentsRes, itemsRes] = await Promise.all([
    supabase.from('campaigns').select('id, name').eq('id', campaignId).single(),
    supabase
      .from('users')
      .select('id, campaign_id, tent_id, name, age, role, username, created_at')
      .eq('campaign_id', campaignId),
    supabase.from('tents').select('*').eq('campaign_id', campaignId),
    supabase.from('items').select('*').eq('campaign_id', campaignId),
  ]);

  if (!campaignRes.data) {
    return NextResponse.json({ error: 'Kamp bulunamadı' }, { status: 404 });
  }

  const summary = calculateBudget(
    campaignRes.data,
    usersRes.data || [],
    tentsRes.data || [],
    itemsRes.data || []
  );

  return NextResponse.json({ budget: summary });
}
