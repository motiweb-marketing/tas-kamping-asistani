import { NextResponse } from 'next/server';
import { generateCampDutyPlan } from '@/lib/camp-plan';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('camp_duties')
    .select(`
      *,
      assigned_tent:tents!assigned_tent_id(id, name),
      assigned_user:users!assigned_user_id(id, name, role)
    `)
    .eq('campaign_id', session.user.campaign_id)
    .order('slot_date')
    .order('period');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ duties: data });
}

export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('start_date, end_date')
    .eq('id', session.user.campaign_id)
    .single();

  if (campErr || !campaign) {
    return NextResponse.json({ error: 'Kamp bulunamadı' }, { status: 404 });
  }

  const templates = generateCampDutyPlan(campaign.start_date, campaign.end_date);
  if (!templates.length) {
    return NextResponse.json({ error: 'Geçersiz kamp tarihleri' }, { status: 400 });
  }

  await supabase.from('camp_duties').delete().eq('campaign_id', session.user.campaign_id);

  const rows = templates.map((t) => ({
    campaign_id: session.user!.campaign_id,
    ...t,
  }));

  const { data, error } = await supabase.from('camp_duties').insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ duties: data, count: data?.length || 0 });
}
