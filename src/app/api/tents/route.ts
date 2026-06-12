import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaignLimits,
  limitErrorMessage,
  upgradeHint,
} from '@/lib/campaign-limits';
import { formatTitleCase } from '@/lib/format';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('tents')
    .select('*')
    .eq('campaign_id', session.user.campaign_id)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tents: data });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const { name: rawName } = await request.json();
  const name = formatTitleCase(String(rawName || ''));
  if (!name) {
    return NextResponse.json({ error: 'Çadır adı gerekli' }, { status: 400 });
  }

  const supabase = createServerClient();
  const limits = await getCampaignLimits(supabase, session.user.campaign_id);
  if (!limits.can_add_tent) {
    return NextResponse.json(
      { error: limitErrorMessage('tent', limits), limits, upgrade: upgradeHint() },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('tents')
    .insert({ campaign_id: session.user.campaign_id, name })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tent: data });
}
