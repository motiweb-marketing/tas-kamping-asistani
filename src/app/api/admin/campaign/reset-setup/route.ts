import { NextResponse } from 'next/server';
import { DEFAULT_CAMP_SETUP_PROFILE } from '@/lib/camp-setup-profile';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .update({ camp_setup_profile: DEFAULT_CAMP_SETUP_PROFILE })
    .eq('id', session.user.campaign_id)
    .select('camp_setup_profile')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    camp_setup_profile: data?.camp_setup_profile ?? DEFAULT_CAMP_SETUP_PROFILE,
  });
}
