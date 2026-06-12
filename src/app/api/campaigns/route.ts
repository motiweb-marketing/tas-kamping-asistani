import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { generateCampDutyPlan } from '@/lib/camp-plan';
import { ensureCampaignRecommendations } from '@/lib/recommendations';
import { formatPersonName, formatTitleCase } from '@/lib/format';
import { notifyNewTrialRegistration } from '@/lib/notify-owner';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      location = 'Kamp alanı',
      start_date,
      end_date,
      admin_name,
      admin_tent_name,
      admin_username,
      admin_password,
      admin_age,
    } = body;

    if (!name || !start_date || !end_date || !admin_name || !admin_tent_name || !admin_username || !admin_password) {
      return NextResponse.json({ error: 'Eksik alanlar var (kamp, admin adı, çadır adı, kullanıcı adı, şifre)' }, { status: 400 });
    }

    if (end_date < start_date) {
      return NextResponse.json({ error: 'Ayrılış tarihi varıştan önce olamaz' }, { status: 400 });
    }

    const supabase = createServerClient();
    const password_hash = await hashPassword(admin_password);

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: formatTitleCase(name),
        location: formatTitleCase(location),
        start_date,
        end_date,
        admin_id: null,
        plan_tier: 'trial',
        max_tents: 1,
        max_users: 2,
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: campaignError?.message || 'Kamp oluşturulamadı' }, { status: 500 });
    }

    const { data: tent, error: tentError } = await supabase
      .from('tents')
      .insert({
        campaign_id: campaign.id,
        name: formatTitleCase(admin_tent_name),
        max_capacity: 4,
      })
      .select()
      .single();

    if (tentError || !tent) {
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      return NextResponse.json({ error: tentError?.message || 'Çadır oluşturulamadı' }, { status: 500 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert({
        campaign_id: campaign.id,
        name: formatPersonName(admin_name),
        age: admin_age || 30,
        role: 'admin',
        username: admin_username,
        password_hash,
        tent_id: tent.id,
      })
      .select()
      .single();

    if (adminError || !admin) {
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      return NextResponse.json({ error: adminError?.message || 'Admin oluşturulamadı' }, { status: 500 });
    }

    await supabase.from('campaigns').update({ admin_id: admin.id }).eq('id', campaign.id);

    const dutyTemplates = generateCampDutyPlan(start_date, end_date);
    if (dutyTemplates.length) {
      await supabase.from('camp_duties').insert(
        dutyTemplates.map((t) => ({ campaign_id: campaign.id, ...t }))
      );
    }

    try {
      await ensureCampaignRecommendations(supabase, campaign.id);
    } catch (e) {
      console.warn('Önerilen listeler eklenemedi:', e);
    }

    const session = await getSession();
    session.user = {
      id: admin.id,
      campaign_id: campaign.id,
      tent_id: tent.id,
      name: admin.name,
      age: admin.age,
      role: 'admin',
      username: admin.username,
    };
    session.isLoggedIn = true;
    await session.save();

    void notifyNewTrialRegistration({
      campaignId: campaign.id,
      campaignName: campaign.name,
      location: campaign.location,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      adminName: admin.name,
      adminUsername: admin.username,
      adminTentName: tent.name,
    }).catch((e) => console.error('[notify] Deneme bildirimi başarısız:', e));

    const { password_hash: _, ...safeAdmin } = admin;
    return NextResponse.json({ campaign, admin: safeAdmin });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kamp oluşturulamadı';
    console.error('POST /api/campaigns:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, location, start_date, end_date')
    .order('start_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data });
}
