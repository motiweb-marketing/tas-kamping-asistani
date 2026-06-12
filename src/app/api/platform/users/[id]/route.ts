import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/platform-auth';
import { syncStandardSharedItems } from '@/lib/sync-standard-items';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, campaign_id, role')
    .eq('id', params.id)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  if (user.role === 'admin') {
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', user.campaign_id)
      .eq('role', 'admin');

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: 'Kampın tek organizatörü silinemez. Önce kampı silin veya başka admin ekleyin.' },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase.from('users').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await syncStandardSharedItems(supabase, user.campaign_id);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true });
}
