import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { formatPersonName } from '@/lib/format';
import { requirePlatformAdmin } from '@/lib/platform-auth';
import { syncAllListQuantities } from '@/lib/sync-ai-list-quantities';
import { isUsernameTaken, mapUserDbError, normalizeUsername } from '@/lib/user-validation';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const supabase = createServerClient();

  const { data: user, error: fetchErr } = await supabase
    .from('users')
    .select('id, campaign_id, role')
    .eq('id', params.id)
    .single();

  if (fetchErr || !user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }

  const campaignId = user.campaign_id;
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = formatPersonName(String(body.name));
    if (!name) {
      return NextResponse.json({ error: 'Ad gerekli' }, { status: 400 });
    }
    updates.name = name;
  }

  if (body.age !== undefined) updates.age = Number(body.age);

  if (body.tent_id !== undefined) updates.tent_id = body.tent_id || null;

  if (body.username !== undefined) {
    const cleanUsername = normalizeUsername(String(body.username));
    if (!cleanUsername) {
      return NextResponse.json({ error: 'Geçerli bir kullanıcı adı girin' }, { status: 400 });
    }
    if (await isUsernameTaken(supabase, campaignId, cleanUsername, params.id)) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' }, { status: 400 });
    }
    updates.username = cleanUsername;
  }

  if (body.password) {
    updates.password_hash = await hashPassword(String(body.password));
  }

  let newRole: 'admin' | 'user' | undefined;
  if (body.role !== undefined) {
    newRole = body.role === 'admin' ? 'admin' : 'user';

    if (user.role === 'admin' && newRole === 'user') {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('role', 'admin');

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'Kampın tek organizatörü var. Önce başka birini admin yapın.' },
          { status: 400 }
        );
      }
    }

    updates.role = newRole;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', params.id)
    .select('id, campaign_id, tent_id, name, age, role, username, last_login_at, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: mapUserDbError(error.message) }, { status: 500 });
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('admin_id')
    .eq('id', campaignId)
    .single();

  if (newRole === 'admin' && body.set_primary_admin) {
    await supabase.from('campaigns').update({ admin_id: params.id }).eq('id', campaignId);
  } else if (newRole === 'user' && campaign?.admin_id === params.id) {
    const { data: otherAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('role', 'admin')
      .neq('id', params.id)
      .limit(1)
      .maybeSingle();

    await supabase
      .from('campaigns')
      .update({ admin_id: otherAdmin?.id ?? null })
      .eq('id', campaignId);
  }

  try {
    await syncAllListQuantities(supabase, campaignId);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ user: data });
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
    await syncAllListQuantities(supabase, user.campaign_id);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true });
}
