import { NextRequest, NextResponse } from 'next/server';
import {
  countUsersInTent,
  getCampaignLimits,
  maxUsersPerTent,
} from '@/lib/campaign-limits';
import { formatTitleCase } from '@/lib/format';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  const supabase = createServerClient();

  if (body.name !== undefined) {
    const name = formatTitleCase(String(body.name));
    if (!name) {
      return NextResponse.json({ error: 'Çadır adı gerekli' }, { status: 400 });
    }
    updates.name = name;
  }

  if (body.max_capacity !== undefined) {
    const cap = Number(body.max_capacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 99) {
      return NextResponse.json({ error: 'Kapasite 1–99 arasında tam sayı olmalı' }, { status: 400 });
    }

    const limits = await getCampaignLimits(supabase, session.user.campaign_id);
    const planMax = maxUsersPerTent(limits.plan_tier);
    if (cap > planMax) {
      return NextResponse.json(
        {
          error:
            limits.plan_tier === 'trial'
              ? `Deneme sürümünde çadır kapasitesi en fazla ${planMax} kişi olabilir.`
              : `Çadır kapasitesi en fazla ${planMax} kişi olabilir.`,
        },
        { status: 400 }
      );
    }

    const inTent = await countUsersInTent(supabase, params.id);
    if (cap < inTent) {
      return NextResponse.json(
        { error: `Çadırda şu an ${inTent} kişi var; kapasite bundan az olamaz.` },
        { status: 400 }
      );
    }

    updates.max_capacity = cap;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('tents')
    .update(updates)
    .eq('id', params.id)
    .eq('campaign_id', session.user.campaign_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tent: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const campaignId = session.user.campaign_id;

  const { count: tentCount, error: countError } = await supabase
    .from('tents')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((tentCount ?? 0) <= 1) {
    return NextResponse.json(
      { error: 'En az bir çadır kalmalı. Son çadırı silemezsiniz.' },
      { status: 400 }
    );
  }

  const { data: tent, error: tentError } = await supabase
    .from('tents')
    .select('id')
    .eq('id', params.id)
    .eq('campaign_id', campaignId)
    .maybeSingle();

  if (tentError) {
    return NextResponse.json({ error: tentError.message }, { status: 500 });
  }

  if (!tent) {
    return NextResponse.json({ error: 'Çadır bulunamadı' }, { status: 404 });
  }

  await supabase
    .from('items')
    .update({ assigned_tent_id: null })
    .eq('assigned_tent_id', params.id);

  await supabase
    .from('camp_duties')
    .update({ assigned_tent_id: null })
    .eq('assigned_tent_id', params.id);

  const { error } = await supabase
    .from('tents')
    .delete()
    .eq('id', params.id)
    .eq('campaign_id', campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
