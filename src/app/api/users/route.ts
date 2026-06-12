import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import {
  countUsersInTent,
  getCampaignLimits,
  limitErrorMessage,
  tentCapacity,
  upgradeHint,
} from '@/lib/campaign-limits';
import { formatPersonName } from '@/lib/format';
import { syncStandardSharedItems } from '@/lib/sync-standard-items';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, campaign_id, tent_id, name, age, role, username, created_at')
    .eq('campaign_id', session.user.campaign_id)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await request.json();
  const { name, age, tent_id, username, password, role = 'user' } = body;

  if (!name || !username || !password) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }

  const password_hash = await hashPassword(password);
  const supabase = createServerClient();

  const limits = await getCampaignLimits(supabase, session.user.campaign_id);
  if (!limits.can_add_user) {
    return NextResponse.json(
      { error: limitErrorMessage('user', limits), limits, upgrade: upgradeHint() },
      { status: 403 }
    );
  }

  if (tent_id) {
    const { data: tent } = await supabase
      .from('tents')
      .select('max_capacity')
      .eq('id', tent_id)
      .eq('campaign_id', session.user.campaign_id)
      .single();

    const cap = tentCapacity(tent || {}, limits.plan_tier);
    const inTent = await countUsersInTent(supabase, tent_id);
    if (inTent >= cap) {
      return NextResponse.json(
        { error: limitErrorMessage('tent_full', limits, cap), limits },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      campaign_id: session.user.campaign_id,
      name: formatPersonName(name),
      age: age || 30,
      tent_id: tent_id || null,
      username,
      password_hash,
      role,
    })
    .select('id, campaign_id, tent_id, name, age, role, username, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await syncStandardSharedItems(supabase, session.user.campaign_id);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ user: data });
}
