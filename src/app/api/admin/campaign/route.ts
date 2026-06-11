import { NextRequest, NextResponse } from 'next/server';
import { generateCampDutyPlan } from '@/lib/camp-plan';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const { start_date, end_date, name, location } = await request.json();

  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'Varış ve ayrılış tarihleri gerekli' }, { status: 400 });
  }

  if (end_date < start_date) {
    return NextResponse.json({ error: 'Ayrılış tarihi varıştan önce olamaz' }, { status: 400 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const updates: Record<string, string> = { start_date, end_date };
  if (name) updates.name = name;
  if (location) updates.location = location;

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select('id, name, location, start_date, end_date')
    .single();

  if (error || !campaign) {
    return NextResponse.json({ error: error?.message || 'Güncellenemedi' }, { status: 500 });
  }

  let dutiesRegenerated = 0;
  const dutyTemplates = generateCampDutyPlan(start_date, end_date);
  const { error: dutyDelErr } = await supabase
    .from('camp_duties')
    .delete()
    .eq('campaign_id', campaignId);
  if (!dutyDelErr && dutyTemplates.length) {
    const { error: dutyInsErr } = await supabase.from('camp_duties').insert(
      dutyTemplates.map((t) => ({ campaign_id: campaignId, ...t }))
    );
    if (!dutyInsErr) dutiesRegenerated = dutyTemplates.length;
  }

  return NextResponse.json({ campaign, duties_regenerated: dutiesRegenerated });
}
