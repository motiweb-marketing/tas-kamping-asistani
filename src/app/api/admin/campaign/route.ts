import { NextRequest, NextResponse } from 'next/server';
import { generateCampDutyPlan } from '@/lib/camp-plan';
import {
  mergeCampSetupProfile,
  migrateLegacyMenuPrompt,
  normalizeCampSetupProfile,
} from '@/lib/camp-setup-profile';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

const CAMPAIGN_SELECT =
  'id, name, location, start_date, end_date, menu_ai_prompt, adult_accommodation_fee, child_accommodation_fee, accommodation_use_age_pricing, accommodation_child_age_max, camp_setup_profile';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select(CAMPAIGN_SELECT)
    .eq('id', session.user.campaign_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Kamp bulunamadı' }, { status: 404 });
  }

  let profile = normalizeCampSetupProfile(data.camp_setup_profile);
  profile = migrateLegacyMenuPrompt(profile, data.menu_ai_prompt);

  if (
    profile.legacy_menu_prompt &&
    JSON.stringify(data.camp_setup_profile || {}) !== JSON.stringify(profile)
  ) {
    await supabase
      .from('campaigns')
      .update({ camp_setup_profile: profile })
      .eq('id', session.user.campaign_id);
  }

  return NextResponse.json({
    campaign: { ...data, camp_setup_profile: profile },
    camp_setup_profile: profile,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const {
    start_date,
    end_date,
    name,
    location,
    menu_ai_prompt,
    adult_accommodation_fee,
    child_accommodation_fee,
    accommodation_use_age_pricing,
    accommodation_child_age_max,
    camp_setup_profile,
  } = body;

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const updates: Record<string, string | number | boolean | object> = {};
  if (start_date) updates.start_date = start_date;
  if (end_date) updates.end_date = end_date;
  if (name) updates.name = name;
  if (location) updates.location = location;
  if (menu_ai_prompt !== undefined) updates.menu_ai_prompt = String(menu_ai_prompt);

  if (adult_accommodation_fee !== undefined) {
    const fee = Number(adult_accommodation_fee);
    if (Number.isNaN(fee) || fee < 0) {
      return NextResponse.json({ error: 'Geçerli yetişkin konaklama ücreti girin' }, { status: 400 });
    }
    updates.adult_accommodation_fee = fee;
  }

  if (child_accommodation_fee !== undefined) {
    const fee = Number(child_accommodation_fee);
    if (Number.isNaN(fee) || fee < 0) {
      return NextResponse.json({ error: 'Geçerli çocuk konaklama ücreti girin' }, { status: 400 });
    }
    updates.child_accommodation_fee = fee;
  }

  if (accommodation_use_age_pricing !== undefined) {
    updates.accommodation_use_age_pricing = !!accommodation_use_age_pricing;
  }

  if (accommodation_child_age_max !== undefined) {
    const ageMax = Number(accommodation_child_age_max);
    if (Number.isNaN(ageMax) || ageMax < 0 || ageMax > 99) {
      return NextResponse.json({ error: 'Geçerli çocuk yaş sınırı girin (0–99)' }, { status: 400 });
    }
    updates.accommodation_child_age_max = ageMax;
  }

  if (camp_setup_profile !== undefined) {
    const { data: existing } = await supabase
      .from('campaigns')
      .select('camp_setup_profile, menu_ai_prompt')
      .eq('id', campaignId)
      .single();

    const current = migrateLegacyMenuPrompt(
      normalizeCampSetupProfile(existing?.camp_setup_profile),
      existing?.menu_ai_prompt
    );
    updates.camp_setup_profile = mergeCampSetupProfile(
      current,
      camp_setup_profile as Parameters<typeof mergeCampSetupProfile>[1]
    );
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('campaigns')
    .select('start_date, end_date')
    .eq('id', campaignId)
    .single();

  const effectiveStart = String(updates.start_date ?? existing?.start_date ?? '');
  const effectiveEnd = String(updates.end_date ?? existing?.end_date ?? '');
  if (effectiveStart && effectiveEnd && effectiveEnd < effectiveStart) {
    return NextResponse.json({ error: 'Ayrılış tarihi varıştan önce olamaz' }, { status: 400 });
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select(CAMPAIGN_SELECT)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ error: error?.message || 'Güncellenemedi' }, { status: 500 });
  }

  const datesChanged =
    (updates.start_date && updates.start_date !== existing?.start_date) ||
    (updates.end_date && updates.end_date !== existing?.end_date);

  let dutiesRegenerated = 0;
  if (datesChanged && campaign.start_date && campaign.end_date) {
    const dutyTemplates = generateCampDutyPlan(campaign.start_date, campaign.end_date);
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
  }

  return NextResponse.json({ campaign, duties_regenerated: dutiesRegenerated });
}
