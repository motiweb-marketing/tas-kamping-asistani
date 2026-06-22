import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/platform-auth';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServerClient();
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(
      'id, name, location, plan_tier, max_tents, max_users, use_platform_ai, platform_notes, owner_contact_name, owner_contact_email, start_date, end_date, created_at, openrouter_api_key'
    )
    .eq('id', params.id)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ error: 'Kamp bulunamadı' }, { status: 404 });
  }

  const [tentsRes, usersRes] = await Promise.all([
    supabase.from('tents').select('id, name, max_capacity, created_at').eq('campaign_id', params.id).order('name'),
    supabase
      .from('users')
      .select('id, name, age, role, username, tent_id, last_login_at, created_at')
      .eq('campaign_id', params.id)
      .order('name'),
  ]);

  const { openrouter_api_key: _, ...safeCampaign } = campaign;

  return NextResponse.json({
    campaign: {
      ...safeCampaign,
      has_own_ai_key: Boolean(campaign.openrouter_api_key?.trim()),
    },
    tents: tentsRes.data || [],
    users: usersRes.data || [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.plan_tier === 'trial' || body.plan_tier === 'paid') {
    updates.plan_tier = body.plan_tier;
    if (body.plan_tier === 'paid') {
      if (body.max_tents === undefined) {
        updates.max_tents = 99;
        updates.max_users = 99;
      }
      updates.use_platform_ai = true;
    }
    if (body.plan_tier === 'trial' && body.max_tents === undefined) {
      updates.max_tents = 1;
      updates.max_users = 2;
      updates.use_platform_ai = false;
    }
  }

  if (body.max_tents !== undefined) updates.max_tents = Number(body.max_tents);
  if (body.max_users !== undefined) updates.max_users = Number(body.max_users);
  if (body.platform_notes !== undefined) updates.platform_notes = String(body.platform_notes || '');
  if (body.owner_contact_name !== undefined) {
    updates.owner_contact_name = body.owner_contact_name || null;
  }
  if (body.owner_contact_email !== undefined) {
    updates.owner_contact_email = body.owner_contact_email || null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', params.id)
    .select(
      'id, name, plan_tier, max_tents, max_users, use_platform_ai, platform_notes, owner_contact_name, owner_contact_email'
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('campaigns').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
